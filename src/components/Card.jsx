export default function Card({ title, subtitle, children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/[0.03] p-5 ${className}`}>
      {title && <div className="font-medium text-white">{title}</div>}
      {subtitle && <div className="mt-1 text-sm text-white/50">{subtitle}</div>}
      {children}
    </div>
  );
}
