import { useMemo, useState } from 'react';
import { LuBriefcase, LuPencil, LuPlus, LuSearch, LuTrash2 } from 'react-icons/lu';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/PageHeader';
import Avatar from '../../components/Avatar';
import Modal from '../../components/Modal';
import Field from '../../components/Field';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import { JOB_TYPES, WORK_MODES } from '../../utils/constants';
import { formatDate, pluralize } from '../../utils/format';

const EMPTY = { company: '', role: '', location: '', type: 'Full-time', mode: 'Hybrid', salary: '', skills: '', url: '', description: '', status: 'open' };

function JobForm({ job, onClose, onSave }) {
  const [form, setForm] = useState(() => (job ? { ...EMPTY, ...job, skills: (job.skills || []).join(', ') } : EMPTY));
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((x) => ({ ...x, [k]: '' })); };

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.company.trim()) next.company = 'Enter the company name.';
    if (!form.role.trim()) next.role = 'Enter the job title.';
    if (!form.location.trim()) next.location = 'Enter a location.';
    if (!form.description.trim()) next.description = 'Add a short description for candidates.';
    if (form.url && !/^https?:\/\//i.test(form.url.trim())) next.url = 'Start the link with http:// or https://';
    setErrors(next);
    if (Object.keys(next).length) return;
    onSave({
      ...form,
      company: form.company.trim(), role: form.role.trim(), location: form.location.trim(),
      salary: form.salary.trim() || 'Not disclosed', description: form.description.trim(), url: form.url.trim(),
      skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
    });
  };

  return (
    <Modal
      title={job ? 'Edit vacancy' : 'Post a vacancy'}
      subtitle={job ? `${job.role} at ${job.company}` : 'Candidates see it on the job board immediately.'}
      size="lg"
      onClose={onClose}
      footer={<><button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button><button type="submit" form="job-form" className="btn btn-primary">{job ? 'Save changes' : 'Publish vacancy'}</button></>}
    >
      <form id="job-form" className="form-grid" onSubmit={submit} noValidate>
        <Field label="Company" error={errors.company}>{(p) => <input {...p} value={form.company} onChange={set('company')} placeholder="e.g. Razorpay" />}</Field>
        <Field label="Job title" error={errors.role}>{(p) => <input {...p} value={form.role} onChange={set('role')} placeholder="e.g. UI Engineer" />}</Field>
        <Field label="Location" error={errors.location}>{(p) => <input {...p} value={form.location} onChange={set('location')} placeholder="e.g. Bengaluru" />}</Field>
        <Field label="Salary">{(p) => <input {...p} value={form.salary} onChange={set('salary')} placeholder="e.g. ₹12–18 LPA" />}</Field>
        <Field label="Job type">{(p) => <select {...p} value={form.type} onChange={set('type')}>{JOB_TYPES.map((t) => <option key={t}>{t}</option>)}</select>}</Field>
        <Field label="Work mode">{(p) => <select {...p} value={form.mode} onChange={set('mode')}>{WORK_MODES.map((t) => <option key={t}>{t}</option>)}</select>}</Field>
        <Field label="Skills" hint="Separate with commas." className="span-2">{(p) => <input {...p} value={form.skills} onChange={set('skills')} placeholder="React, CSS, Testing" />}</Field>
        <Field label="Application link" error={errors.url}>{(p) => <input {...p} type="url" value={form.url} onChange={set('url')} placeholder="https://careers.example.com" />}</Field>
        <Field label="Status">{(p) => <select {...p} value={form.status} onChange={set('status')}><option value="open">Open</option><option value="closed">Closed</option></select>}</Field>
        <Field label="Description" error={errors.description} className="span-2">{(p) => <textarea {...p} rows={4} value={form.description} onChange={set('description')} placeholder="What will the candidate work on? What do you expect from them?" />}</Field>
      </form>
    </Modal>
  );
}

export default function ManageJobs() {
  const { jobs, applications, addJob, updateJob, deleteJob } = useData();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const counts = useMemo(() => {
    const m = {};
    applications.forEach((a) => { if (a.jobId) m[a.jobId] = (m[a.jobId] || 0) + 1; });
    return m;
  }, [applications]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter((j) => (filter === 'all' || j.status === filter) && (!q || `${j.company} ${j.role} ${j.location}`.toLowerCase().includes(q)));
  }, [jobs, query, filter]);

  const save = (data) => {
    if (modal.job) { updateJob(modal.job.id, data); toast.success('Vacancy updated.'); }
    else { addJob(data); toast.success('Vacancy published to the job board.'); }
    setModal(null);
  };

  return (
    <>
      <PageHeader
        title="Vacancies"
        subtitle={`${pluralize(jobs.filter((j) => j.status === 'open').length, 'open vacancy', 'open vacancies')} visible to candidates.`}
        actions={<button type="button" className="btn btn-primary" onClick={() => setModal({})}><LuPlus aria-hidden="true" />Post vacancy</button>}
      />
      <div className="toolbar">
        <label className="search"><LuSearch aria-hidden="true" /><span className="sr-only">Search vacancies</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by company, role or city" />
        </label>
        <div className="view-toggle" role="group" aria-label="Filter by status">
          {[['all', 'All'], ['open', 'Open'], ['closed', 'Closed']].map(([v, l]) => (
            <button key={v} type="button" className={filter === v ? 'on' : ''} aria-pressed={filter === v} onClick={() => setFilter(v)}>{l}</button>
          ))}
        </div>
      </div>

      {list.length ? (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Vacancy</th><th>Location</th><th>Type</th><th>Applicants</th><th>Posted</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {list.map((j) => (
                <tr key={j.id}>
                  <td data-label="Vacancy"><div className="cell-main"><Avatar name={j.company} size={36} /><span><strong>{j.role}</strong><small>{j.company}</small></span></div></td>
                  <td data-label="Location">{j.location}</td>
                  <td data-label="Type">{j.type} • {j.mode}</td>
                  <td data-label="Applicants">{counts[j.id] || 0}</td>
                  <td data-label="Posted">{formatDate(j.postedAt)}</td>
                  <td data-label="Status">
                    <button type="button" className={`switch ${j.status === 'open' ? 'on' : ''}`} role="switch" aria-checked={j.status === 'open'} onClick={() => { updateJob(j.id, { status: j.status === 'open' ? 'closed' : 'open' }); toast.success(j.status === 'open' ? 'Vacancy closed.' : 'Vacancy reopened.'); }}>
                      <i aria-hidden="true" /><span>{j.status === 'open' ? 'Open' : 'Closed'}</span>
                    </button>
                  </td>
                  <td className="cell-actions">
                    <button type="button" className="icon-btn" onClick={() => setModal({ job: j })} aria-label={`Edit ${j.role}`}><LuPencil /></button>
                    <button type="button" className="icon-btn danger" onClick={() => setConfirm(j)} aria-label={`Delete ${j.role}`}><LuTrash2 /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState icon={LuBriefcase} title="No vacancies found" text="Post a vacancy or change the filters." action={<button type="button" className="btn btn-primary" onClick={() => setModal({})}>Post vacancy</button>} />
      )}

      {modal && <JobForm job={modal.job} onClose={() => setModal(null)} onSave={save} />}
      {confirm && (
        <ConfirmDialog
          title="Delete this vacancy?"
          message={`${confirm.role} at ${confirm.company} will disappear from the job board. Applications already tracked by candidates are kept.`}
          onCancel={() => setConfirm(null)}
          onConfirm={() => { deleteJob(confirm.id); setConfirm(null); toast.success('Vacancy deleted.'); }}
        />
      )}
    </>
  );
}
