import { useState, useRef } from 'react';

const STAGES = [
  { key: 'queue', label: 'Queue', ms: 400 },
  { key: 'resolve', label: 'Resolve deps', ms: 700 },
  { key: 'compile', label: 'Compile', ms: 1100 },
  { key: 'bundle', label: 'Bundle', ms: 900 },
  { key: 'deploy', label: 'Deploy', ms: 800 },
];

function randId() {
  return 'frg_' + Math.random().toString(36).slice(2, 8);
}

export default function ForgePanel({ log, bumpStat }) {
  const [name, setName] = useState('hello-edge-app');
  const [target, setTarget] = useState('cloudflare-worker');
  const [running, setRunning] = useState(false);
  const [stages, setStages] = useState({});
  const [jobs, setJobs] = useState([]);
  const cancelRef = useRef(false);

  async function runForge() {
    if (running) return;
    cancelRef.current = false;
    const id = randId();
    setRunning(true);
    setStages({});
    bumpStat('jobs');
    log('info', 'forge', `Job ${id} started for "${name}" → ${target}`);

    let failed = false;
    for (const stage of STAGES) {
      if (cancelRef.current) break;
      setStages((s) => ({ ...s, [stage.key]: 'running' }));
      log('debug', 'forge', `[${id}] ${stage.label}…`);
      await new Promise((r) => setTimeout(r, stage.ms));
      // 12% chance to fail at compile/bundle to exercise error logging
      const mayFail = (stage.key === 'compile' || stage.key === 'bundle') && Math.random() < 0.12;
      if (mayFail) {
        setStages((s) => ({ ...s, [stage.key]: 'error' }));
        log('error', 'forge', `[${id}] ${stage.label} failed: synthetic error E${Math.floor(Math.random() * 900 + 100)}`);
        failed = true;
        break;
      }
      setStages((s) => ({ ...s, [stage.key]: 'done' }));
      log('info', 'forge', `[${id}] ${stage.label} complete`);
    }

    if (cancelRef.current) {
      log('warn', 'forge', `[${id}] cancelled by operator`);
    } else if (!failed) {
      log('info', 'forge', `[${id}] ✅ forge succeeded — artifact published`);
    }

    setJobs((j) => [
      { id, name, target, status: cancelRef.current ? 'cancelled' : failed ? 'failed' : 'success', at: new Date() },
      ...j.slice(0, 7),
    ]);
    setRunning(false);
  }

  function cancel() {
    cancelRef.current = true;
  }

  const statusColor = {
    done: 'bg-emerald-500',
    running: 'bg-orange-400 animate-pulseglow',
    error: 'bg-rose-500',
  };

  return (
    <section className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h2 className="font-semibold text-white">🔧 Forge Workflow</h2>
        <span className="text-xs text-slate-500">build &amp; deploy pipeline</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="text-xs text-slate-400 flex flex-col gap-1">
          Project name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={running}
            className="rounded-lg bg-black/40 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-400 disabled:opacity-50"
          />
        </label>
        <label className="text-xs text-slate-400 flex flex-col gap-1">
          Target
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            disabled={running}
            className="rounded-lg bg-black/40 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-400 disabled:opacity-50"
          >
            <option value="cloudflare-worker">cloudflare-worker</option>
            <option value="static-spa">static-spa</option>
            <option value="edge-api">edge-api</option>
          </select>
        </label>
      </div>

      <div className="flex gap-2">
        <button
          onClick={runForge}
          disabled={running}
          className="flex-1 rounded-lg bg-orange-500 hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold py-2 text-sm transition"
        >
          {running ? 'Forging…' : '▶ Run Forge'}
        </button>
        {running && (
          <button
            onClick={cancel}
            className="rounded-lg border border-rose-500/60 text-rose-400 hover:bg-rose-500/10 px-4 py-2 text-sm transition"
          >
            Cancel
          </button>
        )}
      </div>

      <div className="space-y-2">
        {STAGES.map((s) => {
          const st = stages[s.key];
          return (
            <div key={s.key} className="flex items-center gap-3 text-sm">
              <span className={`w-2.5 h-2.5 rounded-full ${statusColor[st] || 'bg-slate-700'}`} />
              <span className={st ? 'text-slate-200' : 'text-slate-500'}>{s.label}</span>
              <span className="ml-auto text-xs text-slate-600">
                {st === 'done' ? 'ok' : st === 'error' ? 'failed' : st === 'running' ? '…' : ''}
              </span>
            </div>
          );
        })}
      </div>

      {jobs.length > 0 && (
        <div className="border-t border-slate-800/60 pt-3">
          <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">Recent jobs</div>
          <ul className="space-y-1">
            {jobs.map((j) => (
              <li key={j.id} className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-500">{j.id}</span>
                <span className="text-slate-300 truncate">{j.name}</span>
                <span
                  className={
                    'ml-auto px-1.5 py-0.5 rounded ' +
                    (j.status === 'success'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : j.status === 'failed'
                      ? 'bg-rose-500/15 text-rose-400'
                      : 'bg-amber-500/15 text-amber-400')
                  }
                >
                  {j.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
