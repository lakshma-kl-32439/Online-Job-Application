/** Donut chart drawn with SVG strokes – no chart library needed. */
export function Donut({ data, size = 176, thickness = 20, centerValue, centerLabel }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="donut" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={data.map((d) => `${d.label} ${d.value}`).join(', ')}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={thickness} />
        {total > 0 &&
          data.filter((d) => d.value > 0).map((d) => {
            const len = (d.value / total) * c;
            const el = (
              <circle
                key={d.label}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={d.color}
                strokeWidth={thickness}
                strokeDasharray={`${Math.max(len - 3, 0)} ${c - Math.max(len - 3, 0)}`}
                strokeDashoffset={-offset}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
            );
            offset += len;
            return el;
          })}
      </svg>
      <div className="donut-center">
        <strong>{centerValue ?? total}</strong>
        <span>{centerLabel}</span>
      </div>
    </div>
  );
}

export function Legend({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  return (
    <ul className="legend">
      {data.map((d) => (
        <li key={d.label}>
          <i style={{ background: d.color }} aria-hidden="true" />
          <span>{d.label}</span>
          <b>{d.value}</b>
          <small>{Math.round((d.value / total) * 100)}%</small>
        </li>
      ))}
    </ul>
  );
}

export function BarList({ items, color = 'var(--brand)' }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <ul className="barlist">
      {items.map((i) => (
        <li key={i.label}>
          <span className="barlist-label">{i.label}</span>
          <span className="barlist-track"><span style={{ width: `${(i.value / max) * 100}%`, background: color }} /></span>
          <b>{i.value}</b>
        </li>
      ))}
    </ul>
  );
}
