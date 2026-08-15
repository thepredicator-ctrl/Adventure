const TEMPLATES = [
  { name: "Landing",    desc: "Hero + features grid + footer CTA." },
  { name: "Docs",       desc: "Sidebar + content + table of contents." },
  { name: "Dashboard",  desc: "Sidebar + KPI strip + chart panels." },
  { name: "Blog",       desc: "Sidebar nav + article list + tags." },
  { name: "Store",      desc: "Sidebar filters + product grid." },
  { name: "Auth",       desc: "Centered card with theme toggle." }
];

export default function Templates() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold tracking-tight">Templates</h2>
      <p className="max-w-2xl text-white/70">Starter layouts you can drop the sidebar into.</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {TEMPLATES.map(t => (
          <div key={t.name} className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
            <div className="text-lg font-medium text-white">{t.name}</div>
            <div className="mt-1 text-sm text-white/50">{t.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
