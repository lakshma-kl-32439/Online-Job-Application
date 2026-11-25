import { LuBanknote, LuBookmark, LuBookmarkCheck, LuExternalLink, LuMapPin, LuZap } from 'react-icons/lu';
import Modal from './Modal';
import Avatar from './Avatar';
import StatusBadge from './StatusBadge';
import { formatDate } from '../utils/format';

export default function JobModal({ job, application, onClose, onApply, onSave }) {
  const status = application?.status;
  const saved = status === 'Wishlist';
  const inPipeline = Boolean(application) && !saved;
  return (
    <Modal
      title={job.role}
      subtitle={job.company}
      onClose={onClose}
      footer={
        <>
          <a className="btn btn-ghost" href={job.url} target="_blank" rel="noreferrer"><LuExternalLink aria-hidden="true" />Company portal</a>
          {inPipeline ? (
            <StatusBadge status={status} />
          ) : (
            <>
              <button type="button" className="btn btn-ghost" onClick={() => onSave(job)}>
                {saved ? <LuBookmarkCheck aria-hidden="true" /> : <LuBookmark aria-hidden="true" />}{saved ? 'Remove from saved' : 'Save for later'}
              </button>
              <button type="button" className="btn btn-primary" onClick={() => onApply(job)}><LuZap aria-hidden="true" />Easy apply</button>
            </>
          )}
        </>
      }
    >
      <div className="job-modal-head">
        <Avatar name={job.company} size={56} />
        <ul className="meta stacked">
          <li><LuMapPin aria-hidden="true" />{job.location} • {job.mode}</li>
          <li><LuBanknote aria-hidden="true" />{job.salary} • {job.type}</li>
        </ul>
      </div>
      <h3 className="sub-h">About the role</h3>
      <p>{job.description}</p>
      <h3 className="sub-h">Skills</h3>
      <ul className="chips">{job.skills?.map((s) => <li key={s}>{s}</li>)}</ul>
      <p className="muted small mt">Posted {formatDate(job.postedAt)}</p>
    </Modal>
  );
}
