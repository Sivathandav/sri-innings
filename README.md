# Sri's Innings 🏏

### A Cinematic 3D Developer Portfolio — Chepauk Stadium, Chennai

> _"One batter. One innings. Make it count."_

---

## Live Architecture

```
           ┌─────────────────────────────────────────────┐
           │               Browser                        │
           │                                              │
           │  ┌──────────┐    ┌──────────────────────┐   │
           │  │  Canvas  │    │   Scroll Container    │   │
           │  │ (fixed)  │    │  (scrollable overlay) │   │
           │  │          │    │                       │   │
           │  │  R3F  ←──┼────┼── scrollState.progress│   │
           │  │          │    │                       │   │
           │  │ Stadium  │    │  Hero                 │   │
           │  │ Atmo     │    │  About                │   │
           │  │ PostFX   │    │  Projects             │   │
           │  │          │    │  Skills               │   │
           │  │ Camera   │    │  Contact              │   │
           │  │ Rig ←────┼────┼── Lenis scroll        │   │
           └──┴──────────┴────┴───────────────────────┴───┘
```

## Quick Start

```bash
# 1. Install
npm install

# 2. Dev server (http://localhost:5173)
npm run dev

# 3. Production build
npm run build
```

---

## File Structure

```
src/
├── App.jsx              — Root: Lenis scroll, nav, loading screen
├── index.css            — Global styles, CSS variables, section layouts
├── main.jsx             — React entry point
│
└── components/
    ├── Scene.jsx        — R3F Canvas + PostProcessing (Bloom/DoF/Vignette)
    ├── Stadium.jsx      — Chepauk Stadium (full procedural Three.js model)
    ├── CameraRig.jsx    — GSAP + CatmullRom scroll-driven camera
    ├── Atmosphere.jsx   — Night sky, starfield, fireflies, fog
    └── Overlay.jsx      — All HTML sections (Hero/About/Projects/Skills/Contact)
```

---

## Camera Journey (Scroll Map)

