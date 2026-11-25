import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LuEye, LuEyeOff, LuKeyRound, LuLock, LuMail, LuTriangleAlert, LuUser } from 'react-icons/lu';
import AuthShell from './AuthShell';
import Field from '../components/Field';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ROLES } from '../utils/constants';
import { isEmail } from '../utils/format';

export default function Signup() {
  const { signup } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: ROLES.USER, adminCode: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => { setForm((f) => ({ ...f, [key]: e.target.value })); setErrors((x) => ({ ...x, [key]: '' })); setFormError(''); };

  const validate = () => {
    const next = {};
    if (form.name.trim().length < 2) next.name = 'Enter your full name.';
    if (!isEmail(form.email)) next.email = 'Enter a valid email address.';
    if (form.password.length < 6) next.password = 'Use at least 6 characters.';
    if (form.confirm !== form.password) next.confirm = 'Passwords do not match.';
    if (form.role === ROLES.ADMIN && !form.adminCode.trim()) next.adminCode = 'Enter the admin invite code.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    try {
      const user = await signup({ name: form.name, email: form.email, password: form.password, role: form.role, adminCode: form.adminCode });
      toast.success(`Account created. Welcome, ${user.name.split(' ')[0]}!`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setFormError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Free to use. Your data stays in this browser."
      footer={<>Already have an account? <Link to="/login">Log in</Link></>}
    >
      <form onSubmit={submit} noValidate className="auth-form">
        {formError && <div className="alert alert-error" role="alert"><LuTriangleAlert aria-hidden="true" />{formError}</div>}

        <fieldset className="segmented" aria-label="Account type">
          <legend className="sr-only">Account type</legend>
          {[[ROLES.USER, 'Candidate'], [ROLES.ADMIN, 'Admin']].map(([value, label]) => (
            <label key={value} className={form.role === value ? 'on' : ''}>
              <input type="radio" name="role" value={value} checked={form.role === value} onChange={set('role')} />
              {label}
            </label>
          ))}
        </fieldset>

        <Field label="Full name" error={errors.name}>
          {(p) => <span className="input-icon"><LuUser aria-hidden="true" /><input {...p} name="name" autoComplete="name" value={form.name} onChange={set('name')} placeholder="Your full name" /></span>}
        </Field>
        <Field label="Email" error={errors.email}>
          {(p) => <span className="input-icon"><LuMail aria-hidden="true" /><input {...p} type="email" name="email" autoComplete="email" value={form.email} onChange={set('email')} placeholder="you@college.edu" /></span>}
        </Field>
        <div className="form-row">
          <Field label="Password" error={errors.password}>
            {(p) => (
              <span className="input-icon"><LuLock aria-hidden="true" />
                <input {...p} type={show ? 'text' : 'password'} name="password" autoComplete="new-password" value={form.password} onChange={set('password')} placeholder="6+ characters" />
                <button type="button" className="input-toggle" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide passwords' : 'Show passwords'}>{show ? <LuEyeOff /> : <LuEye />}</button>
              </span>
            )}
          </Field>
          <Field label="Confirm password" error={errors.confirm}>
            {(p) => <span className="input-icon"><LuLock aria-hidden="true" /><input {...p} type={show ? 'text' : 'password'} name="confirm" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} placeholder="Repeat it" /></span>}
          </Field>
        </div>

        {form.role === ROLES.ADMIN && (
          <Field label="Admin invite code" error={errors.adminCode} hint="Ask your placement coordinator. Demo code: CT-ADMIN-2026">
            {(p) => <span className="input-icon"><LuKeyRound aria-hidden="true" /><input {...p} name="adminCode" value={form.adminCode} onChange={set('adminCode')} placeholder="Invite code" /></span>}
          </Field>
        )}

        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={busy}>{busy ? <><span className="spinner" aria-hidden="true" />Creating account…</> : 'Create account'}</button>
      </form>
    </AuthShell>
  );
}
