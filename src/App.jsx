import { useState, useCallback, useEffect } from 'react';
import { PlayerProvider, usePlayer } from './context/PlayerContext.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import SidebarLayout from './components/SidebarLayout.jsx';
import SectionRenderer from './components/SectionRenderer.jsx';
import Topography from './components/Topography.jsx';
import Toast from './components/Toast.jsx';
import LoadingScreen from './components/LoadingScreen.jsx';
import { SECTIONS } from './data/sections.js';
import { THEMES } from './data/themes.js';

function AppShell() {
  const [active, setActive] = useState(0);
  const [booted, setBooted] = useState(false);
  const { global } = usePlayer();
  const theme = THEMES.find(t => t.id === global.theme) ?? THEMES[0];

  const handleItemClick = useCallback(index => setActive(index), []);
  const label = SECTIONS[active]?.label ?? 'Player';

  // Apply data-theme to <html> for any CSS that keys off it.
  useEffect(() => {
    document.documentElement.dataset.theme = theme.id;
  }, [theme.id]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-950 text-white">
      {/* Boot / loading screen — shows on first load, fades out */}
      {!booted && <LoadingScreen onComplete={() => setBooted(true)} />}

      {/* Topographic background */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-60">
        <Topography
          key={theme.id}
          lowColor={theme.topography.lowColor}
          midColor={theme.topography.midColor}
          highColor={theme.topography.highColor}
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

      {/* Vignette */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(900px 600px at 80% -10%, rgba(168,85,247,0.18), transparent 60%), radial-gradient(700px 600px at 0% 110%, rgba(99,102,241,0.12), transparent 60%), linear-gradient(to bottom, rgba(8,8,10,0.4), rgba(8,8,10,0.85))'
        }}
      />

      {/* CRT scanlines */}
      {global.settings.crtEffect && (
        <div
          className="pointer-events-none fixed inset-0 z-40 opacity-[0.08]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.5) 0 1px, transparent 1px 3px)'
          }}
        />
      )}

      <div className="relative z-10">
        <Header activeLabel={label} />
        <SidebarLayout activeIndex={active} onItemClick={handleItemClick}>
          <SectionRenderer section={SECTIONS[active]} />
        </SidebarLayout>
        <Footer />
      </div>

      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <PlayerProvider>
      <AppShell />
    </PlayerProvider>
  );
}
