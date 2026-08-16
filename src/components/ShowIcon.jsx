export default function ShowIcon({ show, size = 40 }) {
  return (
    <div
      className="flex items-center justify-center rounded-lg font-bold text-black"
      style={{
        width: size,
        height: size,
        background: show.color,
        fontSize: size * 0.36,
        boxShadow: `0 0 12px ${show.color}55`
      }}
    >
      {show.icon}
    </div>
  );
}
