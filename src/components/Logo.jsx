export function LogoMark({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="logo-mark">
      <rect width="64" height="64" rx="16" className="logo-bg" />
      <path d="M14 46c8 0 8-10 16-10s8-14 20-18" fill="none" stroke="#2DD4BF" strokeWidth="5" strokeLinecap="round" />
      <circle cx="14" cy="46" r="5" fill="#fff" />
      <circle cx="50" cy="18" r="6" fill="#FFC531" />
    </svg>
  );
}

export default function Logo({ size = 32, tone = 'dark' }) {
  return (
    <span className={`logo logo-${tone}`}>
      <LogoMark size={size} />
      <span className="logo-word">CareerTrail</span>
    </span>
  );
}
