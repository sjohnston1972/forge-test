export default function Header() {
  return (
    <header className="border-b border-slate-800/60 bg-black/30 backdrop-blur sticky top-0 z-10">
      <div className="max-w-[1500px] mx-auto px-4 py-4 flex items-center gap-3">
        <div className="text-3xl">🔨</div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Forge <span className="text-orange-400">Test Console</span>
          </h1>
          <p className="text-xs text-slate-500">forge workflow · live logging · bot messaging</p>
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulseglow" />
          <span className="text-emerald-400 font-medium">edge online</span>
        </div>
      </div>
    </header>
  );
}
