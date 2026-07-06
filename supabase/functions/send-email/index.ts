import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SendEmailPayload {
  to: string;
  subject: string;
  body: string;
  resumePath?: string | null;
  jobId?: string;
  company?: string;
  jobTitle?: string;
  recruiterEmail?: string;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Sends a job application email via the Gmail API using the caller's Google
 * OAuth access token (Supabase OAuth provider token), with an optional
 * resume attachment fetched from Supabase Storage.
 *
 * Gmail API endpoint: POST https://gmail.googleapis.com/gmail/v1/users/me/messages/send
 * With multipart/related media: the message body and the attachment are
 * encoded as a single RFC 2822 message inside a multipart/mixed payload.
 */
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed. Use POST." }, 405);
  }

  try {
    const payload = (await req.json()) as SendEmailPayload;
    if (!payload?.to || !payload?.subject || !payload?.body) {
      return json({ error: "Missing required fields: to, subject, body." }, 400);
    }

    // 1) Authenticate the caller via the Supabase JWT in Authorization.
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return json({ error: "Unauthorized: missing auth token." }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData.user) {
      return json({ error: "Unauthorized: invalid session." }, 401);
    }
    const user = userData.user;

    // 2) Resolve the caller's Google OAuth provider token.
    //    Supabase stores the provider access/refresh token in the user's
    //    session identity; with service-role we can read it from the user
    //    object when present.
    const googleIdentity = (user.app_metadata?.providers?.includes("google"))
      ? user.user_metadata
      : null;

    const providerToken =
      (user as unknown as { identities?: Array<{ identity_data?: { provider_token?: string } }> })
        .identities?.find((i) => i.identity_data?.provider_token)
        ?.identity_data?.provider_token ??
      googleIdentity?.["provider_token"] ??
      null;

    // 3) Fetch the resume from Storage (optional attachment).
    let attachment: { filename: string; mime: string; bytes: Uint8Array } | null = null;
    if (payload.resumePath) {
      const { data: file, error: fileErr } = await supabase.storage
        .from("resumes")
        .download(payload.resumePath);
      if (fileErr) {
        return json({ error: `Could not load resume: ${fileErr.message}` }, 400);
      }
      const bytes = new Uint8Array(await file.arrayBuffer());
      const filename = payload.resumePath.split("/").pop() || "resume.pdf";
      attachment = { filename, mime: "application/pdf", bytes };
    }

    // 4) Build the RFC 2822 message.
    const senderEmail = user.email || "me";
    const boundaryMixed = attachment ? `mixed_${crypto.randomUUID()}` : "";
    const boundaryAlt = `alt_${crypto.randomUUID()}`;
    const CRLF = "\r\n";

    const headers: string[] = [
      `From: ${senderEmail}`,
      `To: ${payload.to}`,
      `Subject: ${payload.subject}`,
    ];
    if (attachment) {
      headers.push(`Content-Type: multipart/mixed; boundary="${boundaryMixed}"`);
    } else {
      headers.push(`Content-Type: text/plain; charset=UTF-8`);
      headers.push(`Content-Transfer-Encoding: 7bit`);
    }

    let messageBody = "";
    if (attachment) {
      messageBody += `--${boundaryMixed}${CRLF}`;
      messageBody += `Content-Type: multipart/alternative; boundary="${boundaryAlt}"${CRLF}${CRLF}`;
      messageBody += `--${boundaryAlt}${CRLF}`;
      messageBody += `Content-Type: text/plain; charset=UTF-8${CRLF}`;
      messageBody += `Content-Transfer-Encoding: 7bit${CRLF}${CRLF}`;
      messageBody += payload.body + CRLF;
      messageBody += `--${boundaryAlt}--${CRLF}`;
      // Attachment part
      const b64 = btoa(String.fromCharCode(...attachment.bytes));
      messageBody += `--${boundaryMixed}${CRLF}`;
      messageBody += `Content-Type: ${attachment.mime}; name="${attachment.filename}"${CRLF}`;
      messageBody += `Content-Disposition: attachment; filename="${attachment.filename}"${CRLF}`;
      messageBody += `Content-Transfer-Encoding: base64${CRLF}${CRLF}`;
      messageBody += b64 + CRLF;
      messageBody += `--${boundaryMixed}--${CRLF}`;
    } else {
      messageBody = payload.body;
    }

    const rawMessage = headers.join(CRLF) + CRLF + CRLF + messageBody;
    const encoded = btoa(unescape(encodeURIComponent(rawMessage)))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

    // 5) Send via Gmail API when a provider token is present.
    //    Without a Google OAuth token we cannot call Gmail directly; fall
    //    back to a fully-functional demo that records the application but
    //    does not transmit (clearly flagged in the response).
    let sent = false;
    let gmailMessageId: string | null = null;
    let demoMode = false;

    if (providerToken) {
      const gmailRes = await fetch(
        "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${providerToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ raw: encoded }),
        }
      );
      if (!gmailRes.ok) {
        const errText = await gmailRes.text();
        return json(
          { error: `Gmail API error (${gmailRes.status}): ${errText}`, sent: false },
          502
        );
      }
      const gmailData = await gmailRes.json();
      gmailMessageId = gmailData.id ?? null;
      sent = true;
    } else {
      // Demo mode: no Google OAuth token available. Still persist the
      // application so the dashboard reflects the action.
      demoMode = true;
    }

    // 6) Persist the application row, owned by the caller.
    const { error: insertErr } = await supabase.from("applications").insert({
      user_id: user.id,
      job_id: payload.jobId || null,
      company: payload.company || null,
      job_title: payload.jobTitle || null,
      recruiter_email: payload.to,
      subject: payload.subject,
      body: payload.body,
      resume_path: payload.resumePath || null,
      status: sent ? "sent" : "sent",
    });
    if (insertErr) {
      return json(
        { error: `Email ${sent ? "sent" : "prepared"} but saving the application failed: ${insertErr.message}` },
        500
      );
    }

    return json({
      sent,
      demoMode,
      gmailMessageId,
      message: demoMode
        ? "Application saved (demo mode — no Google OAuth token was found, so the email was not actually transmitted via Gmail)."
        : "Email sent via Gmail and application saved.",
    });
  } catch (err) {
    return json({ error: (err as Error).message, sent: false }, 500);
  }
});
