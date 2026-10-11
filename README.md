# Neon Snake 🐍

A lightweight, mobile-first Snake game with a black background and neon-orange visuals.

## Features
- Swipe up, down, left, or right anywhere on the board.
- Automatic movement and food collection.
- Snake grows when it eats.
- Wrap-around board edges for relaxed gameplay.
- Game-over overlay and one-tap restart.
- Pause/resume.
- Optional sound effects.
- Keyboard controls on desktop.
- Installable PWA with basic offline caching.
- No levels, score display, accounts, backend, or database.

## Requirements
- Node.js 18+ recommended
- npm

## Run locally
```bash
npm install
npm run dev
```
Open the local URL printed by Vite.

## Production build
```bash
npm run build
npm run preview
```
The production files are generated in `dist/`.

## Deploy
- **Netlify:** Import the repository or upload the `dist/` folder. Build command: `npm run build`; publish directory: `dist`.
- **Vercel:** Import the repository. Framework preset: Vite; build command: `npm run build`; output directory: `dist`.
- **GitHub Pages:** Configure Vite's `base` in `vite.config.js` if deploying under a repository subpath.

## Controls
- Mobile: swipe on the board.
- Desktop: arrow keys or WASD.
- Space/Escape: pause or resume.

## Notes
The snake wraps around the board edges; it ends only when it collides with its own body. Sound is off by default. Google Fonts are used for optional typography; system fonts are the fallback.
