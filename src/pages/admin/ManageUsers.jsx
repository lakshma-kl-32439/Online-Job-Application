import { useMemo, useState } from 'react';
import { LuSearch, LuTrash2, LuUsers } from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { deleteUser, listUsers, setUserRole } from '../../services/authService';
import PageHeader from '../../components/PageHeader';
import Avatar from '../../components/Avatar';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import { formatDate, pluralize } from '../../utils/format';

export default function ManageUsers() {
  const { user: me } = useAuth();
  const { applications, removeApplicationsByUser } = useData();
  const toast = useToast();
  const [users, setUsers] = useState(() => listUsers());
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('all');
  const [confirm, setConfirm] = useState(null);

  const appCount = useMemo(() => {
    const m = {};
    applications.forEach((a) => { m[a.userId] = (m[a.userId] || 0) + 1; });
    return m;
  }, [applications]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users
      .filter((u) => (role === 'all' || u.role === role) && (!q || `${u.name} ${u.email} ${u.college || ''}`.toLowerCase().includes(q)))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [users, query, role]);

  const changeRole = (u, next) => {
    setUserRole(u.id, next);
    setUsers(listUsers());
    toast.success(`${u.name} is now ${next === 'admin' ? 'an administrator' : 'a candidate'}.`);
  };

  const remove = () => {
    deleteUser(confirm.id);
    removeApplicationsByUser(confirm.id);
    setUsers(listUsers());
    toast.success(`${confirm.name} was removed.`);
    setConfirm(null);
  };

  return (
    <>
      <PageHeader title="Users" subtitle={`${pluralize(users.length, 'account')} on the platform.`} />
      <div className="toolbar">
        <label className="search"><LuSearch aria-hidden="true" /><span className="sr-only">Search users</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, email or college" />
        </label>
        <div className="view-toggle" role="group" aria-label="Filter by role">
          {[['all', 'Everyone'], ['user', 'Candidates'], ['admin', 'Admins']].map(([v, l]) => (
            <button key={v} type="button" className={role === v ? 'on' : ''} aria-pressed={role === v} onClick={() => setRole(v)}>{l}</button>
          ))}
        </div>
      </div>

      {list.length ? (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Person</th><th>College</th><th>Applications</th><th>Joined</th><th>Role</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {list.map((u) => {
                const self = u.id === me.id;
                return (
                  <tr key={u.id}>
                    <td data-label="Person"><div className="cell-main"><Avatar name={u.name} size={36} round /><span><strong>{u.name}{self && <em className="you">You</em>}</strong><small>{u.email}</small></span></div></td>
                    <td data-label="College">{u.college || '—'}</td>
                    <td data-label="Applications">{appCount[u.id] || 0}</td>
                    <td data-label="Joined">{formatDate(u.createdAt)}</td>
                    <td data-label="Role">
                      <label className="select-inline">
                        <span className="sr-only">Role for {u.name}</span>
                        <select value={u.role} disabled={self} onChange={(e) => changeRole(u, e.target.value)}>
                          <option value="user">Candidate</option>
                          <option value="admin">Admin</option>
                        </select>
                      </label>
                    </td>
                    <td className="cell-actions">
                      <button type="button" className="icon-btn danger" disabled={self} onClick={() => setConfirm(u)} aria-label={`Delete ${u.name}`} title={self ? 'You cannot delete your own account' : 'Delete user'}><LuTrash2 /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState icon={LuUsers} title="No users match your search" text="Try a different name or filter." />
      )}

      {confirm && (
        <ConfirmDialog
          title={`Delete ${confirm.name}?`}
          message="Their account and all of their tracked applications will be permanently removed."
          confirmLabel="Delete user"
          onCancel={() => setConfirm(null)}
          onConfirm={remove}
        />
      )}
    </>
  );
}
