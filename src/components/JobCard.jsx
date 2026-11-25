import { LuBanknote, LuBookmark, LuBookmarkCheck, LuCheck, LuClock, LuMapPin, LuZap } from 'react-icons/lu';
import Avatar from './Avatar';
import StatusBadge from './StatusBadge';
import { formatShortDate, relativeDay } from '../utils/format';

export default function JobCard({ job, application, onOpen, onApply, onSave }) {
  const status = application?.status;
  const saved = status === 'Wishlist';
  const inPipeline = Boolean(application) && !saved;
  return (
    <article className="job-card">
      <Avatar name={job.company} size={48} />
      <div className="job-main">
        <h3>
          <button type="button" className="link-btn" onClick={() => onOpen(job)}>{job.role}</button>
        </h3>
        <p className="job-company">{job.company}</p>
        <ul className="meta">
          <li><LuMapPin aria-hidden="true" />{job.location} • {job.mode}</li>
          <li><LuBanknote aria-hidden="true" />{job.salary}</li>
          <li><LuClock aria-hidden="true" />{job.type} • {relativeDay(job.postedAt) || formatShortDate(job.postedAt)}</li>
        </ul>
        <ul className="chips">{job.skills?.slice(0, 4).map((s) => <li key={s}>{s}</li>)}</ul>
      </div>
      <div className="job-actions">
        {inPipeline ? (
          <StatusBadge status={status} />
        ) : (
          <>
            <button type="button" className="btn btn-primary" onClick={() => onApply(job)}><LuZap aria-hidden="true" />Easy apply</button>
            <button type="button" className={`btn btn-ghost ${saved ? 'is-on' : ''}`} onClick={() => onSave(job)} aria-pressed={saved}>
              {saved ? <LuBookmarkCheck aria-hidden="true" /> : <LuBookmark aria-hidden="true" />}
              {saved ? 'Saved' : 'Save'}
            </button>
          </>
        )}
        {inPipeline && <span className="muted small"><LuCheck aria-hidden="true" /> In your pipeline</span>}
      </div>
    </article>
  );
}
