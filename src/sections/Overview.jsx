import Badge from "../components/Badge.jsx";

export default function Overview() {
  return (
    <div className="space-y-8">
      <div>
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/60">
          <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400" /> Introduction
        </p>
        <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-6xl">
          A sidebar that{" "}
          <span className="bg-gradient-to-r from-fuchsia-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
            responds to your cursor
          </span>
          .
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/70">
          Move your pointer along the navigation on the left. Each item eases toward the cursor using
          frame-rate independent exponential smoothing, while color, shift, and the marker scale all move
          together — no staggered CSS transitions, no jank. Click an item to lock it as active. Behind
          everything, a WebGL topographic line field morphs slowly with the pointer.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <Badge tone="accent">rAF loop</Badge>
          <div className="mt-3 text-xl font-medium text-white">Single shared</div>
          <div className="mt-2 text-sm text-white/60">
            One requestAnimationFrame drives every item. The loop self-terminates when nothing is moving.
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <Badge tone="accent">Smoothing</Badge>
          <div className="mt-3 text-xl font-medium text-white">τ = 100 ms</div>
          <div className="mt-2 text-sm text-white/60">
            Exponential easing using <code className="rounded bg-black/40 px-1.5 py-0.5 text-fuchsia-200">k = 1 - e^(-dt/τ)</code>, independent of frame rate.
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <Badge tone="accent">Falloff</Badge>
          <div className="mt-3 text-xl font-medium text-white">smoothstep</div>
          <div className="mt-2 text-sm text-white/60">
            Proximity mapping with three curves to pick from: <code className="rounded bg-black/40 px-1.5 py-0.5 text-fuchsia-200">linear</code>, <code className="rounded bg-black/40 px-1.5 py-0.5 text-fuchsia-200">smooth</code>, <code className="rounded bg-black/40 px-1.5 py-0.5 text-fuchsia-200">sharp</code>.
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <h3 className="text-lg font-semibold text-white">What you&apos;re looking at</h3>
        <p className="mt-2 text-white/70">
          Two components, composed: <code className="rounded bg-black/40 px-1.5 py-0.5 text-fuchsia-200">&lt;LineSidebar /&gt;</code> for navigation, and{" "}
          <code className="rounded bg-black/40 px-1.5 py-0.5 text-fuchsia-200">&lt;Topography /&gt;</code> rendering a fragment-shader line field via{" "}
          <code className="rounded bg-black/40 px-1.5 py-0.5 text-fuchsia-200">ogl</code>. Both components are unchanged from their source — this demo just mounts them together.
        </p>
      </div>
    </div>
  );
}
