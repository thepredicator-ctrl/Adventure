export default function CodeBlock({ code, language = 'jsx' }) {
  return (
    <pre className="overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-5 text-sm leading-relaxed text-white/80">
      <code data-language={language}>{code}</code>
    </pre>
  );
}
