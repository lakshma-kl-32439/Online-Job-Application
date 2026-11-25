import { useState } from 'react';
import { LuExternalLink, LuTrash2 } from 'react-icons/lu';
import Modal from './Modal';
import Field from './Field';
import { INTERVIEW_MODES, JOB_TYPES, STATUSES } from '../utils/constants';
import { todayISO } from '../utils/format';

const EMPTY = {
  company: '', role: '', location: '', salary: '', jobType: 'Full-time', status: 'Applied',
  appliedAt: todayISO(), url: '', interviewAt: '', interviewMode: 'Video call', interviewUrl: '', notes: '',
};

/** Create or edit an application. Pass `application` to edit. */
export default function ApplicationModal({ application, defaultStatus, onClose, onSave, onDelete }) {
  const editing = Boolean(application);
  const [form, setForm] = useState(() => ({
    ...EMPTY,
    ...(defaultStatus ? { status: defaultStatus, appliedAt: defaultStatus === 'Wishlist' ? '' : todayISO() } : {}),
    ...(application || {}),
    interviewMode: application?.interviewMode || 'Video call',
  }));
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.company.trim()) next.company = 'Enter the company name.';
    if (!form.role.trim()) next.role = 'Enter the role you applied for.';
    if (form.url && !/^https?:\/\//i.test(form.url.trim())) next.url = 'Start the link with http:// or https://';
    if (form.interviewUrl && !/^https?:\/\//i.test(form.interviewUrl.trim())) next.interviewUrl = 'Start the link with http:// or https://';
    setErrors(next);
    if (Object.keys(next).length) return;
    const { id, userId, createdAt, updatedAt, ...rest } = form;
    onSave({
      ...rest,
      company: rest.company.trim(),
      role: rest.role.trim(),
      url: rest.url.trim(),
      interviewUrl: rest.interviewUrl.trim(),
      interviewMode: rest.interviewAt ? rest.interviewMode : '',
    });
  };

  return (
    <Modal
      title={editing ? 'Application details' : 'Add application'}
      subtitle={editing ? `${application.role} at ${application.company}` : 'Log a role you applied for or want to apply to.'}
      onClose={onClose}
      size="lg"
      footer={
        <>
          {editing && (
            <button type="button" className="btn btn-danger-ghost push-left" onClick={onDelete}><LuTrash2 aria-hidden="true" />Delete</button>
          )}
          {editing && form.url && (
            <a className="btn btn-ghost" href={form.url} target="_blank" rel="noreferrer"><LuExternalLink aria-hidden="true" />Portal</a>
          )}
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" form="application-form" className="btn btn-primary">{editing ? 'Save changes' : 'Add application'}</button>
        </>
      }
    >
      <form id="application-form" className="form-grid" onSubmit={submit} noValidate>
        <Field label="Company" error={errors.company}>{(p) => <input {...p} value={form.company} onChange={set('company')} placeholder="e.g. Google" />}</Field>
        <Field label="Role" error={errors.role}>{(p) => <input {...p} value={form.role} onChange={set('role')} placeholder="e.g. Frontend Developer" />}</Field>
        <Field label="Location">{(p) => <input {...p} value={form.location} onChange={set('location')} placeholder="e.g. Bengaluru" />}</Field>
        <Field label="Salary">{(p) => <input {...p} value={form.salary} onChange={set('salary')} placeholder="e.g. ₹12–18 LPA" />}</Field>
        <Field label="Status">{(p) => <select {...p} value={form.status} onChange={set('status')}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>}</Field>
        <Field label="Job type">{(p) => <select {...p} value={form.jobType} onChange={set('jobType')}>{JOB_TYPES.map((s) => <option key={s}>{s}</option>)}</select>}</Field>
        <Field label="Date applied">{(p) => <input {...p} type="date" value={form.appliedAt} onChange={set('appliedAt')} />}</Field>
        <Field label="Portal link" error={errors.url}>{(p) => <input {...p} type="url" value={form.url} onChange={set('url')} placeholder="https://careers.example.com" />}</Field>
        <Field label="Interview date and time" hint="Optional. Shows up on your Interviews page.">{(p) => <input {...p} type="datetime-local" value={form.interviewAt} onChange={set('interviewAt')} />}</Field>
        <Field label="Interview format">{(p) => <select {...p} value={form.interviewMode} onChange={set('interviewMode')} disabled={!form.interviewAt}>{INTERVIEW_MODES.map((s) => <option key={s}>{s}</option>)}</select>}</Field>
        <Field label="Meeting or test link" error={errors.interviewUrl} hint="Zoom, Meet, Teams or the assessment site. Adds a Join button." className="span-2">{(p) => <input {...p} type="url" value={form.interviewUrl} onChange={set('interviewUrl')} placeholder="https://meet.google.com/abc-defg-hij" />}</Field>
        <Field label="Notes" className="span-2">{(p) => <textarea {...p} rows={3} value={form.notes} onChange={set('notes')} placeholder="Contacts, preparation topics, follow-up dates…" />}</Field>
      </form>
    </Modal>
  );
}
