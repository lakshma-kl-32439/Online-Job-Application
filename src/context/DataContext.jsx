import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { KEYS, load, save } from '../services/storage';
import { todayISO, uid } from '../utils/format';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [jobs, setJobs] = useState(() => load(KEYS.jobs, []));
  const [applications, setApplications] = useState(() => load(KEYS.applications, []));

  useEffect(() => {
    save(KEYS.jobs, jobs);
  }, [jobs]);
  useEffect(() => {
    save(KEYS.applications, applications);
  }, [applications]);

  /* ---------- Jobs (Admin) ---------- */
  const addJob = useCallback((data) => {
    const job = { ...data, id: uid('job'), postedAt: todayISO(), status: data.status || 'open' };
    setJobs((j) => [job, ...j]);
    return job;
  }, []);

  const updateJob = useCallback((id, patch) => {
    setJobs((j) => j.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }, []);

  const deleteJob = useCallback((id) => {
    setJobs((j) => j.filter((x) => x.id !== id));
  }, []);

  /* ---------- Applications ---------- */
  const addApplication = useCallback((data) => {
    const now = new Date().toISOString();
    const app = {
      jobType: 'Full-time', url: '', notes: '', interviewAt: '', interviewMode: '', interviewUrl: '', jobId: null, location: '', salary: '',
      ...data,
      id: uid('app'),
      createdAt: now,
      updatedAt: now,
    };
    setApplications((a) => [app, ...a]);
    return app;
  }, []);

  const updateApplication = useCallback((id, patch) => {
    setApplications((a) =>
      a.map((x) => {
        if (x.id !== id) return x;
        const next = { ...x, ...patch, updatedAt: new Date().toISOString() };
        if (patch.status && patch.status !== 'Wishlist' && !next.appliedAt) next.appliedAt = todayISO();
        return next;
      }),
    );
  }, []);

  const deleteApplication = useCallback((id) => {
    setApplications((a) => a.filter((x) => x.id !== id));
  }, []);

  const removeApplicationsByUser = useCallback((userId) => {
    setApplications((a) => a.filter((x) => x.userId !== userId));
  }, []);

  const findForJob = useCallback(
    (userId, job) => applications.find((a) => a.userId === userId && (a.jobId === job.id || (a.company === job.company && a.role === job.role))),
    [applications],
  );

  const jobFields = (job) => ({
    jobId: job.id, company: job.company, role: job.role, location: job.location, salary: job.salary, jobType: job.type, url: job.url,
  });

  /** One-click apply. Returns 'applied' | 'moved' | 'exists'. */
  const applyToJob = useCallback(
    (user, job) => {
      const existing = findForJob(user.id, job);
      if (existing) {
        if (existing.status === 'Wishlist') {
          updateApplication(existing.id, { status: 'Applied', appliedAt: todayISO() });
          return 'moved';
        }
        return 'exists';
      }
      addApplication({
        ...jobFields(job), userId: user.id, status: 'Applied', appliedAt: todayISO(),
        notes: `Applied with one click from the job board as ${user.name}.`,
      });
      return 'applied';
    },
    [findForJob, addApplication, updateApplication],
  );

  /** Toggle wishlist. Returns true when saved, false when removed, null when already in the pipeline. */
  const toggleSaveJob = useCallback(
    (user, job) => {
      const existing = findForJob(user.id, job);
      if (!existing) {
        addApplication({ ...jobFields(job), userId: user.id, status: 'Wishlist', appliedAt: '' });
        return true;
      }
      if (existing.status === 'Wishlist') {
        deleteApplication(existing.id);
        return false;
      }
      return null;
    },
    [findForJob, addApplication, deleteApplication],
  );

  const value = useMemo(
    () => ({
      jobs, applications,
      addJob, updateJob, deleteJob,
      addApplication, updateApplication, deleteApplication, removeApplicationsByUser,
      findForJob, applyToJob, toggleSaveJob,
    }),
    [jobs, applications, addJob, updateJob, deleteJob, addApplication, updateApplication, deleteApplication, removeApplicationsByUser, findForJob, applyToJob, toggleSaveJob],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside <DataProvider>');
  return ctx;
}
