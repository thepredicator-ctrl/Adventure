export default function Documentation() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold tracking-tight">Documentation</h2>
      <div className="prose prose-invert max-w-none">
        <p>
          LineSidebar is a single-file React component. It renders an unordered list of items, each driven by a CSS
          custom property <code>--effect</code> in the range [0,1].
        </p>
        <p>
          A pointer-move handler computes each item&apos;s target value based on its distance from the cursor, runs it
          through a falloff curve, and stores it. One rAF loop then eases every item&apos;s current value toward its
          target using exponential smoothing, writing the result back to the DOM via{" "}
          <code>style.setProperty</code>.
        </p>
        <p>
          All visual treatments — color blending, horizontal shift, marker scale, index opacity — read directly from{" "}
          <code>--effect</code> via Tailwind arbitrary values and <code>color-mix()</code>, so they stay perfectly in
          sync without any CSS transition.
        </p>
        <h3>Topography</h3>
        <p>
          The background is a fragment shader rendered via <code>ogl</code>. A single triangle covers the screen, and
          the shader computes a bezier-based distance field, masks it into bands, and applies a tri-tone elevation
          gradient. A pointer bump can be enabled to deform the field locally — disabled here so the sidebar gets the
          cursor&apos;s full attention.
        </p>
      </div>
    </div>
  );
}
