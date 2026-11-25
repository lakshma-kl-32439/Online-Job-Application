import { useMemo } from 'react';
import { LuBriefcase, LuShieldCheck } from 'react-icons/lu';
import Logo from '../components/Logo';
import { useTheme } from '../context/ThemeContext';
import { LuMoon, LuSun } from 'react-icons/lu';

/** Topographic contour lines – the "terrain" the trail runs through. */
function Contours() {
  const paths = useMemo(() => {
    const out = [];
    for (let i = 0; i < 16; i += 1) {
      const y0 = 40 + i * 44;
      let d = `M-20 ${y0}`;
      for (let x = 0; x <= 640; x += 40) {
        const y = y0 + Math.sin((x + i * 55) / 85) * (18 + i * 1.6) + Math.cos((x * 0.6 + i * 30) / 70) * 12;
        d += ` L${x} ${y.toFixed(1)}`;
      }
      out.push(d);
    }
    return out;
  }, []);
  return (
    <svg className="contours" viewBox="0 0 620 760" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {paths.map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}

function TrailArt() {
  return (
    <svg className="trail-art" viewBox="0 0 520 190" aria-hidden="true">
      <path className="trail-art-path" d="M24 150 C 110 150, 120 70, 200 84 S 320 150, 372 98 S 440 34, 494 40" />
      <circle className="trail-art-runner" r="6">
        <animateMotion dur="6s" repeatCount="indefinite" path="M24 150 C 110 150, 120 70, 200 84 S 320 150, 372 98 S 440 34, 494 40" />
      </circle>
      <g className="trail-art-points">
        <circle cx="24" cy="150" r="8" className="p1" />
        <circle cx="200" cy="84" r="8" className="p2" />
        <circle cx="372" cy="98" r="8" className="p3" />
        <circle cx="494" cy="40" r="11" className="p4" />
      </g>
      <g className="trail-art-labels">
        <text x="24" y="178" textAnchor="start">Wishlist</text>
        <text x="200" y="66" textAnchor="middle">Applied</text>
        <text x="388" y="126" textAnchor="start">Interview</text>
        <text x="494" y="72" textAnchor="end">Offer</text>
      </g>
    </svg>
  );
}

export default function AuthShell({ title, subtitle, children, footer }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="auth">
      <section className="auth-brand">
        <Contours />
        <span className="orb orb-a" aria-hidden="true" />
        <span className="orb orb-b" aria-hidden="true" />
        <div className="auth-brand-inner">
          <Logo tone="light" size={36} />
          <div className="auth-pitch">
            <h2>Know where every application stands.</h2>
            <p>Move roles from wishlist to offer, keep interviews on the calendar and give your placement cell a live view of the whole batch.</p>
            <TrailArt />
          </div>
          <ul className="auth-points">
            <li><LuBriefcase aria-hidden="true" /><span><b>Candidates</b> track applications on a board, schedule interviews and save roles.</span></li>
            <li><LuShieldCheck aria-hidden="true" /><span><b>Admins</b> post vacancies, manage users and read placement analytics.</span></li>
          </ul>
        </div>
      </section>

      <section className="auth-panel">
        <button type="button" className="icon-btn auth-theme" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? <LuSun /> : <LuMoon />}
        </button>
        <div className="auth-card">
          <div className="auth-mobile-logo"><Logo tone="dark" /></div>
          <h1>{title}</h1>
          <p className="auth-sub">{subtitle}</p>
          {children}
          {footer && <p className="auth-foot">{footer}</p>}
        </div>
      </section>
    </div>
  );
}
