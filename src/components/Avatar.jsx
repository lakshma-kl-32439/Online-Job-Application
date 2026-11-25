import { hueFrom, initials } from '../utils/format';

/** Colour-coded monogram for companies and people. */
export default function Avatar({ name, size = 40, round = false }) {
  const hue = hueFrom(name);
  return (
    <span
      className={`avatar ${round ? 'avatar-round' : ''}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38), '--h': hue }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
