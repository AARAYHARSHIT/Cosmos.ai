# Explore the Cosmos — Parallax 3D Experience

A deep-space themed, scroll-driven 3D web experience. Built with **Three.js**, **Anime.js v4**, and **GSAP ScrollTrigger**, bundled with **Vite 6**.

## Features

- **Pinned horizontal scroll** — planet cards slide as you scroll (Section 3)
- **Scroll camera parallax** — camera flies through the star field as you scroll
- **Custom GLSL nebula** — 800 particles with additive blending + noise displacement (Section 2)
- **Instanced star field** — 3,000 stars on a single draw call, per-instance twinkle brightness
- **Anime.js micro-interactions** — letter reveal, stat counters, planet rotation, geometry drift, hover/gallery effects, CTA pulse
- **GSAP ScrollTrigger animations** — staggered section entrances, clip-path gallery reveals, footer CTA animations
- **Lazy-loaded image gallery** — Unsplash deep-space imagery with loading states, lazy loading, and fallback placeholders
- **Logarithmic depth buffer** — clean depth across a 1,000+ unit deep scene
- **Fully responsive design** — mobile-first breakpoints for tablet and small phones

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
├── public/                       # Static assets (served at /)
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
        ├── index.css             # Root styles, scrollbar, @import hub
        ├── variables.css         # CSS custom properties + theming
        ├── base.css              # Reset, layout, glassmorphism cards
        ├── hero.css              # Hero section + scroll indicator
        ├── nebula.css            # Nebula discovery section
        ├── planets.css           # Planet showcase (horizontal scroll)
        ├── stats.css             # Statistics counter grid
        ├── gallery.css           # Lazy-loaded image gallery
        └── footer.css            # Footer + CTA button
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

## Responsive Breakpoints

| Breakpoint | Use Case |
|-----------|----------|
| ≤ 1024px | Tablet — reduced font sizes, tighter spacing |
| ≤ 768px | Mobile — reduced heights, 2-column planet grid |
| ≤ 480px | Small phone — single column layout, smaller fonts |

## Gallery Images

The gallery uses lazy-loaded images from Unsplash with the following optimizations:
- `loading="lazy"` for native lazy loading
- `decoding="async"` for non-blocking image decode
- `onload` class toggle for smooth fade-in
- `onerror` fallback to show placeholder text
