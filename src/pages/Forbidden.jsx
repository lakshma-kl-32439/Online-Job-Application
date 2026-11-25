import { Link } from 'react-router-dom';
import { LuShieldAlert } from 'react-icons/lu';
import EmptyState from '../components/EmptyState';

export default function Forbidden({ allowed = [] }) {
  const who = allowed.includes('admin') ? 'administrators' : 'candidates';
  return (
    <EmptyState
      icon={LuShieldAlert}
      title="This page is not available for your role"
      text={`It is reserved for ${who}. Head back to your dashboard to continue.`}
      action={<Link to="/dashboard" className="btn btn-primary">Go to dashboard</Link>}
    />
  );
}
