export type JobType = 'Full Time' | 'Contract' | 'Internship';

export interface Job {
  id: string;
  company: string;
  logoColor: string;
  title: string;
  recruiterEmail: string;
  postedDate: string; // ISO date
  jobType: JobType;
  location: string;
  salary: string;
  description: string;
  tags: string[];
}

export type ApplicationStatus = 'sent' | 'opened' | 'replied';

export interface Application {
  id: string;
  user_id: string;
  job_id: string;
  company: string;
  job_title: string;
  recruiter_email: string;
  subject: string;
  body: string;
  resume_path: string | null;
  status: ApplicationStatus;
  created_at: string;
}

export interface ResumeFile {
  name: string;
  path: string;
  size: number;
  uploadedAt: string;
}

export type ToastKind = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  kind: ToastKind;
  message: string;
}
