import CountUp from './CountUp';

export default function StatStrip({ items }) {
  return (
    <dl className="stat-strip">
      {items.map((s) => (
        <div key={s.label} className="stat">
          <dt>{s.label}</dt>
          <dd><CountUp value={s.value} /></dd>
          {s.note && <small>{s.note}</small>}
        </div>
      ))}
    </dl>
  );
}
