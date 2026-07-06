import type { Job, JobType } from '../types';

/**
 * Mock job listings for demonstration only.
 * No scraping or third-party job-portal data is used.
 */
const RAW: Array<Omit<Job, 'logoColor' | 'postedDate'> & { daysAgo: number }> = [
  {
    id: 'j-001',
    company: 'Northwind Labs',
    title: 'Senior Frontend Engineer',
    recruiterEmail: 'careers@northwindlabs.demo',
    jobType: 'Full Time',
    location: 'Remote (US)',
    salary: '$140k – $175k',
    description:
      'Build delightful UI for a developer-tools platform. Strong React + TypeScript skills required; design-systems experience a plus.',
    tags: ['React', 'TypeScript', 'Design Systems'],
    daysAgo: 2,
  },
  {
    id: 'j-002',
    company: 'Atlas Robotics',
    title: 'Robotics Software Intern',
    recruiterEmail: 'talent@atlasrobotics.demo',
    jobType: 'Internship',
    location: 'Boston, MA',
    salary: '$7k / mo',
    description:
      'Work on real-time motion-planning for warehouse robots. Currently enrolled in a CS or robotics program.',
    tags: ['Python', 'C++', 'Robotics'],
    daysAgo: 4,
  },
  {
    id: 'j-003',
    company: 'Mosaic Health',
    title: 'Full-Stack Engineer',
    recruiterEmail: 'hiring@mosaichealth.demo',
    jobType: 'Full Time',
    location: 'Remote',
    salary: '$125k – $160k',
    description:
      'Ship patient-facing features across a modern Next.js + Postgres stack. Healthcare data experience welcome but not required.',
    tags: ['Next.js', 'Postgres', 'AWS'],
    daysAgo: 6,
  },
  {
    id: 'j-004',
    company: 'Pinecrest Studio',
    title: 'Contract React Developer',
    recruiterEmail: 'studio@pinecrest.demo',
    jobType: 'Contract',
    location: 'Remote',
    salary: '$85/hr',
    description:
      '6-month engagement to ship a new marketing site and internal CMS. Must be comfortable owning features end-to-end.',
    tags: ['React', 'Tailwind', 'CMS'],
    daysAgo: 9,
  },
  {
    id: 'j-005',
    company: 'Vector Cloud',
    title: 'Platform Engineer',
    recruiterEmail: 'platform@vectorcloud.demo',
    jobType: 'Full Time',
    location: 'Austin, TX',
    salary: '$150k – $190k',
    description:
      'Operate a multi-tenant Kubernetes platform. Go + Terraform experience required; SRE mindset essential.',
    tags: ['Go', 'Kubernetes', 'Terraform'],
    daysAgo: 11,
  },
  {
    id: 'j-006',
    company: 'Lumen Education',
    title: 'Curriculum Engineering Intern',
    recruiterEmail: 'interns@lumenedu.demo',
    jobType: 'Internship',
    location: 'Remote',
    salary: '$5.5k / mo',
    description:
      'Help build interactive coding exercises for a learn-to-code platform. Strong JavaScript fundamentals expected.',
    tags: ['JavaScript', 'Education', 'UI'],
    daysAgo: 14,
  },
  {
    id: 'j-007',
    company: 'Orbit Finance',
    title: 'Senior Backend Engineer',
    recruiterEmail: 'engineering@orbitfinance.demo',
    jobType: 'Full Time',
    location: 'New York, NY',
    salary: '$170k – $210k',
    description:
      'Design high-throughput payments services. Deep Node.js, Postgres, and event-driven architecture experience.',
    tags: ['Node.js', 'Postgres', 'Payments'],
    daysAgo: 3,
  },
  {
    id: 'j-008',
    company: 'Cobalt Games',
    title: 'Gameplay Programmer (Contract)',
    recruiterEmail: 'jobs@cobaltgames.demo',
    jobType: 'Contract',
    location: 'Remote',
    salary: '$70/hr',
    description:
      '3-month contract to prototype core combat mechanics for an indie action title. Unity + C# experience required.',
    tags: ['Unity', 'C#', 'Gameplay'],
    daysAgo: 16,
  },
  {
    id: 'j-009',
    company: 'Northwind Labs',
    title: 'Staff Site Reliability Engineer',
    recruiterEmail: 'sre@northwindlabs.demo',
    jobType: 'Full Time',
    location: 'Remote (US)',
    salary: '$190k – $230k',
    description:
      'Own reliability for a fast-growing developer-tools platform. Deep Linux, observability, and incident-response experience.',
    tags: ['SRE', 'Observability', 'Linux'],
    daysAgo: 1,
  },
  {
    id: 'j-010',
    company: 'Bloom Retail',
    title: 'Frontend Engineer',
    recruiterEmail: 'tech@bloomretail.demo',
    jobType: 'Full Time',
    location: 'Chicago, IL',
    salary: '$115k – $145k',
    description:
      'Build the storefront for a modern retail brand. React + GraphQL + a love for performance and accessibility.',
    tags: ['React', 'GraphQL', 'A11y'],
    daysAgo: 7,
  },
  {
    id: 'j-011',
    company: 'Quanta AI',
    title: 'ML Research Intern',
    recruiterEmail: 'research@quantaai.demo',
    jobType: 'Internship',
    location: 'Remote',
    salary: '$8k / mo',
    description:
      'Contribute to alignment research on large language models. Currently enrolled in a graduate ML program.',
    tags: ['Python', 'PyTorch', 'NLP'],
    daysAgo: 5,
  },
  {
    id: 'j-012',
    company: 'Harbor Mobility',
    title: 'Mobile Engineer (Contract)',
    recruiterEmail: 'mobile@harbormobility.demo',
    jobType: 'Contract',
    location: 'San Francisco, CA',
    salary: '$90/hr',
    description:
      '4-month contract to ship a new rider app. React Native + native modules experience required.',
    tags: ['React Native', 'iOS', 'Android'],
    daysAgo: 12,
  },
];

const COLORS = [
  '#0f766e', '#0369a1', '#7c2d12', '#3730a3', '#155e75',
  '#9a3412', '#3f6212', '#831843', '#1e3a8a', '#134e4a',
];

function companyColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return COLORS[h % COLORS.length];
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(9, 0, 0, 0);
  return d.toISOString();
}

export const MOCK_JOBS: Job[] = RAW.map((j) => ({
  id: j.id,
  company: j.company,
  logoColor: companyColor(j.company),
  title: j.title,
  recruiterEmail: j.recruiterEmail,
  postedDate: isoDaysAgo(j.daysAgo),
  jobType: j.jobType as JobType,
  location: j.location,
  salary: j.salary,
  description: j.description,
  tags: j.tags,
}));

export const JOB_TYPES: JobType[] = ['Full Time', 'Contract', 'Internship'];
