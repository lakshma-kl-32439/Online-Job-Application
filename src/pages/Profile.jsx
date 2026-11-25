import { useMemo, useState } from 'react';
import { LuGithub, LuGlobe, LuLinkedin, LuLock, LuMail, LuMapPin, LuPhone, LuSave, LuTriangleAlert } from 'react-icons/lu';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import Field from '../components/Field';
import Avatar from '../components/Avatar';
import { formatDate } from '../utils/format';

const toForm = (u) => ({
  name: u.name || '', headline: u.headline || '', phone: u.phone || '', college: u.college || '', location: u.location || '',
  bio: u.bio || '', skills: (u.skills || []).join(', '),
  linkedin: u.links?.linkedin || '', github: u.links?.github || '', portfolio: u.links?.portfolio || '',
});

const urlOk = (v) => !v || /^https?:\/\//i.test(v.trim());

export default function Profile() {
  const { user, isAdmin, updateProfile, changePassword } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState(() => toForm(user));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwBusy, setPwBusy] = useState(false);

  const set = (key) => (e) => { setForm((f) => ({ ...f, [key]: e.target.value })); setErrors((x) => ({ ...x, [key]: '' })); };
  const skills = useMemo(() => form.skills.split(',').map((s) => s.trim()).filter(Boolean), [form.skills]);

  const completeness = useMemo(() => {
    const checks = isAdmin
      ? [form.name, form.headline, form.phone, form.college, form.location, form.bio]
      : [form.name, form.headline, form.phone, form.college, form.location, form.bio, skills.length, form.linkedin, form.github];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [form, skills, isAdmin]);

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (form.name.trim().length < 2) next.name = 'Enter your full name.';
    ['linkedin', 'github', 'portfolio'].forEach((k) => { if (!urlOk(form[k])) next[k] = 'Start the link with http:// or https://'; });
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    try {
      await updateProfile({
        name: form.name.trim(), headline: form.headline.trim(), phone: form.phone.trim(), college: form.college.trim(),
        location: form.location.trim(), bio: form.bio.trim(), skills,
        links: { linkedin: form.linkedin.trim(), github: form.github.trim(), portfolio: form.portfolio.trim() },
      });
      toast.success('Profile saved.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const submitPw = async (e) => {
    e.preventDefault();
    setPwError('');
    if (!pw.current) return setPwError('Enter your current password.');
    if (pw.next.length < 6) return setPwError('Use at least 6 characters for the new password.');
    if (pw.next !== pw.confirm) return setPwError('The new passwords do not match.');
    setPwBusy(true);
    try {
      await changePassword(pw.current, pw.next);
      setPw({ current: '', next: '', confirm: '' });
      toast.success('Password updated.');
    } catch (err) {
      setPwError(err.message);
    } finally {
      setPwBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Profile" subtitle="Keep your details current so recruiters and your placement cell can reach you." />
      <div className="profile-grid">
        <aside className="panel profile-card">
          <Avatar name={user.name} size={88} round />
          <h2>{user.name}</h2>
          <p className="muted">{user.headline || (isAdmin ? 'Placement administrator' : 'Candidate')}</p>
          <span className={`role-chip ${isAdmin ? 'is-admin' : ''}`}>{isAdmin ? 'Administrator' : 'Candidate'}</span>
          <ul className="profile-facts">
            <li><LuMail aria-hidden="true" />{user.email}</li>
            {user.phone && <li><LuPhone aria-hidden="true" />{user.phone}</li>}
            {user.location && <li><LuMapPin aria-hidden="true" />{user.location}</li>}
          </ul>
          <div className="meter" role="img" aria-label={`Profile ${completeness}% complete`}>
            <div className="meter-top"><span>Profile completeness</span><b>{completeness}%</b></div>
            <div className="meter-bar"><span style={{ width: `${completeness}%` }} /></div>
          </div>
          <small className="muted">Member since {formatDate(user.createdAt)}</small>
        </aside>

        <div className="stack-lg">
          <form className="panel" onSubmit={submit} noValidate>
            <div className="panel-head"><h2>Personal details</h2></div>
            <div className="form-grid">
              <Field label="Full name" error={errors.name}>{(p) => <input {...p} value={form.name} onChange={set('name')} autoComplete="name" />}</Field>
              <Field label="Email" hint="Your email is your login and cannot be changed.">{(p) => <input {...p} value={user.email} readOnly disabled />}</Field>
              <Field label="Headline">{(p) => <input {...p} value={form.headline} onChange={set('headline')} placeholder={isAdmin ? 'e.g. Placement Officer' : 'e.g. Frontend developer • B.Tech CSE'} />}</Field>
              <Field label="Phone">{(p) => <input {...p} type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" autoComplete="tel" />}</Field>
              <Field label={isAdmin ? 'Organisation' : 'College'}>{(p) => <input {...p} value={form.college} onChange={set('college')} placeholder={isAdmin ? 'Placement cell name' : 'Your college'} />}</Field>
              <Field label="Location">{(p) => <input {...p} value={form.location} onChange={set('location')} placeholder="City" />}</Field>
              <Field label="About" className="span-2">{(p) => <textarea {...p} rows={3} value={form.bio} onChange={set('bio')} placeholder="A short introduction" />}</Field>
              {!isAdmin && (
                <>
                  <Field label="Skills" hint="Separate skills with commas." className="span-2">
                    {(p) => <input {...p} value={form.skills} onChange={set('skills')} placeholder="React, JavaScript, SQL" />}
                  </Field>
                  {skills.length > 0 && <ul className="chips span-2" aria-label="Skills preview">{skills.map((s) => <li key={s}>{s}</li>)}</ul>}
                  <Field label="LinkedIn" error={errors.linkedin}>{(p) => <span className="input-icon"><LuLinkedin aria-hidden="true" /><input {...p} value={form.linkedin} onChange={set('linkedin')} placeholder="https://linkedin.com/in/you" /></span>}</Field>
                  <Field label="GitHub" error={errors.github}>{(p) => <span className="input-icon"><LuGithub aria-hidden="true" /><input {...p} value={form.github} onChange={set('github')} placeholder="https://github.com/you" /></span>}</Field>
                  <Field label="Portfolio" error={errors.portfolio} className="span-2">{(p) => <span className="input-icon"><LuGlobe aria-hidden="true" /><input {...p} value={form.portfolio} onChange={set('portfolio')} placeholder="https://your-site.dev" /></span>}</Field>
                </>
              )}
            </div>
            <div className="form-actions"><button type="submit" className="btn btn-primary" disabled={saving}><LuSave aria-hidden="true" />{saving ? 'Saving…' : 'Save profile'}</button></div>
          </form>

          <form className="panel" onSubmit={submitPw} noValidate>
            <div className="panel-head"><h2>Change password</h2></div>
            {pwError && <div className="alert alert-error" role="alert"><LuTriangleAlert aria-hidden="true" />{pwError}</div>}
            <div className="form-grid cols-3">
              <Field label="Current password">{(p) => <span className="input-icon"><LuLock aria-hidden="true" /><input {...p} type="password" autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} /></span>}</Field>
              <Field label="New password">{(p) => <span className="input-icon"><LuLock aria-hidden="true" /><input {...p} type="password" autoComplete="new-password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} /></span>}</Field>
              <Field label="Confirm new password">{(p) => <span className="input-icon"><LuLock aria-hidden="true" /><input {...p} type="password" autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} /></span>}</Field>
            </div>
            <div className="form-actions"><button type="submit" className="btn btn-ghost" disabled={pwBusy}>{pwBusy ? 'Updating…' : 'Update password'}</button></div>
          </form>
        </div>
      </div>
    </>
  );
}
