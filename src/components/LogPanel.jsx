import { useEffect, useRef, useState } from 'react';

const levelStyle = {
  info: 'text-sky-400',
  debug: 'text-slate-500',
  warn: 'text-amber-400',
  error: 'text-rose-400',
};

export default function LogPanel({ logs, onClear }) {
  const [filter, setFilter] = useState('all');
  const [autoscroll, setAutoscroll] = useState(true);
  const endRef = useRef(null);

  const shown = filter === 'all' ? logs : logs.filter((l) => l.level === filter);

  useEffect(() => {
    if (autoscroll) endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [shown.length, autoscroll]);

  return (
    <section className="rounded-2xl border border-slate-800/60 bg-black/50 flex flex-col h-[560px]">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800/60">
        <h2 className="font-semibold text-white text-sm">📜 Live Logs</h2>
        <span className="text-xs text-slate-600">{shown.length}</span>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="ml-auto text-xs bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-300"
        >
          <option value="all">all</option>
          <option value="info">info</option>
          <option value="debug">debug</option>
          <option value="warn">warn</option>
          <option value="error">error</option>
        </select>
        <button
          onClick={onClear}
          className="text-xs text-slate-400 hover:text-rose-400 border border-slate-700 rounded px-2 py-1"
        >
          clear
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-2 font-mono text-xs leading-relaxed">
        {shown.length === 0 && (
          <div className="text-slate-600 italic p-2">no log entries</div>
        )}
        {shown.map((l) => (
          <div key={l.id} className="animate-slidein py-0.5 flex gap-2">
            <span className="text-slate-600 shrink-0">
              {l.ts.toLocaleTimeString('en-US', { hour12: false })}
            </span>
            <span className={`shrink-0 font-bold ${levelStyle[l.level]}`}>
              {l.level.toUpperCase().padEnd(5)}
            </span>
            <span className="text-purple-400 shrink-0">{l.source}</span>
            <span className="text-slate-300 break-all">{l.message}</span>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <label className="flex items-center gap-2 px-4 py-2 border-t border-slate-800/60 text-xs text-slate-500">
        <input
          type="checkbox"
          checked={autoscroll}
          onChange={(e) => setAutoscroll(e.target.checked)}
          className="accent-orange-400"
        />
        auto-scroll
      </label>
    </section>
  );
}
