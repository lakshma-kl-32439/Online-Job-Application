import { hashPassword, randomSalt } from '../utils/password';
import { todayISO } from '../utils/format';

const iso = (offset) => todayISO(offset);

export const SEED_JOBS = [
  {
    id: 'job_google', company: 'Google', role: 'Software Engineer, Frontend', location: 'Bengaluru',
    type: 'Full-time', mode: 'Hybrid', salary: '₹24–36 LPA', skills: ['JavaScript', 'React', 'Web APIs', 'Testing'],
    description: 'Build fast, accessible interfaces used by millions. You will own features end to end, from design review to launch, and care about rendering performance.',
    url: 'https://careers.google.com', postedAt: iso(-1), status: 'open',
  },
  {
    id: 'job_microsoft', company: 'Microsoft', role: 'Frontend Developer', location: 'Hyderabad',
    type: 'Full-time', mode: 'Hybrid', salary: '₹18–28 LPA', skills: ['TypeScript', 'React', 'Accessibility'],
    description: 'Work on the component library behind Microsoft 365 web apps. Strong fundamentals in HTML, CSS and accessible UI patterns are essential.',
    url: 'https://careers.microsoft.com', postedAt: iso(-2), status: 'open',
  },
  {
    id: 'job_amazon', company: 'Amazon', role: 'Web Development Engineer', location: 'Chennai',
    type: 'Full-time', mode: 'On-site', salary: '₹16–24 LPA', skills: ['JavaScript', 'Node.js', 'AWS'],
    description: 'Ship customer-facing experiences for the retail website. Comfortable with data structures, REST APIs and operating what you build.',
    url: 'https://amazon.jobs', postedAt: iso(-3), status: 'open',
  },
  {
    id: 'job_razorpay', company: 'Razorpay', role: 'UI Engineer', location: 'Bengaluru',
    type: 'Full-time', mode: 'Hybrid', salary: '₹15–22 LPA', skills: ['React', 'CSS', 'Design Systems'],
    description: 'Craft the merchant dashboard and checkout flows. You will partner with designers to turn detailed specs into polished, reliable UI.',
    url: 'https://razorpay.com/jobs', postedAt: iso(-4), status: 'open',
  },
  {
    id: 'job_flipkart', company: 'Flipkart', role: 'SDE Intern, Web', location: 'Bengaluru',
    type: 'Internship', mode: 'On-site', salary: '₹60k / month', skills: ['HTML', 'CSS', 'JavaScript'],
    description: 'A six-month internship on the storefront team. Pair with senior engineers, ship to production in your first month and get a pre-placement offer track.',
    url: 'https://www.flipkartcareers.com', postedAt: iso(-5), status: 'open',
  },
  {
    id: 'job_zoho', company: 'Zoho', role: 'Member Technical Staff', location: 'Chennai',
    type: 'Full-time', mode: 'On-site', salary: '₹8–12 LPA', skills: ['Java', 'JavaScript', 'SQL'],
    description: 'Join a product team building business software end to end. Freshers with strong problem solving and a portfolio of projects are welcome.',
    url: 'https://www.zoho.com/careers', postedAt: iso(-6), status: 'open',
  },
  {
    id: 'job_infosys', company: 'Infosys', role: 'Systems Engineer', location: 'Pune',
    type: 'Full-time', mode: 'Hybrid', salary: '₹6–9 LPA', skills: ['HTML', 'CSS', 'JavaScript', 'SQL'],
    description: 'Graduate hiring for digital engineering projects. Training is provided; fundamentals in web development and databases are expected.',
    url: 'https://www.infosys.com/careers', postedAt: iso(-8), status: 'open',
  },
  {
    id: 'job_swiggy', company: 'Swiggy', role: 'Product Engineer (React)', location: 'Remote',
    type: 'Full-time', mode: 'Remote', salary: '₹14–20 LPA', skills: ['React', 'Redux', 'Performance'],
    description: 'Own consumer features on the ordering app. Experience with state management and measuring web vitals will help you hit the ground running.',
    url: 'https://careers.swiggy.com', postedAt: iso(-9), status: 'open',
  },
  {
    id: 'job_tcs', company: 'TCS', role: 'Digital Associate', location: 'Mumbai',
    type: 'Full-time', mode: 'On-site', salary: '₹7–11 LPA', skills: ['JavaScript', 'APIs', 'Agile'],
    description: 'Campus drive for digital roles. Work with enterprise clients on web platforms with a structured mentoring programme.',
    url: 'https://www.tcs.com/careers', postedAt: iso(-11), status: 'closed',
  },
];

const base = (o) => ({ jobType: 'Full-time', url: '', notes: '', interviewAt: '', interviewMode: '', interviewUrl: '', jobId: null, ...o });

