import { useState, useCallback } from 'react';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import SidebarLayout from './components/SidebarLayout.jsx';
import SectionRenderer from './components/SectionRenderer.jsx';
import Topography from './components/Topography.jsx';
import { SECTIONS } from './data/sections.js';

export default function App() {
  const [active, setActive] = useState(0);

  const handleItemClick = useCallback(index => {
    setActive(index);
  }, []);

  const label = SECTIONS[active]?.label ?? 'Overview';

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-950 text-white">
      {/* Topographic background — fixed, behind everything */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-60">
        <Topography
          lowColor="#1e0a3c"
          midColor="#7c3aed"
          highColor="#f0abfc"
          speed={0.25}
          morphAmount={3.0}
          bands={2.4}
          thickness={0.012}
          glow={0.6}
          colorMode="elevation"
          contrast={2.6}
          brightness={0.9}
          opacity={0.85}
          grain
          grainIntensity={0.04}
          mouseInteraction={false}
        />
      </div>

      {/* Vignette overlay for readability */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(900px 600px at 80% -10%, rgba(168,85,247,0.18), transparent 60%), radial-gradient(700px 600px at 0% 110%, rgba(99,102,241,0.12), transparent 60%), linear-gradient(to bottom, rgba(8,8,10,0.4), rgba(8,8,10,0.85))'
        }}
      />

      <div className="relative z-10">
        <Header activeLabel={label} />
        <SidebarLayout
          activeIndex={active}
          onItemClick={handleItemClick}
        >
          <SectionRenderer section={SECTIONS[active]} />
        </SidebarLayout>
        <Footer />
      </div>
    </div>
  );
}
