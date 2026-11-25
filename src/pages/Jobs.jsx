import { useMemo, useState } from 'react';
import { LuSearch, LuSearchX } from 'react-icons/lu';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import JobCard from '../components/JobCard';
import JobModal from '../components/JobModal';
import EmptyState from '../components/EmptyState';
import { JOB_TYPES, WORK_MODES } from '../utils/constants';
import { pluralize } from '../utils/format';

export default function Jobs() {
  const { user } = useAuth();
  const { jobs, findForJob, applyToJob, toggleSaveJob } = useData();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('All');
  const [mode, setMode] = useState('All');
  const [location, setLocation] = useState('All');
  const [open, setOpen] = useState(null);

  const openJobs = useMemo(() => jobs.filter((j) => j.status === 'open'), [jobs]);
  const locations = useMemo(() => ['All', ...Array.from(new Set(openJobs.map((j) => j.location))).sort()], [openJobs]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return openJobs.filter(
      (j) =>
        (type === 'All' || j.type === type) &&
        (mode === 'All' || j.mode === mode) &&
        (location === 'All' || j.location === location) &&
        (!q || `${j.company} ${j.role} ${j.location} ${(j.skills || []).join(' ')}`.toLowerCase().includes(q)),
    );
  }, [openJobs, query, type, mode, location]);

  const apply = (job) => {
    const r = applyToJob(user, job);
    if (r === 'applied') toast.success(`Applied to ${job.company}. Find it on your Applications board.`);
    else if (r === 'moved') toast.success(`Moved ${job.company} from Saved to Applied.`);
    else toast.info('You have already applied to this role.');
    setOpen(null);
  };

  const save = (job) => {
    const r = toggleSaveJob(user, job);
    if (r === true) toast.success(`Saved ${job.role} for later.`);
    else if (r === false) toast.info('Removed from saved.');
    else toast.info('This role is already in your pipeline.');
  };

  const reset = () => { setQuery(''); setType('All'); setMode('All'); setLocation('All'); };
  const filtered = query || type !== 'All' || mode !== 'All' || location !== 'All';

  return (
    <>
      <PageHeader title="Job board" subtitle={`${pluralize(openJobs.length, 'open vacancy', 'open vacancies')} posted by your placement cell.`} />

      <div className="toolbar" role="search">
        <label className="search">
          <LuSearch aria-hidden="true" />
          <span className="sr-only">Search jobs</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by role, company, skill or city" />
        </label>
        <label className="select-wrap"><span className="sr-only">Job type</span>
          <select value={type} onChange={(e) => setType(e.target.value)}><option value="All">All types</option>{JOB_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
        </label>
        <label className="select-wrap"><span className="sr-only">Work mode</span>
          <select value={mode} onChange={(e) => setMode(e.target.value)}><option value="All">All work modes</option>{WORK_MODES.map((t) => <option key={t}>{t}</option>)}</select>
        </label>
        <label className="select-wrap"><span className="sr-only">Location</span>
          <select value={location} onChange={(e) => setLocation(e.target.value)}>{locations.map((t) => <option key={t} value={t}>{t === 'All' ? 'All locations' : t}</option>)}</select>
        </label>
      </div>

      <p className="result-count" aria-live="polite">{pluralize(results.length, 'role')} {filtered && <button type="button" className="text-link" onClick={reset}>Clear filters</button>}</p>

      {results.length ? (
        <div className="stack">
          {results.map((j) => (
            <JobCard key={j.id} job={j} application={findForJob(user.id, j)} onOpen={setOpen} onApply={apply} onSave={save} />
          ))}
        </div>
      ) : (
        <EmptyState icon={LuSearchX} title="No roles match those filters" text="Try a broader search or clear the filters." action={<button type="button" className="btn btn-ghost" onClick={reset}>Clear filters</button>} />
      )}

      {open && <JobModal job={open} application={findForJob(user.id, open)} onClose={() => setOpen(null)} onApply={apply} onSave={(j) => { save(j); }} />}
    </>
  );
}
