import { Link } from 'react-router-dom';
import { LuCompass } from 'react-icons/lu';
import EmptyState from '../components/EmptyState';

export default function NotFound() {
  return (
    <div className="notfound">
      <EmptyState
        icon={LuCompass}
        title="That trail does not exist"
        text="The page you are looking for has moved or never existed."
        action={<Link to="/dashboard" className="btn btn-primary">Back to dashboard</Link>}
      />
    </div>
  );
}
