# Mini Strands

Endless math mini-games, built with React + Vite and published to GitHub Pages.

**Live:** https://digitarald.github.io/mini-strands

## Games

- **🌱 Times Garden** — grow every multiplication fact from soil to bloom using spaced repetition.
- **⛰️ Long Division Mountain** — an endless long-division expedition, one micro-step at a time.

## Develop

```bash
npm install
npm run dev      # local dev server
npm run build    # production build to dist/
npm run preview  # preview the production build
```

## Deploy

Pushing to `main` triggers the [GitHub Pages workflow](.github/workflows/deploy.yml),
which builds the site and deploys `dist/`.

One-time setup: in the repo's **Settings → Pages**, set **Source** to **GitHub Actions**.

The Vite `base` is set to `/mini-strands/` in [`vite.config.js`](vite.config.js) to match the
project-site URL. Update it if you rename the repository.
