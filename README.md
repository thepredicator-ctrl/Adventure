# Adventure — LineSidebar × Topography

An interactive demo of two React components composed into a single page:

- **`LineSidebar`** — a vertical nav whose items ease toward the cursor using a single shared `requestAnimationFrame` loop and frame-rate independent exponential smoothing. Color, horizontal shift, and marker scale all read from one CSS variable (`--effect`) so they stay in lockstep.
- **`Topography`** — a fragment-shader line field rendered via `ogl`, with elevation-based color, contour bands, optional glow/grain, and an optional pointer bump.

Built with **React 18 + Vite + Tailwind CSS 3**. Deployed to GitHub Pages via GitHub Actions.

> The previous content of this repo (a single-file "Arcade Toons" demo) is preserved in [`README-arcade-toons.md`](./README-arcade-toons.md).

## Live demo

Once GitHub Pages is enabled with **Source: GitHub Actions**, the site is live at:

```
https://thepredicator-ctrl.github.io/Adventure/
```

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # produce dist/
npm run preview  # preview the built site
```

## Project structure

See [`docs/architecture.md`](./docs/architecture.md) for the full tree. Key paths:

```
src/components/LineSidebar.jsx     # as-provided
src/components/Topography.jsx      # as-provided
src/App.jsx                        # composition root
src/sections/                      # 12 lazy-loaded content panels
.github/workflows/deploy.yml       # GH Pages auto-deploy
```

## Component props

- [LineSidebar props](./docs/props-linesidebar.md)
- [Topography props](./docs/props-topography.md)

## Usage

```jsx
import LineSidebar from './LineSidebar';
import Topography from './Topography';

<div className="relative h-screen">
  <Topography lowColor="#1e0a3c" midColor="#7c3aed" highColor="#f0abfc" />
  <LineSidebar
    items={['Overview', 'Components', 'Animations', 'Backgrounds', 'Showcase']}
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
    defaultActive={0}
    onItemClick={(index, label) => console.log(index, label)}
  />
</div>
```

## License

MIT — see `LICENSE` file if present. Source components © their respective authors.
