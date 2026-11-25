import { LuExternalLink, LuLink } from 'react-icons/lu';

const ONLINE = ['Video call', 'Online assessment'];

/** Opens the meeting / assessment page. Shows "Add link" when an online round has no link yet. */
export default function JoinButton({ app, onAddLink, size = 'sm' }) {
  const isTest = app.interviewMode === 'Online assessment';
  if (app.interviewUrl) {
    return (
      <a
        className={`btn btn-primary btn-${size} join-btn`}
        href={app.interviewUrl}
        target="_blank"
        rel="noreferrer"
        aria-label={`${isTest ? 'Start assessment' : 'Join meeting'} for ${app.company} (opens in a new tab)`}
      >
        <LuExternalLink aria-hidden="true" />
        {isTest ? 'Start assessment' : 'Join meeting'}
      </a>
    );
  }
  if (onAddLink && ONLINE.includes(app.interviewMode)) {
    return (
      <button type="button" className={`btn btn-ghost btn-${size}`} onClick={() => onAddLink(app)}>
        <LuLink aria-hidden="true" />Add link
      </button>
    );
  }
  return null;
}