export function buildSeedApplications(studentId, priyaId, rohanId, ananyaId) {
  const stamp = new Date().toISOString();
  const a = [
    base({ id: 'app_s1', userId: studentId, jobId: 'job_google', company: 'Google', role: 'Software Engineer, Frontend', location: 'Bengaluru', salary: '₹24–36 LPA', status: 'Interview', appliedAt: iso(-6), url: 'https://careers.google.com', notes: 'Round 2 covers closures, event loop and a live UI task.', interviewAt: `${iso(2)}T10:30`, interviewMode: 'Video call', interviewUrl: 'https://meet.google.com/' }),
    base({ id: 'app_s2', userId: studentId, jobId: 'job_microsoft', company: 'Microsoft', role: 'Frontend Developer', location: 'Hyderabad', salary: '₹18–28 LPA', status: 'Applied', appliedAt: iso(-3), url: 'https://careers.microsoft.com', notes: 'Referred by a senior from college.' }),
    base({ id: 'app_s3', userId: studentId, company: 'Deloitte', role: 'Analyst, UI Technologies', location: 'Bengaluru', salary: '₹7–10 LPA', status: 'Offer', appliedAt: iso(-18), url: 'https://www.deloitte.com/careers', notes: 'Offer letter received. Reply before the end of the month.' }),
    base({ id: 'app_s4', userId: studentId, jobId: 'job_razorpay', company: 'Razorpay', role: 'UI Engineer', location: 'Bengaluru', salary: '₹15–22 LPA', status: 'Wishlist', appliedAt: '', url: 'https://razorpay.com/jobs', notes: 'Polish the portfolio case study before applying.' }),
    base({ id: 'app_s5', userId: studentId, company: 'Adobe', role: 'Computer Scientist', location: 'Noida', salary: '₹20–30 LPA', status: 'Rejected', appliedAt: iso(-25), url: 'https://careers.adobe.com', notes: 'Did not clear the system design round.' }),
    base({ id: 'app_s6', userId: studentId, jobId: 'job_flipkart', company: 'Flipkart', role: 'SDE Intern, Web', location: 'Bengaluru', salary: '₹60k / month', jobType: 'Internship', status: 'Interview', appliedAt: iso(-9), url: 'https://www.flipkartcareers.com', notes: 'Online assessment cleared.', interviewAt: `${iso(5)}T15:00`, interviewMode: 'Online assessment', interviewUrl: 'https://www.hackerrank.com/' }),
    base({ id: 'app_p1', userId: priyaId, jobId: 'job_amazon', company: 'Amazon', role: 'Web Development Engineer', location: 'Chennai', salary: '₹16–24 LPA', status: 'Offer', appliedAt: iso(-20) }),
    base({ id: 'app_p2', userId: priyaId, jobId: 'job_zoho', company: 'Zoho', role: 'Member Technical Staff', location: 'Chennai', salary: '₹8–12 LPA', status: 'Applied', appliedAt: iso(-4) }),
    base({ id: 'app_r1', userId: rohanId, jobId: 'job_infosys', company: 'Infosys', role: 'Systems Engineer', location: 'Pune', salary: '₹6–9 LPA', status: 'Interview', appliedAt: iso(-7), interviewAt: `${iso(1)}T11:00`, interviewMode: 'Phone screen' }),
    base({ id: 'app_r2', userId: rohanId, jobId: 'job_google', company: 'Google', role: 'Software Engineer, Frontend', location: 'Bengaluru', salary: '₹24–36 LPA', status: 'Rejected', appliedAt: iso(-22) }),
    base({ id: 'app_a1', userId: ananyaId, jobId: 'job_swiggy', company: 'Swiggy', role: 'Product Engineer (React)', location: 'Remote', salary: '₹14–20 LPA', status: 'Applied', appliedAt: iso(-2) }),
    base({ id: 'app_a2', userId: ananyaId, jobId: 'job_razorpay', company: 'Razorpay', role: 'UI Engineer', location: 'Bengaluru', salary: '₹15–22 LPA', status: 'Wishlist', appliedAt: '' }),
  ];
  return a.map((x) => ({ ...x, createdAt: stamp, updatedAt: stamp }));
}

async function makeUser(id, name, email, password, role, extra = {}) {
  const salt = randomSalt();
  return {
    id, name, email, role, salt,
    passwordHash: await hashPassword(password, salt),
    phone: '', college: '', location: '', headline: '', bio: '', skills: [], links: { linkedin: '', github: '', portfolio: '' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * (extra.daysAgo ?? 14)).toISOString(),
    ...extra,
  };
}

export async function buildSeed() {
  const users = [
    await makeUser('u_admin', 'Meera Nair', 'admin@careertrail.com', 'Admin@123', 'admin', {
      headline: 'Placement Officer', college: 'CareerTrail Placement Cell', location: 'Bengaluru', daysAgo: 60,
      bio: 'Coordinates campus recruitment drives and keeps the vacancy board current.',
    }),
    await makeUser('u_student', 'Alex Student', 'student@careertrail.com', 'Student@123', 'user', {
      headline: 'Frontend developer • Final-year B.Tech CSE', college: 'Sri Venkateswara Institute of Technology', location: 'Bengaluru',
      phone: '+91 98765 43210', skills: ['React', 'JavaScript', 'CSS', 'Node.js'], daysAgo: 30,
      bio: 'Building accessible web apps. Looking for a frontend role where I can ship quickly and learn from a strong team.',
      links: { linkedin: 'https://linkedin.com/in/alex-student', github: 'https://github.com/alex-student', portfolio: '' },
    }),
    await makeUser('u_priya', 'Priya Sharma', 'priya@univ.edu', 'Student@123', 'user', { college: 'NIT Trichy', skills: ['Java', 'SQL'], daysAgo: 21 }),
    await makeUser('u_rohan', 'Rohan Mehta', 'rohan@univ.edu', 'Student@123', 'user', { college: 'VIT Vellore', skills: ['Python', 'React'], daysAgo: 12 }),
    await makeUser('u_ananya', 'Ananya Iyer', 'ananya@univ.edu', 'Student@123', 'user', { college: 'PSG Tech', skills: ['TypeScript', 'Figma'], daysAgo: 3 }),
  ];
  return {
    users,
    jobs: SEED_JOBS,
    applications: buildSeedApplications('u_student', 'u_priya', 'u_rohan', 'u_ananya'),
  };
}
