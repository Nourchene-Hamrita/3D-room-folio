# 💜 Nourchene Hamrita — 3D Portfolio

A futuristic, walk-around 3D developer workspace built with **Vite + Three.js + GSAP + Sass**, themed to match [your existing portfolio](https://nourchene-hamrita.netlify.app/) — dark + violet + pink neon.

> Inspired by [andrewwoan/sooahs-room-folio](https://github.com/andrewwoan/sooahs-room-folio).

## ✨ Features

- 🏠 **Procedural 3D workspace** — desk, triple monitors, laptop, computer tower, bookshelf, server rack, plants, posters, diploma, clock, side table, ceiling lamp, neon strips, fabric rug
- 🖼️ **Procedural textures** — wood plank floor, wood desk, wall paneling, concrete, fabric, brushed metal, dark glass — all generated at runtime with Canvas2D
- 🎮 **Orbit controls** — mouse + touch support, smooth damping, idle auto-rotate
- 🎯 **Raycasting interactions** — hover any object for a "Click to explore" hint, click to open the matching modal
- 🌗 **Day / Cyberpunk themes** — toggle between a moody neon scene and a bright workspace
- 🪟 **Popups** — Work (project grid + detail), About (bio, skills, timeline), Contact (email, LinkedIn, GitHub)
- ✨ **Post-processing** — UnrealBloom for the neon glow
- 🎞️ **Idle animations** — blinking server LEDs, swaying plant, coffee steam, monitor screen pulse, clock hands, ambient floating particles
- 🔊 **Web Audio SFX** — subtle UI beeps on hover, click, theme toggle (no asset files needed)
- 📱 **Responsive** — desktop, tablet, mobile

## 🧱 Stack

- [Vite](https://vitejs.dev/) — dev server + build
- [Three.js](https://threejs.org/) — WebGL renderer + post-processing
- GSAP-ready (tween helper included for future use)
- [Sass](https://sass-lang.com/) — styles

## 🚀 Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
```

## 📁 Structure

```
nourchene-room-folio/
├── index.html              # Topbar + all 4 modals (Work, About, Contact, Project detail)
├── package.json
├── vite.config.js
├── public/
│   └── logo.svg
├── src/
│   ├── main.js             # Orchestrator
│   ├── style.scss          # Main stylesheet
│   ├── data/
│   │   └── portfolio.js    # ← Edit your content here (projects, skills, experience, contact)
│   ├── styles/
│   │   ├── _reset.scss
│   │   ├── _variables.scss # Design tokens (colors, fonts, spacing)
│   │   └── _components.scss# All UI components
│   └── utils/
│       ├── Scene.js        # Three.js scene + camera + lights + env map + bloom
│       ├── Workspace.js    # Procedural 3D room (1600+ lines of geometry)
│       ├── Textures.js     # Procedural canvas textures
│       ├── Controls.js     # Custom orbit controls (mouse + touch)
│       ├── Interactions.js # Raycasting + hover + click
│       ├── Modals.js       # UI panels with project data
│       ├── Theme.js        # Day / Cyberpunk toggle
│       ├── Animations.js   # Idle animations + particles
│       └── Audio.js        # Web Audio SFX
└── dist/                   # Production build (after npm run build)
```

## 🎮 Controls

| Action | Effect |
|--------|--------|
| **Left-drag** | Orbit camera |
| **Right-drag** | Pan camera |
| **Scroll wheel** | Zoom in/out |
| **One-finger drag** (touch) | Orbit |
| **Two-finger pinch** (touch) | Zoom |
| **Two-finger drag** (touch) | Pan |
| **Hover any 3D object** | See "Click to explore" hint |
| **Click any 3D object** | Open the matching modal |
| **Sun/Moon button** | Toggle day ↔ cyberpunk theme |
| **Speaker button** | Toggle sound |
| **Work / About / Contact** | Open the matching modal |
| **Esc** or click outside | Close any open modal |

## 🖱️ Interactive 3D objects

| Object | Action |
|--------|--------|
| **Center monitor** | Open Work modal |
| **Laptop** | Open About modal |
| **Phone** | Open Contact modal |
| **Plant** | Open AI project detail |
| **Books** | Open Full-Stack project detail |
| **Coffee mug** | Open Mobile project detail |
| **Server rack** | Open Automation project detail |
| **Diploma** | Open About modal |

## ✏️ Make it yours

- **Your content** → `src/data/portfolio.js` (projects, skills, experience, contact)
- **Colors** → `src/styles/_variables.scss`
- **3D scene** → `src/utils/Workspace.js` (rearrange/add/remove meshes)
- **3D ↔ modal mapping** → `interactive: { … }` block in `portfolio.js`

## 🚢 Deploy

The `dist/` folder is a static site — drop it on any static host:

- **Vercel**: `vercel deploy`
- **Netlify**: drag & drop `dist/` to the dashboard, or `netlify deploy --prod --dir=dist`
- **GitHub Pages**: push `dist/` to a `gh-pages` branch
- **Cloudflare Pages**: connect your repo, set build command to `npm run build` and output dir to `dist`

## 🛣️ Inspired by

- [andrewwoan/sooahs-room-folio](https://github.com/andrewwoan/sooahs-room-folio) — the award-winning 3D room portfolio that started it all
- [Bruno Simon's Room](https://my-room-in-3d.vercel.app/) — original 3D room concept
- [Denis Wipart's Materials](https://wipart.artstation.com/store)

## 📜 License

MIT
