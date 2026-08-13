# Explore the Cosmos — Parallax 3D Experience

A deep-space themed, scroll-driven 3D web experience. Built with **Three.js**, **Anime.js v4**, and **GSAP ScrollTrigger**, bundled with **Vite 6**.

## Features

- **Pinned horizontal scroll** — planet cards slide as you scroll (Section 3)
- **Scroll camera parallax** — camera flies through the star field as you scroll
- **Custom GLSL nebula** — 800 particles with additive blending + noise displacement (Section 2)
- **Instanced star field** — 3,000 stars on a single draw call, per-instance twinkle brightness
- **Anime.js micro-interactions** — letter reveal, stat counters, planet rotation, geometry drift, hover/gallery effects, CTA pulse
- **Logarithmic depth buffer** — clean depth across a 1,000+ unit deep scene

## Tech Stack

| Package | Version | Role |
|---------|---------|------|
| three | ^0.185 | WebGL rendering |
| animejs | ^4 | DOM + Three.js micro-animations |
| gsap | ^3.12 | ScrollTrigger scroll animations |
| vite | ^6 | Dev server + production bundling |

## Requirements

- **Node.js 18+**

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (http://localhost:5173)
npm run dev

# 3. Production build (outputs to dist/)
npm run build

# 4. Preview the production build
npm run preview
```

## Project Structure

```
├── index.html                    # Section markup (hero → footer)
├── vite.config.js                # Build config + vendor chunk splitting
└── src/
    ├── main.js                   # Entry point — wires everything together
    ├── scene.js                  # Scene, camera, renderer, lights, render loop
    ├── stars.js                  # InstancedMesh star field (3,000 stars)
    ├── planets.js                # 3 planet spheres at different Z-depths
    ├── geometry.js               # Floating icosahedron / torus knot / octahedron
    ├── nebula.js                 # GLSL shader particle cloud (cyan → violet)
    ├── scroll-parallax.js        # Scroll camera + GSAP ScrollTrigger animations
    ├── dom-animations.js         # Anime.js DOM + Three.js micro-interactions
    └── styles/                   # CSS (variables, base, section-specific)
```

## Build Details

- **Production-ready bundling** — tree-shaking is enabled, code is minified with esbuild, and vendor libraries are split into cacheable chunks in `vite.config.js`:

```js
manualChunks: {
  three: ['three'],
  gsap: ['gsap', 'gsap/ScrollTrigger'],
  anime: ['animejs'],
}
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally |

## Theme

Deep space palette (defined in `src/styles/variables.css`):

- Background: `hsl(230, 25%, 3%)`
- Accents: cyan `hsl(190, 90%, 60%)`, violet `hsl(270, 80%, 65%)`, rose `hsl(330, 85%, 65%)`
- Fonts: **Space Grotesk** (headings), **Inter** (body)