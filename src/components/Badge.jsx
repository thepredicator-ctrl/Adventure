export default function Badge({ children, tone = 'default' }) {
  const tones = {
    default: 'border-white/10 bg-white/5 text-white/60',
    accent:  'border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-200',
    info:    'border-indigo-400/30 bg-indigo-400/10 text-indigo-200'
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] uppercase tracking-widest ${tones[tone] || tones.default}`}>
      {children}
    </span>
  );
}
