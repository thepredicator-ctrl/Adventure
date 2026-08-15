const RESOURCES = [
  { name: "React hooks reference",        url: "https://react.dev/reference/react" },
  { name: "CSS color-mix()",              url: "https://developer.mozilla.org/en-US/docs/Web/CSS/color_mix" },
  { name: "Custom properties (variables)",url: "https://developer.mozilla.org/en-US/docs/Web/CSS/--*" },
  { name: "Tailwind arbitrary values",    url: "https://tailwindcss.com/docs/adding-custom-styles#using-arbitrary-values" },
  { name: "requestAnimationFrame",        url: "https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame" },
  { name: "ogl",                          url: "https://github.com/oframe/ogl" }
];

export default function Resources() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold tracking-tight">Resources</h2>
      <p className="max-w-2xl text-white/70">Reference material for the techniques used in this demo.</p>
      <ul className="space-y-2">
        {RESOURCES.map(r => (
          <li key={r.name}>
            <a
              href={r.url}
              target="_blank"
              rel="noreferrer noopener"
              className="block rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-white/80 transition hover:border-fuchsia-400/40 hover:text-white"
            >
              {r.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
