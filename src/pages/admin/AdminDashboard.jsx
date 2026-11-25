import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { LuArrowRight } from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { listUsers } from '../../services/authService';
import PageHeader from '../../components/PageHeader';
import StatStrip from '../../components/StatStrip';
import { BarList, Donut, Legend } from '../../components/Charts';
import Avatar from '../../components/Avatar';
import StatusBadge from '../../components/StatusBadge';
import { STATUSES } from '../../utils/constants';
import { formatShortDate, greeting, relativeDay } from '../../utils/format';

const STATUS_COLORS = {
  Wishlist: 'var(--s-wishlist)', Applied: 'var(--s-applied)', Interview: 'var(--s-interview)', Offer: 'var(--s-offer)', Rejected: 'var(--s-rejected)',
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const { jobs, applications } = useData();
  const users = useMemo(() => listUsers(), []);
  const byId = useMemo(() => Object.fromEntries(users.map((u) => [u.id, u])), [users]);

  const candidates = users.filter((u) => u.role === 'user');
  const openJobs = jobs.filter((j) => j.status === 'open');
  const offers = applications.filter((a) => a.status === 'Offer');
  const placed = new Set(offers.map((a) => a.userId)).size;
  const rate = candidates.length ? Math.round((placed / candidates.length) * 100) : 0;

  const statusData = STATUSES.map((s) => ({ label: s, value: applications.filter((a) => a.status === s).length, color: STATUS_COLORS[s] }));

  const companies = useMemo(() => {
    const map = {};
    applications.forEach((a) => { map[a.company] = (map[a.company] || 0) + 1; });
    return Object.entries(map).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 6);
  }, [applications]);

  const recent = useMemo(() => [...applications].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 6), [applications]);
  const interviews = useMemo(
    () => applications.filter((a) => a.interviewAt && new Date(a.interviewAt) >= new Date(new Date().setHours(0, 0, 0, 0))).sort((a, b) => a.interviewAt.localeCompare(b.interviewAt)).slice(0, 4),
    [applications],
  );
  const newest = useMemo(() => [...candidates].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4), [candidates]);

  return (
    <>
      <PageHeader title={`${greeting()}, ${user.name.split(' ')[0]}`} subtitle="A live view of vacancies, candidates and placement progress." />

      <StatStrip
        items={[
          { label: 'Candidates', value: candidates.length, note: 'Registered on the platform' },
          { label: 'Open vacancies', value: openJobs.length, note: `${jobs.length - openJobs.length} closed` },
          { label: 'Applications', value: applications.length, note: `${offers.length} offers made` },
          { label: 'Placement rate', value: `${rate}%`, note: `${placed} of ${candidates.length} candidates have an offer` },
        ]}
      />

      <div className="grid-2">
        <section className="panel" aria-labelledby="dist-h">
          <div className="panel-head"><h2 id="dist-h">Pipeline distribution</h2></div>
          <div className="chart-row">
            <Donut data={statusData} centerValue={applications.length} centerLabel="applications" />
            <Legend data={statusData} />
          </div>
        </section>
        <section className="panel" aria-labelledby="comp-h">
          <div className="panel-head"><h2 id="comp-h">Most applied companies</h2></div>
          {companies.length ? <BarList items={companies} /> : <p className="muted">No applications yet.</p>}
        </section>
      </div>

      <section className="panel" aria-labelledby="rec-h">
        <div className="panel-head"><h2 id="rec-h">Latest activity</h2><Link to="/admin/applications" className="text-link">All applications <LuArrowRight aria-hidden="true" /></Link></div>
        <ul className="list">
          {recent.map((a) => (
            <li key={a.id} className="list-row">
              <Avatar name={byId[a.userId]?.name || a.company} size={40} round />
              <div className="list-main"><strong>{byId[a.userId]?.name || 'Unknown candidate'}</strong><span>{a.role} at {a.company}</span></div>
              <div className="list-side"><StatusBadge status={a.status} /><small>{a.appliedAt ? `Applied ${formatShortDate(a.appliedAt)}` : 'Saved'}</small></div>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid-2">
        <section className="panel" aria-labelledby="ai-h">
          <div className="panel-head"><h2 id="ai-h">Upcoming interviews</h2></div>
          {interviews.length ? (
            <ul className="list">
              {interviews.map((a) => (
                <li key={a.id} className="list-row">
                  <span className="date-block"><b>{new Date(a.interviewAt).getDate()}</b>{new Date(a.interviewAt).toLocaleString('en-IN', { month: 'short' })}</span>
                  <div className="list-main"><strong>{byId[a.userId]?.name || 'Candidate'}</strong><span>{a.company} • {a.role}</span></div>
                  <small className="list-side">{relativeDay(a.interviewAt)}</small>
                </li>
              ))}
            </ul>
          ) : <p className="muted">No interviews scheduled.</p>}
        </section>
        <section className="panel" aria-labelledby="nu-h">
          <div className="panel-head"><h2 id="nu-h">New candidates</h2><Link to="/admin/users" className="text-link">Manage users <LuArrowRight aria-hidden="true" /></Link></div>
          {newest.length ? (
            <ul className="list">
              {newest.map((u) => (
                <li key={u.id} className="list-row">
                  <Avatar name={u.name} size={40} round />
                  <div className="list-main"><strong>{u.name}</strong><span>{u.college || u.email}</span></div>
                  <small className="list-side">Joined {formatShortDate(u.createdAt)}</small>
                </li>
              ))}
            </ul>
          ) : <p className="muted">No candidates have signed up yet.</p>}
        </section>
      </div>
    </>
  );
}
