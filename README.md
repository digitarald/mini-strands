# Mini Strands

A small collection of endless math mini-games, built with React + Vite and published to GitHub Pages. Each game is a single self-contained component with its own embedded styling, spaced-repetition/faded-scaffolding pedagogy, and a world that keeps going as long as you do.

**Live:** https://digitarald.github.io/mini-strands

## Games

### 🌱 Times Garden
An endless multiplication-facts game where every fact from 2×2 to 12×12 is a plot in a garden. Answer correctly and it grows — soil → sprout → leaf → bud → bloom. A spaced-repetition engine brings shaky facts back often and blooming facts only occasionally, and as a fact matures the game flips it around (`7×6` → `7×▢=42` → `42÷7`) to build the division sense that long division depends on. Wrong answers teach a derived-fact strategy instead of just "no."

### ⛰️ Long Division Mountain
An endless long-division expedition where each camp is one problem. The worksheet fills in like handwriting, one micro-step at a time: *how many fit?* → multiply → subtract → tap to bring down. Every step is a small win, every slip gets a targeted hint, and the climb steepens every five camps through named tiers (Foothills → Sky Trail). Estimating the answer's magnitude before climbing ("scouting") earns a bonus flag.

### 📒 Ready for Math 6
A summer rebuild of 5th-grade foundations for a rising 6th grader whose spring was shaky. A notebook-paper world where progress lives on a number line, with confidence-first sequencing, faded scaffolding (nudge → setup → walkthrough), slip-specific feedback, interleaved review, and self-explanation prompts. Strands: place value & ×10, adding fractions, multiplying/dividing fractions, decimals, order of operations, the coordinate plane, and volume.

### 📈 Bridge to 8.1
Summer practice bridging grade-level Math 7 up to Math 8.1 (Algebra 1 in 8th grade). A graph-paper world where progress is literally a slope, with one problem at a time, faded scaffolding, misconception-aware feedback, an interleaved "Mix" mode, and self-explanation prompts. Strands: negative numbers, ratios & percent, solving equations, exponents, slope & lines, functions & systems, and roots & right triangles.

## Project structure

```
index.html            # entry HTML, loads the Bricolage Grotesque font
src/
  main.jsx            # React entry point
  App.jsx             # landing menu + hash-based routing between games
  index.css           # landing page + game-shell styles
  ResultsSplash.jsx   # shared screenshot-friendly progress card (share/milestones)
  games/
    TimesGarden.jsx
    DivisionMountain.jsx
    ReadyForMath6.jsx
    BridgeTo81.jsx
vite.config.js        # Vite config; sets base to /mini-strands/
.github/workflows/
  deploy.yml          # GitHub Actions -> Pages deploy
```

Each game is a standalone default-export component that ships its own CSS via an embedded `<style>` block, so adding a new game is just: drop a `.jsx` file in `src/games/` and register it in the `GAMES` array in `src/App.jsx`. Navigation is hash-based (`#/times-garden`), which keeps deep links working on GitHub Pages without server-side routing.

## Progress & sharing

Progress is saved to the browser's `localStorage`, per game (keys like `times-garden-v1`), so a kid can close the tab and pick the garden/mountain/mastery back up right where they left off. Each game tracks two tiers:

- **Lifetime progress** that builds up forever — garden blooms, mountain camps, strand mastery.
- **Daily progress** — problems answered and points earned *today* — which resets each calendar day but accumulates across multiple sessions in the same day.

Every game also has a shareable **results splash** (`src/ResultsSplash.jsx`): a screenshot-friendly card showing today's and all-time stats, opened from the 📸 Share button or automatically at a milestone (a level-up, a new tier/summit, or a fully-solved strand) — made for dropping into a family group chat.

## Develop

```bash
npm install
npm run dev      # local dev server
npm run build    # production build to dist/
npm run preview  # serve the production build locally
```

## Deploy

Deployment runs on **GitHub Actions**. Every push to `main` triggers the [Pages workflow](.github/workflows/deploy.yml), which builds the site and publishes `dist/` to GitHub Pages. In the repo's **Settings -> Pages**, the source is set to **GitHub Actions**.

The Vite `base` is `/mini-strands/` in [`vite.config.js`](vite.config.js) to match the project-site URL — update it if you rename the repository.
