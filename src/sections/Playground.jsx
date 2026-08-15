import CodeBlock from "../components/CodeBlock.jsx";

const SNIPPET = `import LineSidebar from './LineSidebar';
import Topography from './Topography';

<LineSidebar
  items={['Overview','Components','Animations','Backgrounds','Showcase']}
  accentColor="#A855F7"
  textColor="#c4c4c4"
  markerColor="#6c6c6c"
  showIndex
  showMarker
  proximityRadius={100}
  maxShift={30}
  falloff="smooth"          // 'linear' | 'smooth' | 'sharp'
  markerLength={60}
  markerGap={0}
  tickScale={0.5}
  scaleTick
  itemGap={20}
  fontSize={1.1}
  smoothing={100}
  defaultActive={0}
  onItemClick={(index, label) => console.log(index, label)}
/>`;

export default function Playground() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold tracking-tight">Playground</h2>
      <p className="max-w-2xl text-white/70">
        Edit <code className="rounded bg-black/40 px-1.5 py-0.5 text-fuchsia-200">src/components/SidebarLayout.jsx</code> to
        tweak the props on the mounted <code className="rounded bg-black/40 px-1.5 py-0.5 text-fuchsia-200">&lt;LineSidebar /&gt;</code>,
        or edit <code className="rounded bg-black/40 px-1.5 py-0.5 text-fuchsia-200">src/App.jsx</code> to swap the{" "}
        <code className="rounded bg-black/40 px-1.5 py-0.5 text-fuchsia-200">&lt;Topography /&gt;</code> palette.
      </p>
      <CodeBlock code={SNIPPET} language="jsx" />
    </div>
  );
}
