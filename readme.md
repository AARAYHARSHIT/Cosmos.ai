# COSMOS.AI — Next-Gen 3D Deep Space Intelligence Platform

A high-performance, SaaS-grade 3D parallax web platform and deep space observatory. Built with **Three.js**, **Anime.js v4**, and **GSAP ScrollTrigger**, bundled with **Vite 6**.

## Features

- **High-Resolution Deep Space Archive** — 8 high-definition local astronomical assets (Nebulae, Galaxies, Supernovae, Exoplanets, Pulsars, Singularity Event Horizons) with progressive shimmer loading, category filters, instant search, and full Lightbox inspector modal.
- **Section-Driven 3D Parallax Camera Choreography** — Flawlessly synchronized GSAP ScrollTrigger timeline navigating from deep space (Hero: `z = 80`), through volumetric nebula interior (`z = -260`), along planetary horizons (`z = -350` to `-750`), through floating quantum artifacts (`z = -840`), into telemetry starfields (`z = -960`).
- **Pinned Horizontal Planetary Showcase** — Interactive 3D planetary systems with custom atmospheric Fresnel halos, molten asteroid rings, orbiting moons, and multispectral scanning actions.
- **Dynamic GLSL Volumetric Nebula Shader** — 1,200 particle cloud with procedural noise displacement, additive blending, and interactive spectral resonance matrix presets (Orion Violet, Helix Emerald, Cygnus Blue, Crab Gold).
- **Hyperspace Warp Propulsion Mode** — Dynamic star streaking acceleration with relativistic camera FOV expansion (75° to 97°).
- **Procedural Web Audio Synthesizer** — Pure algorithmic harmonic space drone and UI click feedback synthesized with Web Audio API (0 external audio dependencies).
- **Mission Control CLI Terminal (⌘K)** — Interactive terminal supporting live commands (`help`, `scan`, `warp`, `telemetry`, `planets`, `nebula`).
- **SaaS Capabilities & Telemetry HUD** — 6 enterprise astrophysics capability cards, live canvas sparkline graph, animated stat counters, and persistent bottom-left telemetry monitor.
- **SaaS Subscription Pricing & Modal** — Monthly / Annual billing switcher (20% discount calculation) with interactive checkout and license activation modal.
- **Toast Notification Engine** — Non-intrusive floating glassmorphic feedback alerts.

## Tech Stack

| Package | Version | Role |
|---------|---------|------|
| three | ^0.185 | WebGL 3D rendering & shaders |
| animejs | ^4 | DOM micro-animations & number counters |
| gsap | ^3.12 | ScrollTrigger scroll choreography |
| vite | ^6 | Dev server & production bundling |

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
├── index.html                    # Complete SaaS layout & modals
├── vite.config.js                # Build config + vendor chunk splitting
├── public/                       # Static high-res assets
│   └── assets/gallery/           # 8 local astronomical images (0 broken 404s)
└── src/
    ├── main.js                   # Main application coordinator & animation loop
    ├── scene.js                  # Three.js scene, camera, lights, warp FOV
    ├── stars.js                  # Instanced starfield with hyperspace streaking
    ├── planets.js                # High-detail planets, atmosphere Fresnel shaders, rings
    ├── geometry.js               # Floating crystalline quantum artifacts
    ├── nebula.js                 # GLSL shader particle cloud with color presets
    ├── scroll-parallax.js        # Section-synchronized GSAP ScrollTrigger camera flight
    ├── dom-animations.js         # Interactive SaaS features, gallery, tilt, counters
    ├── audio.js                  # Web Audio procedural sound engine
    ├── terminal.js               # Mission Control CLI modal logic
    ├── toast.js                  # Floating toast notification engine
    └── styles/                   # Modular CSS design system
```
