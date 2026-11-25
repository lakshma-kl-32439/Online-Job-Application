import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LuEye, LuEyeOff, LuLock, LuMail, LuTriangleAlert } from 'react-icons/lu';
import AuthShell from './AuthShell';
import Field from '../components/Field';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { DEMO_ACCOUNTS } from '../utils/constants';
import { isApiMode } from '../services/authService';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => { setForm((f) => ({ ...f, [key]: e.target.value })); setError(''); };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}.`);
      const from = location.state?.from;
      navigate(from && from !== '/login' ? from : '/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const fillDemo = (kind) => {
    setForm({ email: DEMO_ACCOUNTS[kind].email, password: DEMO_ACCOUNTS[kind].password });
    setError('');
  };

  return (
    <AuthShell
      title="Log in"
      subtitle="Pick up where you left off."
      footer={<>New to CareerTrail? <Link to="/signup">Create an account</Link></>}
    >
      <form onSubmit={submit} noValidate className="auth-form">
        {error && <div className="alert alert-error" role="alert"><LuTriangleAlert aria-hidden="true" />{error}</div>}
        <Field label="Email">
          {(p) => (
            <span className="input-icon"><LuMail aria-hidden="true" />
              <input {...p} type="email" name="email" autoComplete="email" value={form.email} onChange={set('email')} placeholder="you@college.edu" required />
            </span>
          )}
        </Field>
        <Field label="Password">
          {(p) => (
            <span className="input-icon"><LuLock aria-hidden="true" />
              <input {...p} type={show ? 'text' : 'password'} name="password" autoComplete="current-password" value={form.password} onChange={set('password')} placeholder="Your password" required />
              <button type="button" className="input-toggle" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
                {show ? <LuEyeOff /> : <LuEye />}
              </button>
            </span>
          )}
        </Field>
        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={busy}>{busy ? <><span className="spinner" aria-hidden="true" />Logging in…</> : 'Log in'}</button>
      </form>

      {!isApiMode && (
        <div className="demo-box">
          <p>Try a demo workspace</p>
          <div className="demo-actions">
            <button type="button" className="btn btn-ghost" onClick={() => fillDemo('user')}>Candidate</button>
            <button type="button" className="btn btn-ghost" onClick={() => fillDemo('admin')}>Admin</button>
          </div>
          <small>Fills the form with a ready-made account. Press Log in to continue.</small>
        </div>
      )}
    </AuthShell>
  );
}
