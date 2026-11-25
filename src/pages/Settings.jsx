import { useState } from 'react';
import { LuDatabase, LuDownload, LuMoon, LuRotateCcw, LuSun } from 'react-icons/lu';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import ConfirmDialog from '../components/ConfirmDialog';
import { isApiMode, resetDemoData } from '../services/authService';

export default function Settings() {
  const { user, isAdmin } = useAuth();
  const { applications, jobs } = useData();
  const { theme, setTheme } = useTheme();
  const toast = useToast();
  const [confirm, setConfirm] = useState(false);

  const exportData = () => {
    const payload = isAdmin
      ? { exportedAt: new Date().toISOString(), jobs, applications }
      : { exportedAt: new Date().toISOString(), user, applications: applications.filter((a) => a.userId === user.id) };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `careertrail-${isAdmin ? 'workspace' : 'my-data'}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success('Export downloaded.');
  };

  const reset = async () => {
    await resetDemoData();
    window.location.assign('/login');
  };

  return (
    <>
      <PageHeader title="Settings" subtitle="Appearance, your data and workspace tools." />
      <div className="stack-lg narrow">
        <section className="panel">
          <div className="panel-head"><h2>Appearance</h2></div>
          <div className="theme-options" role="radiogroup" aria-label="Theme">
            {[['light', 'Light', LuSun], ['dark', 'Dark', LuMoon]].map(([value, label, Icon]) => (
              <button key={value} type="button" role="radio" aria-checked={theme === value} className={`theme-opt theme-${value} ${theme === value ? 'on' : ''}`} onClick={() => setTheme(value)}>
                <span className="theme-preview" aria-hidden="true"><i /><i /><i /></span>
                <span><Icon aria-hidden="true" /> {label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-head"><h2>Your data</h2></div>
          <p className="muted">Applications and vacancies are stored in this browser. Download a copy any time.</p>
          <div className="row-actions"><button type="button" className="btn btn-ghost" onClick={exportData}><LuDownload aria-hidden="true" />Export as JSON</button></div>
        </section>

        <section className="panel">
          <div className="panel-head"><h2>Sign-in method</h2></div>
          <p className="muted"><LuDatabase aria-hidden="true" className="inline-icon" /> {isApiMode ? 'Express API with JWT tokens' : 'Browser storage (localStorage) with salted password hashes'}</p>
        </section>

        <section className="panel danger-zone">
          <div className="panel-head"><h2>Reset demo data</h2></div>
          <p className="muted">Deletes every account, application and vacancy in this browser and restores the sample workspace. You will be signed out.</p>
          <div className="row-actions"><button type="button" className="btn btn-danger-ghost" onClick={() => setConfirm(true)}><LuRotateCcw aria-hidden="true" />Reset everything</button></div>
        </section>
      </div>

      {confirm && (
        <ConfirmDialog
          title="Reset all data?"
          message="Every account you created, along with all applications and vacancies, will be replaced by the sample data."
          confirmLabel="Reset data"
          onCancel={() => setConfirm(false)}
          onConfirm={reset}
        />
      )}
    </>
  );
}
