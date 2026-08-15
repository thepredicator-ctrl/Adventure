import LineSidebar from './LineSidebar.jsx';
import { SECTIONS } from '../data/sections.js';

export default function SidebarLayout({ activeIndex, onItemClick, children }) {
  const items = SECTIONS.map(s => s.label);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-10 lg:flex-row lg:py-16">
      <aside className="lg:sticky lg:top-28 lg:h-[calc(100vh-9rem)] lg:shrink-0">
        <LineSidebar
          items={items}
          accentColor="#A855F7"
          textColor="#c4c4c4"
          markerColor="#6c6c6c"
          showIndex
          showMarker
          proximityRadius={100}
          maxShift={30}
          falloff="smooth"
          markerLength={60}
          markerGap={0}
          tickScale={0.5}
          scaleTick
          itemGap={20}
          fontSize={1.1}
          smoothing={100}
          defaultActive={activeIndex ?? 0}
          onItemClick={(index) => onItemClick(index)}
        />
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
