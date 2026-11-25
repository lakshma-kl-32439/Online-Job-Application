import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LuBookmark, LuBriefcase, LuCalendarClock, LuLayoutDashboard, LuLogOut, LuMenu, LuMoon, LuSearch,
  LuSettings, LuSun, LuUser, LuUsers, LuClipboardList, LuX,
} from 'react-icons/lu';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import Logo from './Logo';
import Avatar from './Avatar';

const USER_NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LuLayoutDashboard },
  { to: '/jobs', label: 'Job board', icon: LuSearch },
  { to: '/applications', label: 'Applications', icon: LuBriefcase },
  { to: '/interviews', label: 'Interviews', icon: LuCalendarClock },
  { to: '/saved', label: 'Saved', icon: LuBookmark },
];

const ADMIN_NAV = [
  { to: '/dashboard', label: 'Overview', icon: LuLayoutDashboard },
  { to: '/admin/jobs', label: 'Vacancies', icon: LuBriefcase },
  { to: '/admin/applications', label: 'Applications', icon: LuClipboardList },
  { to: '/admin/users', label: 'Users', icon: LuUsers },
];

const ACCOUNT_NAV = [
  { to: '/profile', label: 'Profile', icon: LuUser },
  { to: '/settings', label: 'Settings', icon: LuSettings },
];

export default function AppLayout() {
  const { user, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    toast.info('You have been signed out.');
    navigate('/login', { replace: true });
  };

  const nav = isAdmin ? ADMIN_NAV : USER_NAV;
  const renderLink = ({ to, label, icon: Icon }) => (
    <NavLink key={to} to={to} end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
      <Icon aria-hidden="true" />
      <span>{label}</span>
    </NavLink>
  );

  return (
    <div className="shell">
      <aside className={`sidebar ${open ? 'open' : ''}`} aria-label="Main navigation">
        <div className="sidebar-top">
          <Logo tone="light" />
          <button type="button" className="icon-btn sidebar-close" onClick={() => setOpen(false)} aria-label="Close menu"><LuX /></button>
        </div>
        <div className="sidebar-scroll">
          <p className="nav-title">{isAdmin ? 'Admin workspace' : 'Your workspace'}</p>
          <nav className="nav">{nav.map(renderLink)}</nav>
          <p className="nav-title">Account</p>
          <nav className="nav">{ACCOUNT_NAV.map(renderLink)}</nav>
        </div>
        <div className="sidebar-user">
          <Avatar name={user.name} size={38} round />
          <div className="sidebar-user-text">
            <strong>{user.name}</strong>
            <span>{isAdmin ? 'Administrator' : 'Candidate'}</span>
          </div>
          <button type="button" className="icon-btn on-dark" onClick={handleLogout} aria-label="Log out" title="Log out"><LuLogOut /></button>
        </div>
      </aside>
      {open && <button type="button" className="scrim" aria-label="Close menu" onClick={() => setOpen(false)} />}

      <div className="main">
        <header className="topbar">
          <button type="button" className="icon-btn menu-btn" onClick={() => setOpen(true)} aria-label="Open menu"><LuMenu /></button>
          <span className={`role-chip ${isAdmin ? 'is-admin' : ''}`}>{isAdmin ? 'Admin module' : 'Candidate module'}</span>
          <div className="topbar-right">
            <button type="button" className="icon-btn" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} title="Toggle theme">
              {theme === 'dark' ? <LuSun /> : <LuMoon />}
            </button>
            <NavLink to="/profile" className="topbar-user" aria-label="Open your profile">
              <Avatar name={user.name} size={34} round />
              <span>{user.name.split(' ')[0]}</span>
            </NavLink>
          </div>
        </header>
        <main className="content" id="main">
          <div key={location.pathname} className="page-enter"><Outlet /></div>
        </main>
      </div>
    </div>
  );
}
