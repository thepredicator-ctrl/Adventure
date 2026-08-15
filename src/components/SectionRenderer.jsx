import { lazy, Suspense } from 'react';

const SECTION_MAP = {
  Overview:      lazy(() => import('../sections/Overview.jsx')),
  Components:    lazy(() => import('../sections/Components.jsx')),
  Animations:    lazy(() => import('../sections/Animations.jsx')),
  Backgrounds:   lazy(() => import('../sections/Backgrounds.jsx')),
  Showcase:      lazy(() => import('../sections/Showcase.jsx')),
  Playground:    lazy(() => import('../sections/Playground.jsx')),
  Templates:     lazy(() => import('../sections/Templates.jsx')),
  Changelog:     lazy(() => import('../sections/Changelog.jsx')),
  Community:     lazy(() => import('../sections/Community.jsx')),
  Resources:     lazy(() => import('../sections/Resources.jsx')),
  Documentation: lazy(() => import('../sections/Documentation.jsx')),
  Support:       lazy(() => import('../sections/Support.jsx'))
};

export default function SectionRenderer({ section }) {
  const Comp = SECTION_MAP[section?.label];
  if (!Comp) {
    return <div className="text-white/60">No content for {section?.label}.</div>;
  }
  return (
    <Suspense
      fallback={
        <div className="flex h-40 items-center justify-center text-white/40">
          <span className="animate-pulse">Loading…</span>
        </div>
      }
    >
      <div key={section.label} className="animate-fade-in">
        <Comp />
      </div>
    </Suspense>
  );
}
