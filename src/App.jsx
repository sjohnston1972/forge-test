import { useState, useRef, useEffect, useCallback } from 'react';
import Header from './components/Header.jsx';
import ForgePanel from './components/ForgePanel.jsx';
import LogPanel from './components/LogPanel.jsx';
import ChatPanel from './components/ChatPanel.jsx';
import StatBar from './components/StatBar.jsx';

let logSeq = 0;

export default function App() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ jobs: 0, messages: 0, errors: 0, logLines: 0 });
  const logIdsRef = useRef(0);

  const log = useCallback((level, source, message) => {
    const entry = {
      id: ++logSeq,
      ts: new Date(),
      level,
      source,
      message,
    };
    setLogs((prev) => [...prev.slice(-299), entry]);
    setStats((s) => ({
      ...s,
      logLines: s.logLines + 1,
      errors: level === 'error' ? s.errors + 1 : s.errors,
    }));
  }, []);

  const bumpStat = useCallback((key, by = 1) => {
    setStats((s) => ({ ...s, [key]: s[key] + by }));
  }, []);

  useEffect(() => {
    log('info', 'system', 'Forge Test Console booted. Environment ready.');
    log('debug', 'system', `Worker runtime: cloudflare-edge • build ${new Date().toISOString().slice(0, 10)}`);
  }, [log]);

  return (
    <div className="min-h-screen text-slate-200 bg-gradient-to-br from-[#0a0a0f] via-[#0d0d18] to-[#0a0a14] flex flex-col">
      <Header />
      <StatBar stats={stats} />
      <main className="flex-1 max-w-[1500px] w-full mx-auto px-4 pb-8 grid gap-4 grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-5 flex flex-col gap-4">
          <ForgePanel log={log} bumpStat={bumpStat} />
        </div>
        <div className="lg:col-span-3">
          <LogPanel logs={logs} onClear={() => setLogs([])} />
        </div>
        <div className="lg:col-span-4">
          <ChatPanel log={log} bumpStat={bumpStat} />
        </div>
      </main>
      <footer className="text-center text-xs text-slate-600 py-4 border-t border-slate-800/60">
        Forge Test Console — testing forging, logging &amp; messaging workflows • served from a Cloudflare Worker
      </footer>
    </div>
  );
}
