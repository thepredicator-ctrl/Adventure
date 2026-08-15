const CHANNELS = [
  { name: "GitHub Discussions", desc: "Q&A and long-form threads." },
  { name: "Discord",            desc: "Live chat for contributors." },
  { name: "Twitter / X",        desc: "Announcements and showcases." },
  { name: "Show & Tell",        desc: "Share what you built." }
];

export default function Community() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold tracking-tight">Community</h2>
      <p className="max-w-2xl text-white/70">Share your build, ask questions, or contribute.</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {CHANNELS.map(c => (
          <div key={c.name} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div className="font-medium text-white">{c.name}</div>
            <div className="mt-1 text-sm text-white/60">{c.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
