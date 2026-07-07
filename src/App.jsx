import { useEffect, useState } from "react";
import TimesGarden from "./games/TimesGarden.jsx";
import DivisionMountain from "./games/DivisionMountain.jsx";

const GAMES = [
  {
    slug: "times-garden",
    title: "Times Garden",
    tagline: "Grow every multiplication fact from soil to bloom.",
    emoji: "🌱",
    accent: "#7BA05B",
    Component: TimesGarden,
  },
  {
    slug: "division-mountain",
    title: "Long Division Mountain",
    tagline: "Climb an endless expedition, one long-division step at a time.",
    emoji: "⛰️",
    accent: "#5B7BA0",
    Component: DivisionMountain,
  },
];

function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash.replace(/^#\/?/, ""));
  useEffect(() => {
    const onChange = () => setHash(window.location.hash.replace(/^#\/?/, ""));
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return hash;
}

function navigate(slug) {
  window.location.hash = slug ? `#/${slug}` : "#/";
}

function Home() {
  return (
    <div className="home">
      <header className="home-head">
        <div className="home-mark">✦ Mini Strands</div>
        <h1>Endless math mini-games.</h1>
        <p>Two quiet, generous games that keep going as long as you do. Pick a plot to tend.</p>
      </header>
      <div className="home-grid">
        {GAMES.map((g) => (
          <button
            key={g.slug}
            className="home-card"
            style={{ "--accent": g.accent }}
            onClick={() => navigate(g.slug)}
          >
            <span className="home-card-emoji" aria-hidden="true">{g.emoji}</span>
            <span className="home-card-title">{g.title}</span>
            <span className="home-card-tag">{g.tagline}</span>
            <span className="home-card-go">Play →</span>
          </button>
        ))}
      </div>
      <footer className="home-foot">
        Made for endless practice · <a href="https://github.com/digitarald/mini-strands">source</a>
      </footer>
    </div>
  );
}

export default function App() {
  const route = useHashRoute();
  const game = GAMES.find((g) => g.slug === route);

  useEffect(() => {
    document.title = game ? `${game.title} · Mini Strands` : "Mini Strands · math mini-games";
  }, [game]);

  if (!game) return <Home />;

  const { Component } = game;
  return (
    <div className="game-shell">
      <button className="back-btn" onClick={() => navigate("")} aria-label="Back to menu">
        ← Menu
      </button>
      <Component />
    </div>
  );
}
