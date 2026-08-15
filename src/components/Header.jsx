export default function Header({ activeLabel }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-black/40 px-6 py-4 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-500 to-indigo-500 text-sm font-bold text-white">
          L
        </div>
        <div>
          <div className="text-sm font-semibold tracking-tight text-white">LineSidebar × Topography</div>
          <div className="text-[11px] uppercase tracking-widest text-white/40">Interactive Demo</div>
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs text-white/50">
        <span className="hidden sm:inline">
          Active: <span className="font-mono text-white/80">{activeLabel}</span>
        </span>
        <a
          href="https://github.com/thepredicator-ctrl/Adventure"
          target="_blank"
          rel="noreferrer noopener"
          className="rounded-md border border-white/10 px-3 py-1.5 text-white/70 transition hover:border-white/30 hover:text-white"
        >
          GitHub
        </a>
      </div>
    </header>
  );
}
