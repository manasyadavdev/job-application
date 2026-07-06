# Job Auto Apply Assistant

A full-stack web app that lets you search a curated list of **mock** job
openings, upload a PDF résumé, and send pre-filled application emails to
recruiters via the **Gmail API** with **Google OAuth 2.0**.

> **Important / compliance:** This project uses **sample/mock job data only**.
> It does **not** scrape, automate, or bypass any third-party job site
> (LinkedIn, Indeed, etc.). It uses only official Google OAuth and the Gmail
> API.

---

## Features

- **Google OAuth 2.0** sign-in (plus optional email/password auth for demo).
- **Job search** with keyword + job-type filters (Full Time / Contract / Internship).
- **Mock job board** showing company name, job title, recruiter email, posted date, location, salary, tags.
- **PDF résumé upload** (PDF-only validation, max 10 MB) stored privately per user.
- **Apply workflow** — clicking *Apply* opens a pre-filled email form:
  - Recipient prefilled with the recruiter's email.
  - Subject prefilled as `Application for <Job Title>`.
  - Editable email body.
  - Uploaded résumé attached automatically.
  - Sent via the **Gmail API** after Google authorization.
- **Dashboard** listing every sent application with company, recruiter email,
  date, and status (sent / opened / replied), plus delete and filter.
- Responsive design, loading skeletons, success/error toasts, empty states.

---

## Tech stack

| Layer        | Tech                                                    |
| ------------ | ------------------------------------------------------- |
| Frontend     | React + TypeScript + Vite + Tailwind CSS + lucide-react |
| Backend      | Supabase Edge Functions (Deno) — the `jobs` and `send-email` APIs |
| Database     | Supabase Postgres (`applications` table) + Supabase Storage (`resumes` bucket) |
| Auth         | Supabase Auth — Google OAuth 2.0 + email/password       |
| Email        | Gmail API (`gmail.googleapis.com`) called server-side   |

> The original spec mentioned Node.js + Express, Multer, and SQLite/JSON.
> This implementation uses the Bolt/Supabase stack (Edge Functions instead of
> Express, Supabase Storage instead of Multer, Postgres instead of SQLite),
> which is the supported backend in this environment. The **API surface and
> behavior match the spec**: `GET /jobs`, `POST /upload-resume`,
> `POST /send-email`, `GET /applications`.

---

## Project structure

```
.
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.ts
├── tsconfig*.json
├── .env                      # Supabase URL + anon key (pre-populated)
├── public/
│   └── favicon.svg
├── src/
│   ├── main.tsx
│   ├── App.tsx               # Auth gate + view routing
│   ├── index.css             # Tailwind + theme tokens
│   ├── types.ts              # Shared TypeScript types
│   ├── context/
│   │   ├── AuthContext.tsx   # Supabase auth (Google + email)
│   │   └── ToastContext.tsx  # Success/error notifications
│   ├── lib/
│   │   ├── supabase.ts       # Supabase client + edge function URLs
│   │   ├── mockJobs.ts       # Client-side fallback mock data
│   │   └── format.ts         # Date / initials / size helpers
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── SearchForm.tsx
│   │   ├── JobCard.tsx
│   │   ├── ResumeUpload.tsx
│   │   ├── ApplyModal.tsx
│   │   ├── EmptyState.tsx
│   │   ├── Spinner.tsx
│   │   └── Footer.tsx
│   └── pages/
│       ├── AuthLanding.tsx   # Login / sign-up screen
│       ├── Home.tsx          # Job search + résumé upload
│       └── Dashboard.tsx     # Sent applications
└── supabase/
    └── functions/
        ├── jobs/index.ts        # GET /functions/v1/jobs
        └── send-email/index.ts  # POST /functions/v1/send-email
```

---

## Backend APIs

All backend endpoints are deployed as Supabase Edge Functions and called from
the frontend with the user's auth token.

