import { useMemo, useState } from 'react';
import { LuCalendarClock, LuCalendarPlus, LuPencil, LuVideo } from 'react-icons/lu';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import Field from '../components/Field';
import Avatar from '../components/Avatar';
import EmptyState from '../components/EmptyState';
import ApplicationModal from '../components/ApplicationModal';
import JoinButton from '../components/JoinButton';
import { INTERVIEW_MODES } from '../utils/constants';
import { formatTime, relativeDay } from '../utils/format';

function ScheduleModal({ candidates, onClose, onSave }) {
  const [appId, setAppId] = useState(candidates[0]?.id || '');
  const [at, setAt] = useState('');
  const [mode, setMode] = useState('Video call');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [urlError, setUrlError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!appId) return setError('Choose an application.');
    if (!at) return setError('Pick a date and time.');
    if (url.trim() && !/^https?:\/\//i.test(url.trim())) return setUrlError('Start the link with http:// or https://');
    onSave(appId, at, mode, url.trim());
  };

  return (
    <Modal
      title="Schedule interview"
      subtitle="The application moves to the Interview stage."
      size="sm"
      onClose={onClose}
      footer={<><button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button><button type="submit" form="schedule-form" className="btn btn-primary">Save interview</button></>}
    >
      <form id="schedule-form" className="form-stack" onSubmit={submit} noValidate>
        <Field label="Application">{(p) => <select {...p} value={appId} onChange={(e) => setAppId(e.target.value)}>{candidates.map((a) => <option key={a.id} value={a.id}>{a.company} — {a.role}</option>)}</select>}</Field>
        <Field label="Date and time" error={error}>{(p) => <input {...p} type="datetime-local" value={at} onChange={(e) => { setAt(e.target.value); setError(''); }} />}</Field>
        <Field label="Format">{(p) => <select {...p} value={mode} onChange={(e) => setMode(e.target.value)}>{INTERVIEW_MODES.map((m) => <option key={m}>{m}</option>)}</select>}</Field>
        <Field label="Meeting or test link" error={urlError} hint="Optional. Adds a Join button to the interview.">{(p) => <input {...p} type="url" value={url} onChange={(e) => { setUrl(e.target.value); setUrlError(''); }} placeholder="https://meet.google.com/abc-defg-hij" />}</Field>
      </form>
    </Modal>
  );
}

export default function Interviews() {
  const { user } = useAuth();
  const { applications, updateApplication, deleteApplication } = useData();
  const toast = useToast();
  const [scheduling, setScheduling] = useState(false);
  const [editing, setEditing] = useState(null);

  const mine = useMemo(() => applications.filter((a) => a.userId === user.id), [applications, user.id]);
  const withDate = mine.filter((a) => a.interviewAt);
  const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
  const upcoming = withDate.filter((a) => new Date(a.interviewAt) >= startOfToday).sort((a, b) => a.interviewAt.localeCompare(b.interviewAt));
  const past = withDate.filter((a) => new Date(a.interviewAt) < startOfToday).sort((a, b) => b.interviewAt.localeCompare(a.interviewAt));
  const schedulable = mine.filter((a) => a.status !== 'Rejected');

  const schedule = (id, at, mode, url) => {
    const app = mine.find((a) => a.id === id);
    updateApplication(id, { interviewAt: at, interviewMode: mode, interviewUrl: url, status: app.status === 'Offer' ? 'Offer' : 'Interview' });
    setScheduling(false);
    toast.success(`Interview with ${app.company} scheduled.`);
  };

  const row = (a, dim) => {
    const d = new Date(a.interviewAt);
    return (
      <li key={a.id} className={`list-row ${dim ? 'is-dim' : ''}`}>
        <span className="date-block"><b>{d.getDate()}</b>{d.toLocaleString('en-IN', { month: 'short' })}</span>
        <Avatar name={a.company} size={40} />
        <div className="list-main"><strong>{a.company}</strong><span>{a.role}</span></div>
        <div className="list-side"><span><LuVideo aria-hidden="true" /> {a.interviewMode || 'Interview'}</span><small>{relativeDay(a.interviewAt)}, {formatTime(a.interviewAt)}</small></div>
        {!dim && <JoinButton app={a} onAddLink={setEditing} />}
        <button type="button" className="icon-btn" onClick={() => setEditing(a)} aria-label={`Edit ${a.company} interview`}><LuPencil /></button>
      </li>
    );
  };

  return (
    <>
      <PageHeader
        title="Interviews"
        subtitle="Every scheduled round in one place."
        actions={<button type="button" className="btn btn-primary" onClick={() => setScheduling(true)} disabled={!schedulable.length}><LuCalendarPlus aria-hidden="true" />Schedule interview</button>}
      />

      <section className="panel" aria-labelledby="up-h">
        <div className="panel-head"><h2 id="up-h">Upcoming</h2><span className="count-pill">{upcoming.length}</span></div>
        {upcoming.length ? <ul className="list">{upcoming.map((a) => row(a))}</ul> : (
          <EmptyState icon={LuCalendarClock} title="No upcoming interviews" text={schedulable.length ? 'Add the date as soon as a company confirms it.' : 'Track an application first, then schedule its interview here.'} />
        )}
      </section>

      {past.length > 0 && (
        <section className="panel" aria-labelledby="past-h">
          <div className="panel-head"><h2 id="past-h">Past</h2><span className="count-pill">{past.length}</span></div>
          <ul className="list">{past.map((a) => row(a, true))}</ul>
        </section>
      )}

      {scheduling && <ScheduleModal candidates={schedulable} onClose={() => setScheduling(false)} onSave={schedule} />}
      {editing && (
        <ApplicationModal
          application={editing}
          onClose={() => setEditing(null)}
          onSave={(data) => { updateApplication(editing.id, data); setEditing(null); toast.success('Interview updated.'); }}
          onDelete={() => { deleteApplication(editing.id); setEditing(null); toast.success('Application deleted.'); }}
        />
      )}
    </>
  );
}
