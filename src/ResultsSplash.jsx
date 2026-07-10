import { useEffect, useRef } from "react";

/* ============================================================
   RESULTS SPLASH — a shareable, screenshot-friendly card
   Shown on demand (📸 Share button) or when a game crosses a
   milestone. Designed to look great as an iMessage screenshot:
   big emoji, the game's accent color, a bold headline, an
   all-time stat row and a "today" stat row, an encouraging
   cheer, and a branded footer so the picture explains itself.

   Props:
     emoji     string  — the game's emoji
     title     string  — the game's name (eyebrow)
     accent    string  — the game's accent color
     headline  string  — big line (level / tier / mastery)
     cheer     string  — short encouraging message
     lifetime  [{label, value}]  — all-time stats (builds up)
     today     [{label, value}]  — daily stats (resets daily)
     onClose   () => void
   ============================================================ */

function prettyDate(d = new Date()) {
  return d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

export default function ResultsSplash({ emoji, title, accent = "#26413C", headline, cheer, lifetime = [], today = [], onClose }) {
  const cardRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose && onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const canShare = typeof navigator !== "undefined" && !!navigator.share;

  function shareText() {
    const life = lifetime.map(s => `${s.value} ${s.label}`).join(" · ");
    const day = today.map(s => `${s.value} ${s.label}`).join(" · ");
    const parts = [`${emoji} ${title} — ${headline}`];
    if (day) parts.push(`Today: ${day}`);
    if (life) parts.push(`All-time: ${life}`);
    parts.push("via Mini Strands");
    return parts.join("\n");
  }

  async function doShare() {
    try {
      if (navigator.share) await navigator.share({ title: `${title} progress`, text: shareText() });
    } catch (e) { /* user cancelled / unsupported */ }
  }

  return (
    <div className="rs-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={`${title} results`}>
      <style>{css}</style>
      <div className="rs-card" ref={cardRef} style={{ "--rs-accent": accent }} onClick={(e) => e.stopPropagation()}>
        <button className="rs-close" onClick={onClose} aria-label="Close">×</button>

        <div className="rs-band" />
        <div className="rs-emoji" aria-hidden="true">{emoji}</div>
        <div className="rs-eyebrow">{title}</div>
        <div className="rs-headline">{headline}</div>
        {cheer && <div className="rs-cheer">{cheer}</div>}

        {today.length > 0 && (
          <div className="rs-group">
            <div className="rs-grouplabel">Today</div>
            <div className="rs-stats">
              {today.map((s, i) => (
                <div className="rs-stat" key={"t" + i}>
                  <div className="rs-value">{s.value}</div>
                  <div className="rs-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {lifetime.length > 0 && (
          <div className="rs-group">
            <div className="rs-grouplabel">All-time</div>
            <div className="rs-stats">
              {lifetime.map((s, i) => (
                <div className="rs-stat" key={"l" + i}>
                  <div className="rs-value">{s.value}</div>
                  <div className="rs-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rs-foot">
          <span className="rs-mark">✦ Mini Strands</span>
          <span className="rs-date">{prettyDate()}</span>
        </div>

        <div className="rs-actions">
          {canShare
            ? <button className="rs-btn primary" onClick={doShare}>Share</button>
            : <span className="rs-hint">📸 Screenshot this to share!</span>}
          <button className="rs-btn" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}

const css = `
.rs-overlay {
  position: fixed; inset: 0; z-index: 50;
  background: rgba(24, 28, 24, .55);
  display: flex; align-items: center; justify-content: center;
  padding: 20px; backdrop-filter: blur(3px);
  font-family: 'Bricolage Grotesque', system-ui, sans-serif;
  animation: rs-fade .18s ease;
}
@keyframes rs-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes rs-pop { from { opacity: 0; transform: translateY(12px) scale(.97); } to { opacity: 1; transform: none; } }

.rs-card {
  position: relative; width: 100%; max-width: 360px;
  background: #FDFCF8; color: #2E3830;
  border: 2px solid #26413C; border-radius: 22px;
  padding: 30px 24px 22px; text-align: center;
  box-shadow: 8px 10px 0 rgba(38,65,60,.22);
  overflow: hidden; animation: rs-pop .22s cubic-bezier(.2,.8,.3,1.1);
}
.rs-band {
  position: absolute; top: 0; left: 0; right: 0; height: 10px;
  background: var(--rs-accent);
}
.rs-close {
  position: absolute; top: 12px; right: 14px;
  width: 32px; height: 32px; border-radius: 99px;
  border: none; background: rgba(38,65,60,.08); color: #4A554C;
  font-size: 20px; line-height: 1; cursor: pointer; font-family: inherit;
}
.rs-close:hover { background: rgba(38,65,60,.16); }

.rs-emoji { font-size: 58px; line-height: 1; margin: 6px 0 8px; }
.rs-eyebrow {
  font-size: 11px; letter-spacing: .16em; text-transform: uppercase;
  color: #7A836E; font-weight: 700;
}
.rs-headline {
  font-size: 26px; font-weight: 800; color: var(--rs-accent);
  margin: 4px 0 6px; line-height: 1.15;
}
.rs-cheer { font-size: 14px; color: #5C665A; line-height: 1.5; margin: 0 auto 6px; max-width: 30ch; }

.rs-group { margin-top: 16px; }
.rs-grouplabel {
  font-size: 10.5px; letter-spacing: .14em; text-transform: uppercase;
  color: #9AA091; font-weight: 700; margin-bottom: 7px;
}
.rs-stats { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
.rs-stat {
  flex: 1 1 0; min-width: 74px; max-width: 130px;
  background: #fff; border: 1.5px solid #E0D9C6; border-radius: 14px;
  padding: 10px 8px;
}
.rs-value {
  font-size: 22px; font-weight: 800; color: #26413C; line-height: 1.1;
  font-variant-numeric: tabular-nums;
}
.rs-label {
  font-size: 10.5px; color: #7A836E; font-weight: 600; margin-top: 3px;
  text-transform: uppercase; letter-spacing: .04em;
}

.rs-foot {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 20px; padding-top: 14px; border-top: 1.5px dashed #D8D2BE;
}
.rs-mark { font-size: 13px; font-weight: 800; color: var(--rs-accent); letter-spacing: .01em; }
.rs-date { font-size: 12px; color: #9AA091; font-weight: 600; }

.rs-actions { display: flex; gap: 10px; margin-top: 16px; align-items: center; justify-content: center; }
.rs-hint { font-size: 12.5px; color: #7A836E; font-weight: 600; }
.rs-btn {
  font-family: inherit; font-weight: 700; font-size: 14px;
  padding: 11px 18px; min-height: 44px; border-radius: 99px;
  border: 1.5px solid #26413C; background: #FDFCF8; color: #26413C; cursor: pointer;
}
.rs-btn.primary { background: var(--rs-accent); border-color: var(--rs-accent); color: #fff; }
.rs-btn:active { transform: translateY(1px); }

@media (prefers-reduced-motion: reduce) { .rs-overlay, .rs-card { animation: none !important; } }
`;