| Scroll % | Camera Position        | Portfolio Section |
| -------- | ---------------------- | ----------------- |
| 0–12%    | Aerial approach        | Hero loads        |
| 12–25%   | Over the canopy        | Hero persist      |
| 25–28%   | Ground level inside    | Hero / Pitch view |
| 28–45%   | Stands (player's POV)  | About             |
| 45–60%   | Low outfield sweep     | Projects          |
| 60–75%   | Center pitch, sky view | Skills            |
| 75–92%   | Aerial pullout         | Contact           |
| 92–100%  | Wide aerial            | Footer            |

---

## Chepauk Stadium Architecture (Procedural)

All geometry is generated in Three.js — no 3D files imported.

| Element           | Implementation                                              |
| ----------------- | ----------------------------------------------------------- |
| Stand Bowl        | `LatheGeometry` with 15-point profile (3 tiers)             |
| Tensile Canopy    | Custom `BufferGeometry` parametric surface (scalloped wave) |
| Seating           | `InstancedMesh` ×2 (yellow lower, blue upper) ~15k seats    |
| Floodlight Towers | Composed `CylinderGeometry` + emissive panels               |
| Outfield          | `CircleGeometry` with mip-level ring stripes                |
| Cricket Pitch     | `PlaneGeometry` + crease line details + stumps              |
| Boundary Fence    | 180× `BoxGeometry` posts                                    |
| Stars             | `PointsMaterial` on `BufferGeometry` (2500 stars)           |
| Fireflies         | Animated `PointsMaterial` (500 motes, per-frame update)     |
| Sky               | `MeshBasicMaterial` with `CanvasTexture` gradient           |

### Canopy Wave Formula

The signature tensile roof of Chepauk is built with:

```js
// u = 0..1 across section arc
// v = 0..1 front to back
const wavePhase = u * waveN * Math.PI * 2; // 4 full waves
const falloff = Math.pow(1 - v, 0.55); // fades toward rear
const wave = Math.cos(wavePhase) * waveAmp * falloff;
const y = canopyFrontH + v * (canopyBackH - canopyFrontH) + wave;
```

---

## Customization Guide

### 1. Update your personal info

In `src/components/Overlay.jsx`, find and replace:

```jsx
// Line ~25: Your location
"Batting First · Chennai, India";

// Hero section: Your headline + description
// ~Line 60-70

// About section: Your bio (~Line 130)
// Projects: PROJECTS array (~Line 195)
// Skills: SKILLS array (~Line 275)
// Contact: Links (~Line 350)
```

### 2. Add your real links

```jsx
// In Overlay.jsx, Contact section:
{ label: 'GitHub',   href: 'https://github.com/YOUR_USERNAME' },
{ label: 'LinkedIn', href: 'https://linkedin.com/in/YOUR_USERNAME' },
{ label: 'Email',    href: 'mailto:YOUR@EMAIL.com' },
```

### 3. Tune the camera path

In `src/components/CameraRig.jsx`, edit `WAYPOINTS`:

```js
const WAYPOINTS = [
  { pos: [x, y, z], tgt: [tx, ty, tz], fov: 60 },
  // ... add more keyframes or adjust positions
];
```

### 4. Adjust stadium colors

In `src/components/Stadium.jsx`, the `MAT` object:

```js
const MAT = {
  seatYellow: new THREE.MeshStandardMaterial({ color: "#e8a820" }), // CSK yellow
  seatBlue: new THREE.MeshStandardMaterial({ color: "#1a4e96" }), // CSK blue
  grass: new THREE.MeshStandardMaterial({ color: "#2e6830" }), // outfield
  // etc.
};
```

### 5. Performance tuning

```jsx
// Scene.jsx
dpr={[1, 1.5]}  // Reduce to [1, 1] on lower-end devices

// Stadium.jsx — Seat count (lower = better perf)
const ROWS = 13  // lower tier rows — reduce to 8 for lower GPU
const ROWS = 9   // upper tier rows — reduce to 5
```

---

## PostProcessing Chain

```
Raw 3D Render
    ↓
Bloom (luminanceThreshold: 0.45, intensity: 1.4)   — floodlights glow
    ↓
Depth of Field (focusDistance: 0.01, bokehScale: 2.5) — Lempens bokeh
    ↓
Vignette (offset: 0.12, darkness: 0.65)              — cinema edges
    ↓
ACES Filmic Tone Mapping                              — no blown highlights
    ↓
Final Frame
```

---

## Performance Budget (M1 Mac 8GB)

| Metric         | Target | Current estimate |
| -------------- | ------ | ---------------- |
| Draw calls     | < 300  | ~180             |
| Triangle count | < 500k | ~320k            |
| InstancedMesh  | ~15k   | ✓                |
| JS frame time  | < 8ms  | ~5ms             |
| GPU frame time | < 12ms | ~8ms (M1)        |

---

## Tech Stack

| Library                     | Version | Role                        |
| --------------------------- | ------- | --------------------------- |
| React                       | 18.3    | UI framework                |
| @react-three/fiber          | 8.17    | React renderer for Three.js |
| @react-three/drei           | 9.109   | Three.js helpers            |
| @react-three/postprocessing | 2.16    | PostFX effects              |
| three                       | 0.167   | 3D engine                   |
| gsap                        | 3.12    | Animation + ScrollTrigger   |
| lenis                       | 1.1     | Smooth scroll               |
| postprocessing              | 6.36    | Effect composer             |

---

## Deployment

```bash
# Vercel (recommended)
npm i -g vercel
vercel

# Netlify
npm run build
# drag dist/ to netlify.com/drop

# GitHub Pages
npm run build
# push dist/ to gh-pages branch
```

---

_Made with Three.js, React, and an unhealthy obsession with cricket._
_CSK → 🏆_
