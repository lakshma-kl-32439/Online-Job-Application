import { LogoMark } from './Logo';

export default function Splash() {
  return (
    <div className="splash" role="status" aria-label="Loading CareerTrail">
      <LogoMark size={56} />
      <div className="splash-bar"><span /></div>
    </div>
  );
}
