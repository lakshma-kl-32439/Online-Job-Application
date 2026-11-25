import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LuArrowRight, LuCalendarClock, LuPlus, LuVideo, LuZap } from 'react-icons/lu';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import StatStrip from '../components/StatStrip';
import TrailProgress from '../components/TrailProgress';
import Avatar from '../components/Avatar';
import StatusBadge from '../components/StatusBadge';
import ApplicationModal from '../components/ApplicationModal';
import EmptyState from '../components/EmptyState';
import JoinButton from '../components/JoinButton';
import AdminDashboard from './admin/AdminDashboard';
import { STATUSES } from '../utils/constants';
import { formatShortDate, formatTime, greeting, relativeDay } from '../utils/format';

export default function Dashboard() {
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminDashboard /> : <CandidateDashboard />;
}

function CandidateDashboard() {
  const { user } = useAuth();
  const { applications, jobs, addApplication, applyToJob } = useData();
  const toast = useToast();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);

  const mine = useMemo(() => applications.filter((a) => a.userId === user.id), [applications, user.id]);
  const counts = useMemo(() => Object.fromEntries(STATUSES.map((s) => [s, mine.filter((a) => a.status === s).length])), [mine]);

  const submitted = mine.length - counts.Wishlist;
  const responded = counts.Interview + counts.Offer;
  const responseRate = submitted ? Math.round((responded / submitted) * 100) : 0;

  const upcoming = useMemo(
    () => mine.filter((a) => a.interviewAt && new Date(a.interviewAt) >= new Date(new Date().setHours(0, 0, 0, 0)))
      .sort((a, b) => a.interviewAt.localeCompare(b.interviewAt)),
    [mine],
  );

  const recent = useMemo(() => [...mine].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5), [mine]);

  const openings = useMemo(
    () => jobs.filter((j) => j.status === 'open' && !mine.some((a) => a.jobId === j.id || (a.company === j.company && a.role === j.role))).slice(0, 4),
    [jobs, mine],
  );

  const quickApply = (job) => {
    const result = applyToJob(user, job);
    if (result !== 'exists') toast.success(`Applied to ${job.company}. Tracked in your pipeline.`);
  };

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${user.name.split(' ')[0]}`}
        subtitle={upcoming.length ? `You have ${upcoming.length} interview${upcoming.length > 1 ? 's' : ''} coming up. Next: ${upcoming[0].company}, ${relativeDay(upcoming[0].interviewAt).toLowerCase()}.` : 'Here is where your search stands today.'}
        actions={<button type="button" className="btn btn-primary" onClick={() => setAdding(true)}><LuPlus aria-hidden="true" />Add application</button>}
      />

      <StatStrip
        items={[
          { label: 'Tracked roles', value: mine.length, note: `${counts.Wishlist} on wishlist` },
          { label: 'Applications sent', value: submitted },
          { label: 'Response rate', value: `${responseRate}%`, note: 'Reached interview or offer' },
          { label: 'Offers', value: counts.Offer },
        ]}
      />

      <section className="panel trail-panel" aria-labelledby="trail-h">
        <div className="panel-head">
          <h2 id="trail-h">Your trail</h2>
          <Link to="/applications" className="text-link">Open board <LuArrowRight aria-hidden="true" /></Link>
        </div>
        <TrailProgress counts={counts} onSelect={(s) => navigate(`/applications?status=${encodeURIComponent(s)}`)} />
      </section>

      <div className="grid-2">
        <section className="panel" aria-labelledby="int-h">
          <div className="panel-head">
            <h2 id="int-h">Upcoming interviews</h2>
            <Link to="/interviews" className="text-link">View all <LuArrowRight aria-hidden="true" /></Link>
          </div>
          {upcoming.length ? (
            <ul className="list">
              {upcoming.slice(0, 3).map((a) => (
                <li key={a.id} className="list-row">
                  <span className="date-block"><b>{new Date(a.interviewAt).getDate()}</b>{new Date(a.interviewAt).toLocaleString('en-IN', { month: 'short' })}</span>
                  <div className="list-main"><strong>{a.company}</strong><span>{a.role}</span></div>
                  <div className="list-side"><span><LuVideo aria-hidden="true" /> {a.interviewMode || 'Interview'}</span><small>{relativeDay(a.interviewAt)}, {formatTime(a.interviewAt)}</small></div>
                  <JoinButton app={a} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={LuCalendarClock} title="No interviews scheduled" text="When a company invites you, add the date to its application." action={<Link to="/interviews" className="btn btn-ghost">Schedule one</Link>} />
          )}
        </section>

        <section className="panel" aria-labelledby="open-h">
          <div className="panel-head">
            <h2 id="open-h">Fresh openings</h2>
            <Link to="/jobs" className="text-link">Browse board <LuArrowRight aria-hidden="true" /></Link>
          </div>
          {openings.length ? (
            <ul className="list">
              {openings.map((j) => (
                <li key={j.id} className="list-row">
                  <Avatar name={j.company} size={40} />
                  <div className="list-main"><strong>{j.role}</strong><span>{j.company} • {j.location}</span></div>
                  <button type="button" className="btn btn-soft btn-sm" onClick={() => quickApply(j)} aria-label={`Easy apply to ${j.role} at ${j.company}`}><LuZap aria-hidden="true" />Apply</button>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="You are caught up" text="You have already tracked every open vacancy." />
          )}
        </section>
      </div>

      <section className="panel" aria-labelledby="rec-h">
        <div className="panel-head"><h2 id="rec-h">Recent activity</h2></div>
        {recent.length ? (
          <ul className="list">
            {recent.map((a) => (
              <li key={a.id} className="list-row">
                <Avatar name={a.company} size={40} />
                <div className="list-main"><strong>{a.role}</strong><span>{a.company} • {a.location || 'Location not set'}</span></div>
                <div className="list-side"><StatusBadge status={a.status} /><small>{a.appliedAt ? `Applied ${formatShortDate(a.appliedAt)}` : 'Not applied yet'}</small></div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="Nothing tracked yet" text="Add your first application or browse the job board." action={<Link to="/jobs" className="btn btn-primary">Browse jobs</Link>} />
        )}
      </section>

      {adding && (
        <ApplicationModal
          onClose={() => setAdding(false)}
          onSave={(data) => { addApplication({ ...data, userId: user.id }); setAdding(false); toast.success('Application added to your pipeline.'); }}
        />
      )}
    </>
  );
}
