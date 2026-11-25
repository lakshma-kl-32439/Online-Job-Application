import { STATUS_HINT } from '../utils/constants';

const STEPS = ['Wishlist', 'Applied', 'Interview', 'Offer'];

/** The signature element: the pipeline drawn as waypoints on a trail. */
export default function TrailProgress({ counts, onSelect }) {
  const furthest = STEPS.reduce((acc, s, i) => (counts[s] > 0 ? i : acc), -1);
  return (
    <div className="trail">
      <ol className="trail-track">
        {STEPS.map((s, i) => (
          <li key={s} style={{ '--i': i }} className={`waypoint wp-${s.toLowerCase()} ${counts[s] > 0 ? 'reached' : ''} ${i <= furthest ? 'passed' : ''}`}>
            <button type="button" onClick={() => onSelect?.(s)} aria-label={`${counts[s]} in ${s}. ${STATUS_HINT[s]}`}>
              <span className="wp-dot" aria-hidden="true" />
              <strong>{counts[s]}</strong>
              <span className="wp-label">{s}</span>
            </button>
          </li>
        ))}
      </ol>
      {counts.Rejected > 0 && (
        <p className="trail-note">{counts.Rejected} closed without an offer. Every no sharpens the next application.</p>
      )}
    </div>
  );
}
