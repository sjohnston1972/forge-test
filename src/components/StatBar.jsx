const items = [
  { key: 'jobs', label: 'Forge Jobs', color: 'text-orange-400' },
  { key: 'messages', label: 'Messages', color: 'text-sky-400' },
  { key: 'logLines', label: 'Log Lines', color: 'text-emerald-400' },
  { key: 'errors', label: 'Errors', color: 'text-rose-400' },
];

export default function StatBar({ stats }) {
  return (
    <div className="max-w-[1500px] w-full mx-auto px-4 py-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {items.map((it) => (
          <div
            key={it.key}
            className="rounded-xl border border-slate-800/60 bg-slate-900/40 px-4 py-3"
          >
            <div className={`text-2xl font-bold tabular-nums ${it.color}`}>{stats[it.key]}</div>
            <div className="text-[11px] uppercase tracking-wider text-slate-500">{it.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
