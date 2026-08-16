import { useState, useEffect, useCallback } from 'react';
import LightTunnel from './LightTunnel.jsx';
import { Terminal, TypingAnimation, AnimatedSpan } from './magicui/Terminal.jsx';

// Total boot sequence runs ~9.5s. User can skip at any time.
const BOOT_DURATION_MS = 10000;

export default function LoadingScreen({ onComplete }) {
  const [hiding, setHiding] = useState(false);
  const [done, setDone] = useState(false);

  const finish = useCallback(() => {
    if (done || hiding) return;
    setHiding(true);
    setTimeout(() => {
      setDone(true);
      onComplete?.();
    }, 600);
  }, [done, hiding, onComplete]);

  // Auto-finish after the full boot sequence.
  useEffect(() => {
    const t = setTimeout(finish, BOOT_DURATION_MS);
    return () => clearTimeout(t);
  }, [finish]);

  if (done) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ${
        hiding ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* LightTunnel background */}
      <div className="absolute inset-0">
        <LightTunnel
          cableColor="#A855F7"
          pulseColor="#f0abfc"
          tunnelColor="#5227FF"
          tunnelOpacity={0.15}
          speed={0.15}
          flowDirection="outward"
          pulseSpeed={2.2}
          pulseLength={0.3}
          pulseBlend={0.8}
          pulseWidth={1.1}
          cableCount={24}
          thickness={0.4}
          rimWidth={0.18}
          waviness={0.35}
          sway={0.6}
          size={1.1}
          glow={1.2}
          fadeNear={0.4}
          fadeFar={2.2}
          brightness={1.1}
          colorVariance
          grain
          grainIntensity={0.04}
          opacity={0.95}
          mouseInteraction
          mouseStrength={0.12}
        />
      </div>

      {/* Vignette for readability */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(600px 400px at 50% 50%, rgba(8,8,10,0.5), rgba(8,8,10,0.9))'
        }}
      />

      {/* Terminal + brand */}
      <div className="relative z-10 w-full max-w-2xl px-6">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-500 to-indigo-500 text-sm font-bold text-white">
              A
            </div>
            <div className="text-left">
              <div className="text-lg font-semibold tracking-tight text-white">Adventure</div>
              <div className="text-[11px] uppercase tracking-widest text-white/40">
                Booting…
              </div>
            </div>
          </div>
        </div>

        <Terminal title="adventure — bash">
          <TypingAnimation delay={0} className="text-white">
            &gt; adventure init
          </TypingAnimation>

          <AnimatedSpan delay={1100} className="text-green-500">
            ✔ Loading show database.
          </AnimatedSpan>

          <AnimatedSpan delay={1700} className="text-green-500">
            ✔ Verifying 7 shows.
          </AnimatedSpan>

          <AnimatedSpan delay={2300} className="text-green-500">
            ✔ Connecting to embed servers.
          </AnimatedSpan>

          <AnimatedSpan delay={2900} className="text-green-500">
            ✔ Found 4 servers online.
          </AnimatedSpan>

          <AnimatedSpan delay={3500} className="text-green-500">
            ✔ Loading achievements.
          </AnimatedSpan>

          <AnimatedSpan delay={4100} className="text-green-500">
            ✔ 8 achievements ready.
          </AnimatedSpan>

          <AnimatedSpan delay={4700} className="text-green-500">
            ✔ Restoring watch progress.
          </AnimatedSpan>

          <AnimatedSpan delay={5300} className="text-green-500">
            ✔ Syncing localStorage.
          </AnimatedSpan>

          <AnimatedSpan delay={5900} className="text-blue-500">
            <span>ℹ Updated 1 file:</span>
            <span className="pl-2">- src/context/PlayerContext.jsx</span>
          </AnimatedSpan>

          <TypingAnimation delay={6700} duration={40} className="text-white/60">
            Success! Adventure ready.
          </TypingAnimation>

          <TypingAnimation delay={8200} duration={40} className="text-white/60">
            You may now pick a show.
          </TypingAnimation>
        </Terminal>

        <div className="mt-6 flex items-center justify-between">
          <div className="font-mono text-xs text-white/30">
            7 shows · 4 servers · 5 themes · 8 achievements
          </div>
          <button
            onClick={finish}
            className="rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70 backdrop-blur-sm transition hover:border-white/40 hover:text-white"
          >
            Skip →
          </button>
        </div>
      </div>
    </div>
  );
}
