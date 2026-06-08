import { useState, useRef, useEffect } from 'react';

export default function ChatPanel({ log, bumpStat }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm Forge Bot 🤖 — ask me about builds, deployments, or test the messaging workflow.",
    },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    const next = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setBusy(true);
    bumpStat('messages');
    log('info', 'chat', `user → forge-bot: "${text.slice(0, 60)}${text.length > 60 ? '…' : ''}"`);

    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const data = await r.json();
      const reply = data.reply || '(no response)';
      setMessages((m) => [...m, { role: 'assistant', content: reply }]);
      bumpStat('messages');
      log('info', 'chat', `forge-bot → user: "${reply.slice(0, 60)}${reply.length > 60 ? '…' : ''}"`);
    } catch (err) {
      log('error', 'chat', `messaging failed: ${err.message}`);
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: '⚠️ Messaging workflow error: ' + err.message },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function onKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <section className="rounded-2xl border border-slate-800/60 bg-slate-900/40 flex flex-col h-[560px]">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800/60">
        <h2 className="font-semibold text-white text-sm">💬 Forge Bot Messaging</h2>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulseglow ml-auto" />
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-slidein`}
          >
            <div
              className={
                'max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ' +
                (m.role === 'user'
                  ? 'bg-sky-600 text-white rounded-br-sm'
                  : 'bg-slate-800 text-slate-200 rounded-bl-sm')
              }
            >
              {m.content}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <div className="bg-slate-800 text-slate-400 rounded-2xl rounded-bl-sm px-3 py-2 text-sm">
              <span className="inline-flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulseglow" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulseglow" style={{ animationDelay: '0.2s' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulseglow" style={{ animationDelay: '0.4s' }} />
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="p-3 border-t border-slate-800/60 flex gap-2">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder="Message the forge bot…"
          className="flex-1 resize-none rounded-lg bg-black/40 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-400"
        />
        <button
          onClick={send}
          disabled={busy || !input.trim()}
          className="rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-4 text-sm transition"
        >
          Send
        </button>
      </div>
    </section>
  );
}
