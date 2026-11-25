export const ROLES = { USER: 'user', ADMIN: 'admin' };

export const STATUSES = ['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected'];

export const STATUS_HINT = {
  Wishlist: 'Roles you plan to apply for',
  Applied: 'Application submitted',
  Interview: 'In an interview process',
  Offer: 'Offer received',
  Rejected: 'Closed without an offer',
};

export const JOB_TYPES = ['Full-time', 'Internship', 'Contract'];
export const WORK_MODES = ['On-site', 'Hybrid', 'Remote'];
export const INTERVIEW_MODES = ['Video call', 'Phone screen', 'On-site', 'Online assessment'];

export const ADMIN_INVITE_CODE = import.meta.env.VITE_ADMIN_INVITE_CODE || 'CT-ADMIN-2026';
export const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const DEMO_ACCOUNTS = {
  user: { email: 'student@careertrail.com', password: 'Student@123', label: 'Candidate' },
  admin: { email: 'admin@careertrail.com', password: 'Admin@123', label: 'Admin' },
};
