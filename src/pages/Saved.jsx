import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { LuBookmark, LuExternalLink, LuMapPin, LuZap } from 'react-icons/lu';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import Avatar from '../components/Avatar';
import EmptyState from '../components/EmptyState';
import { todayISO } from '../utils/format';

export default function Saved() {
  const { user } = useAuth();
  const { applications, updateApplication, deleteApplication } = useData();
  const toast = useToast();
  const saved = useMemo(() => applications.filter((a) => a.userId === user.id && a.status === 'Wishlist'), [applications, user.id]);

  return (
    <>
      <PageHeader title="Saved roles" subtitle="Roles you plan to apply for. Apply when you are ready." />
      {saved.length ? (
        <div className="stack">
          {saved.map((a) => (
            <article key={a.id} className="job-card">
              <Avatar name={a.company} size={48} />
              <div className="job-main">
                <h3>{a.role}</h3>
                <p className="job-company">{a.company}</p>
                <ul className="meta">
                  {a.location && <li><LuMapPin aria-hidden="true" />{a.location}</li>}
                  {a.salary && <li>{a.salary}</li>}
                </ul>
                {a.notes && <p className="muted small">{a.notes}</p>}
              </div>
              <div className="job-actions">
                <button type="button" className="btn btn-primary" onClick={() => { updateApplication(a.id, { status: 'Applied', appliedAt: todayISO() }); toast.success(`Marked ${a.company} as applied.`); }}><LuZap aria-hidden="true" />Mark as applied</button>
                {a.url && <a className="btn btn-ghost" href={a.url} target="_blank" rel="noreferrer"><LuExternalLink aria-hidden="true" />Portal</a>}
                <button type="button" className="btn btn-danger-ghost" onClick={() => { deleteApplication(a.id); toast.info('Removed from saved.'); }}>Remove</button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState icon={LuBookmark} title="Nothing saved yet" text="Use Save on the job board to keep roles you want to revisit." action={<Link to="/jobs" className="btn btn-primary">Browse jobs</Link>} />
      )}
    </>
  );
}
