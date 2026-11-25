import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LuBriefcase, LuCalendarClock, LuLayoutGrid, LuList, LuMapPin, LuPlus, LuSearch } from 'react-icons/lu';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import Avatar from '../components/Avatar';
import StatusBadge from '../components/StatusBadge';
import ApplicationModal from '../components/ApplicationModal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import { STATUSES } from '../utils/constants';
import { formatShortDate } from '../utils/format';

export default function Applications() {
  const { user } = useAuth();
  const { applications, addApplication, updateApplication, deleteApplication } = useData();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const statusParam = STATUSES.includes(params.get('status')) ? params.get('status') : 'All';
  const [view, setView] = useState(statusParam !== 'All' ? 'list' : 'board');
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState(null); // {mode:'new', status} | {mode:'edit', app}
  const [confirm, setConfirm] = useState(null);
  const [dragId, setDragId] = useState(null);
  const [overCol, setOverCol] = useState(null);

  const mine = useMemo(() => applications.filter((a) => a.userId === user.id), [applications, user.id]);
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return mine.filter((a) => !q || `${a.company} ${a.role} ${a.location}`.toLowerCase().includes(q));
  }, [mine, query]);
  const listItems = matches.filter((a) => statusParam === 'All' || a.status === statusParam).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const setStatusFilter = (s) => {
    const next = new URLSearchParams(params);
    if (s === 'All') next.delete('status'); else next.set('status', s);
    setParams(next, { replace: true });
  };

  const move = (id, status) => {
    const app = mine.find((a) => a.id === id);
    if (!app || app.status === status) return;
    updateApplication(id, { status });
    toast.success(`${app.company} moved to ${status}.`);
  };

  const onDrop = (e, status) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || dragId;
    setOverCol(null); setDragId(null);
    if (id) move(id, status);
  };

  const save = (data) => {
    if (modal.mode === 'edit') {
      updateApplication(modal.app.id, data);
      toast.success('Application updated.');
    } else {
      addApplication({ ...data, userId: user.id });
      toast.success('Application added.');
    }
    setModal(null);
  };

  return (
    <>
      <PageHeader
        title="Applications"
        subtitle="Drag cards between columns as each application progresses."
        actions={<button type="button" className="btn btn-primary" onClick={() => setModal({ mode: 'new' })}><LuPlus aria-hidden="true" />Add application</button>}
      />

      <div className="toolbar">
        <label className="search">
          <LuSearch aria-hidden="true" />
          <span className="sr-only">Search applications</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search company, role or city" />
        </label>
        <div className="view-toggle" role="group" aria-label="View">
          <button type="button" className={view === 'board' ? 'on' : ''} onClick={() => setView('board')} aria-pressed={view === 'board'}><LuLayoutGrid aria-hidden="true" />Board</button>
          <button type="button" className={view === 'list' ? 'on' : ''} onClick={() => setView('list')} aria-pressed={view === 'list'}><LuList aria-hidden="true" />List</button>
        </div>
      </div>

      {view === 'list' && (
        <div className="chip-filters" role="group" aria-label="Filter by status">
          {['All', ...STATUSES].map((s) => (
            <button key={s} type="button" className={statusParam === s ? 'on' : ''} onClick={() => setStatusFilter(s)} aria-pressed={statusParam === s}>
              {s}<b>{s === 'All' ? matches.length : matches.filter((a) => a.status === s).length}</b>
            </button>
          ))}
        </div>
      )}

      {mine.length === 0 ? (
        <EmptyState icon={LuBriefcase} title="No applications yet" text="Add a role you applied for, or use Easy apply on the job board." action={<button type="button" className="btn btn-primary" onClick={() => setModal({ mode: 'new' })}>Add application</button>} />
      ) : view === 'board' ? (
        <div className="board">
          {STATUSES.map((s) => {
            const items = matches.filter((a) => a.status === s);
            return (
              <section
                key={s}
                className={`column col-${s.toLowerCase()} ${overCol === s ? 'is-over' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setOverCol(s); }}
                onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOverCol(null); }}
                onDrop={(e) => onDrop(e, s)}
                aria-label={`${s} column`}
              >
                <header className="column-head">
                  <h2><i aria-hidden="true" />{s}</h2>
                  <span>{items.length}</span>
                  <button type="button" className="icon-btn-sm" onClick={() => setModal({ mode: 'new', status: s })} aria-label={`Add application to ${s}`}><LuPlus /></button>
                </header>
                <div className="column-body">
                  {items.map((a) => (
                    <article
                      key={a.id}
                      className={`kcard ${dragId === a.id ? 'dragging' : ''}`}
                      draggable
                      onDragStart={(e) => { setDragId(a.id); e.dataTransfer.setData('text/plain', a.id); e.dataTransfer.effectAllowed = 'move'; }}
                      onDragEnd={() => { setDragId(null); setOverCol(null); }}
                    >
                      <button type="button" className="kcard-open" onClick={() => setModal({ mode: 'edit', app: a })}>
                        <span className="kcard-top"><Avatar name={a.company} size={32} /><span><strong>{a.company}</strong><small>{a.role}</small></span></span>
                        <span className="kcard-meta">
                          {a.location && <span><LuMapPin aria-hidden="true" />{a.location}</span>}
                          {a.interviewAt && <span className="hl"><LuCalendarClock aria-hidden="true" />{formatShortDate(a.interviewAt)}</span>}
                        </span>
                      </button>
                      <label className="kcard-move">
                        <span className="sr-only">Move {a.company} to another stage</span>
                        <select value={a.status} onChange={(e) => move(a.id, e.target.value)}>{STATUSES.map((x) => <option key={x}>{x}</option>)}</select>
                      </label>
                    </article>
                  ))}
                  {!items.length && <p className="column-empty">Drop a card here</p>}
                </div>
              </section>
            );
          })}
        </div>
      ) : listItems.length ? (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Role</th><th>Location</th><th>Applied</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {listItems.map((a) => (
                <tr key={a.id}>
                  <td data-label="Role"><div className="cell-main"><Avatar name={a.company} size={36} /><span><strong>{a.role}</strong><small>{a.company}</small></span></div></td>
                  <td data-label="Location">{a.location || '—'}</td>
                  <td data-label="Applied">{a.appliedAt ? formatShortDate(a.appliedAt) : '—'}</td>
                  <td data-label="Status"><StatusBadge status={a.status} /></td>
                  <td className="cell-actions"><button type="button" className="btn btn-ghost btn-sm" onClick={() => setModal({ mode: 'edit', app: a })}>Details</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="Nothing in this stage" text="Change the filter or add a new application." />
      )}

      {modal && (
        <ApplicationModal
          application={modal.mode === 'edit' ? modal.app : undefined}
          defaultStatus={modal.status}
          onClose={() => setModal(null)}
          onSave={save}
          onDelete={() => setConfirm(modal.app)}
        />
      )}
      {confirm && (
        <ConfirmDialog
          title="Delete this application?"
          message={`${confirm.role} at ${confirm.company} will be removed from your pipeline. This cannot be undone.`}
          onCancel={() => setConfirm(null)}
          onConfirm={() => { deleteApplication(confirm.id); setConfirm(null); setModal(null); toast.success('Application deleted.'); }}
        />
      )}
    </>
  );
}