### `GET /functions/v1/jobs`
Query params: `keyword` (string), `jobType` (`Full Time` | `Contract` | `Internship`).
Returns: `{ jobs: Job[], count: number }`.

### `POST /functions/v1/send-email`
Body:
```json
{
  "to": "recruiter@company.com",
  "subject": "Application for Senior Frontend Engineer",
  "body": "Dear Hiring Team, …",
  "resumePath": "<user_id>/<filename>",
  "jobId": "j-001",
  "company": "Northwind Labs",
  "jobTitle": "Senior Frontend Engineer",
  "recruiterEmail": "recruiter@company.com"
}
```
Sends the email via the Gmail API using the caller's Google OAuth provider
token, attaches the résumé from Supabase Storage, and persists a row in the
`applications` table. Returns `{ sent, demoMode, gmailMessageId, message }`.

### `POST /upload-resume`
Résumé uploads are handled directly to Supabase Storage from the client
(`supabase.storage.from('resumes').upload(...)`) under a `<user_id>/` prefix,
enforced by Storage RLS policies. PDF-only validation and a 10 MB size limit
are enforced client-side.

### `GET /applications`
Read directly from the `applications` table via the Supabase client (RLS
ensures each user only sees their own rows).

---

## Database schema

### `applications` table
| column            | type        | notes                                  |
| ----------------- | ----------- | -------------------------------------- |
| `id`              | uuid (pk)   | auto-generated                         |
| `user_id`         | uuid        | `DEFAULT auth.uid()`, FK to auth.users |
| `job_id`          | text        | mock job id                            |
| `company`         | text        |                                        |
| `job_title`       | text        |                                        |
| `recruiter_email` | text        |                                        |
| `subject`         | text        |                                        |
| `body`            | text        |                                        |
| `resume_path`     | text        | nullable                               |
| `status`          | text        | `sent` / `opened` / `replied`          |
| `created_at`      | timestamptz | `DEFAULT now()`                        |

**Row Level Security** is enabled with four owner-scoped policies
(select/insert/update/delete) using `auth.uid() = user_id`.

### `resumes` storage bucket
Private bucket with object policies scoped so each authenticated user can
only read/write/delete objects under their own `<user_id>/` prefix.

---

## Setup

### 1. Prerequisites
- Node.js 18+
- A Supabase project (already provisioned in this environment)

### 2. Environment variables
`.env` is pre-populated with:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```
The server-side keys (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
`SUPABASE_DB_URL`) are available to edge functions automatically.

### 3. Enable Google OAuth in Supabase
For real Gmail sending, enable the Google provider in your Supabase dashboard
(**Authentication → Providers → Google**) with a Google Cloud OAuth client
that has the `https://www.googleapis.com/auth/gmail.send` scope. After a user
signs in with Google, their OAuth access token is available to the
`send-email` edge function.

If no Google provider token is present, `send-email` runs in **demo mode**: it
persists the application to the dashboard but does not transmit the email, and
the response clearly flags `demoMode: true`.

### 4. Install & run
```bash
npm install
npm run dev      # start the Vite dev server (runs automatically in Bolt)
npm run build    # production build
npm run typecheck
```

### 5. Deploy edge functions
The `jobs` and `send-email` functions are deployed via the Supabase MCP
`deploy_edge_function` tool (source lives in `supabase/functions/`).

---

## Security notes

- All database access is gated by RLS — users can only read/write their own
  rows and storage objects.
- Edge functions validate the caller's JWT before acting.
- The Gmail API is called only with the caller's own Google OAuth token;
  the app never handles raw passwords.
- No scraping, automation, or credential reuse of any third-party site.

---

## Compliance

This project intentionally uses **mock/sample job data** and does **not**:
- scrape or automate LinkedIn or any other job portal,
- bypass website restrictions,
- store third-party credentials,
- send email without the signed-in user's own Google OAuth authorization.

Only official Google OAuth 2.0 and the Gmail API are used.
