import { useMemo, useState } from 'react';
import { LuClipboardList, LuSearch } from 'react-icons/lu';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { listUsers } from '../../services/authService';
import PageHeader from '../../components/PageHeader';
import Avatar from '../../components/Avatar';
import EmptyState from '../../components/EmptyState';
import { STATUSES } from '../../utils/constants';
import { formatDate, pluralize } from '../../utils/format';

export default function AllApplications() {
  const { applications, updateApplication } = useData();
  const toast = useToast();
  const users = useMemo(() => listUsers(), []);
  const byId = useMemo(() => Object.fromEntries(users.map((u) => [u.id, u])), [users]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return applications
      .filter((a) => a.status !== 'Wishlist')
      .filter((a) => status === 'All' || a.status === status)
      .filter((a) => !q || `${a.company} ${a.role} ${byId[a.userId]?.name || ''}`.toLowerCase().includes(q))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [applications, query, status, byId]);

  const submitted = applications.filter((a) => a.status !== 'Wishlist');

  const change = (a, next) => {
    updateApplication(a.id, { status: next });
    toast.success(`${byId[a.userId]?.name || 'Candidate'}'s application moved to ${next}.`);
  };

  return (
    <>
      <PageHeader title="Applications" subtitle={`${pluralize(submitted.length, 'application')} submitted across all candidates.`} />
      <div className="toolbar">
        <label className="search"><LuSearch aria-hidden="true" /><span className="sr-only">Search applications</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by candidate, company or role" />
        </label>
      </div>
      <div className="chip-filters" role="group" aria-label="Filter by status">
        {['All', ...STATUSES.filter((s) => s !== 'Wishlist')].map((s) => (
          <button key={s} type="button" className={status === s ? 'on' : ''} aria-pressed={status === s} onClick={() => setStatus(s)}>
            {s}<b>{s === 'All' ? submitted.length : submitted.filter((a) => a.status === s).length}</b>
          </button>
        ))}
      </div>

      {list.length ? (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Candidate</th><th>Role</th><th>Applied</th><th>Status</th></tr></thead>
            <tbody>
              {list.map((a) => (
                <tr key={a.id}>
                  <td data-label="Candidate"><div className="cell-main"><Avatar name={byId[a.userId]?.name || '?'} size={36} round /><span><strong>{byId[a.userId]?.name || 'Unknown candidate'}</strong><small>{byId[a.userId]?.email || ''}</small></span></div></td>
                  <td data-label="Role"><div className="cell-main"><Avatar name={a.company} size={36} /><span><strong>{a.role}</strong><small>{a.company}</small></span></div></td>
                  <td data-label="Applied">{formatDate(a.appliedAt)}</td>
                  <td data-label="Status">
                    <label className={`select-inline status-select s-${a.status.toLowerCase()}`}>
                      <span className="sr-only">Status for {a.role}</span>
                      <select value={a.status} onChange={(e) => change(a, e.target.value)}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState icon={LuClipboardList} title="No applications match" text="Try a different search or status." />
      )}
    </>
  );
}
