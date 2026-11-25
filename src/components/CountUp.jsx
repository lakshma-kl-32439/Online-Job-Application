import { useEffect, useState } from 'react';

/** Animates a number (or "NN%") from 0 once on mount. Respects reduced-motion. */
export default function CountUp({ value, duration = 800 }) {
  const text = String(value);
  const match = /^(\d+)(%?)$/.exec(text);
  const target = match ? Number(match[1]) : null;
  const suffix = match ? match[2] : '';
  const [n, setN] = useState(0);

  useEffect(() => {
    if (target === null) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { setN(target); return undefined; }
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      setN(Math.round(target * (1 - (1 - t) ** 3)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  if (target === null) return text;
  return `${n}${suffix}`;
}
