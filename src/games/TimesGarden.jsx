import { useState, useEffect, useRef } from "react";
import ResultsSplash from "../ResultsSplash.jsx";

/* ============================================================
   TIMES GARDEN — an endless multiplication-facts game
   Every fact from 2×2 to 12×12 is a plot in the garden.
   Answer it right and it grows: soil → sprout → leaf → bud →
   bloom. The engine is spaced repetition: shaky facts come
   back often, blooming facts only occasionally. As a fact
   grows, the game flips it around (7×6 → 7×▢=42 → 42÷7),
   because division facts are just multiplication facts read
   backward — the exact skill long division leans on.
   Wrong answers teach a derived-fact strategy, not just "no."
   ============================================================ */

/* ---------------- fact engine ---------------- */
const MIN = 2, MAX = 12;
const FACT_KEYS = [];
for (let a = MIN; a <= MAX; a++) for (let b = a; b <= MAX; b++) FACT_KEYS.push(`${a}x${b}`);

const STAGES = ["soil", "sprout", "leaf", "bud", "bloom"]; // box 0..4
const STAGE_LABEL = ["new", "sprouting", "growing", "budding", "in bloom"];

function keyParts(k) { const [a, b] = k.split("x").map(Number); return [a, b]; }

function pickFact(facts, avoidKey, soonQueue) {
  if (soonQueue.length && soonQueue[0].due <= 0) {
    const k = soonQueue[0].key;
    if (k !== avoidKey) return k;
  }
  let total = 0;
  const weights = FACT_KEYS.map(k => {
    if (k === avoidKey) return 0;
    const box = (facts[k] && facts[k].b) || 0;
    const w = (5 - box) * (5 - box); // box0:25 … box4:1
    total += w;
    return w;
  });
  let r = Math.random() * total;
  for (let i = 0; i < FACT_KEYS.length; i++) { r -= weights[i]; if (r <= 0) return FACT_KEYS[i]; }
  return FACT_KEYS[FACT_KEYS.length - 1];
}

function makeQuestion(key, box) {
  let [a, b] = keyParts(key);
  if (Math.random() < 0.5) [a, b] = [b, a]; // vary shown order
  const product = a * b;
  let dir = "mult";
  if (box === 2) dir = "missing";
  else if (box >= 3) dir = Math.random() < 0.5 ? "missing" : "div";
  if (dir === "mult") return { key, dir, text: `${a} × ${b}`, answer: product, a, b };
  if (dir === "missing") return { key, dir, text: `${a} × ▢ = ${product}`, answer: b, a, b };
  return { key, dir, text: `${product} ÷ ${a}`, answer: b, a, b };
}

/* derived-fact strategy for the bigger factor */
function strategyHint(key) {
  let [a, b] = keyParts(key); // a <= b
  const p = a * b;
  switch (b) {
    case 2: return `${a} × 2 is a double: ${a} + ${a} = ${p}.`;
    case 3: return `${a} × 3 = double it, then one more: ${a * 2} + ${a} = ${p}.`;
    case 4: return `${a} × 4 = double twice: ${a} → ${a * 2} → ${p}.`;
    case 5: return `${a} × 5 = half of ×10: ${a} × 10 = ${a * 10}, half is ${p}.`;
    case 6: return `${a} × 6 = ×5 plus one more: ${a * 5} + ${a} = ${p}.`;
    case 7: return `${a} × 7 = ×5 plus ×2: ${a * 5} + ${a * 2} = ${p}.`;
    case 8: return `${a} × 8 = double three times: ${a} → ${a * 2} → ${a * 4} → ${p}.`;
    case 9: return `${a} × 9 = ×10 minus one: ${a * 10} − ${a} = ${p}.`;
    case 10: return `${a} × 10: shift a place — attach a zero: ${p}.`;
    case 11: return a <= 9 ? `${a} × 11 repeats the digit: ${p}.` : `${a} × 11 = ×10 plus one more: ${a * 10} + ${a} = ${p}.`;
    case 12: return `${a} × 12 = ×10 plus ×2: ${a * 10} + ${a * 2} = ${p}.`;
    default: return `${a} × ${b} = ${p}.`;
  }
}

/* ---------------- levels ---------------- */
const TITLES = [
  "Seed",
  "Sprout",
  "Seedling",
  "Sapling",
  "Gardener",
  "Green Thumb",
  "Grove Keeper",
  "Garden Legend",
  "Garden Guardian",
  "Bloom Builder",
  "Meadow Maker",
  "Orchard Keeper",
  "Canopy Captain",
  "Wildflower Wizard",
  "Garden Champion",
  "Nature's Hero",
  "Habitat Helper",
  "Pollinator Pal",
  "Forest Friend",
  "Earth Steward",
];
const GP_PER_LEVEL = 120;
function levelInfo(gp) {
  const lvl = Math.floor(gp / GP_PER_LEVEL);
  const number = lvl + 1;
  const title = TITLES[lvl] || `Garden Legend ${number - TITLES.length}`;
  return { lvl: number, title, into: gp % GP_PER_LEVEL };
}

/* ---------------- persistence ---------------- */
const STORE_KEY = "times-garden-v1";
async function loadState() {
  try { if (typeof localStorage !== "undefined") { const raw = localStorage.getItem(STORE_KEY); if (raw) return JSON.parse(raw); } } catch (e) { /* first run */ }
  return null;
}
async function saveState(s) {
  try { if (typeof localStorage !== "undefined") localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch (e) { /* offline ok */ }
}
function todayStr() { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; }

/* ---------------- component ---------------- */
export default function TimesGarden() {
  const [facts, setFacts] = useState({});
  const [gp, setGp] = useState(0);
  const [best, setBest] = useState(0);
  const [dayCount, setDayCount] = useState(0);
  const [dayGp, setDayGp] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [splash, setSplash] = useState(false);

  const [q, setQ] = useState(null);
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState("answer"); // answer | retry | reveal | correct
  const [note, setNote] = useState(null);
  const [streak, setStreak] = useState(0);
  const [banked, setBanked] = useState(null);
  const [showGarden, setShowGarden] = useState(false);
  const [pulse, setPulse] = useState(0);

  const soonQueue = useRef([]); // {key, due} — missed facts come back fast
  const lastKey = useRef(null);
  const askedAt = useRef(0);

  useEffect(() => {
    loadState().then(s => {
      if (s) {
        setFacts(s.facts || {});
        setGp(s.gp || 0);
        setBest(s.best || 0);
        const sameDay = s.day && s.day.date === todayStr();
        setDayCount(sameDay ? s.day.count : 0);
        setDayGp(sameDay ? (s.day.gp || 0) : 0);
      }
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveState({ facts, gp, best, day: { date: todayStr(), count: dayCount, gp: dayGp } });
  }, [facts, gp, best, dayCount, dayGp, loaded]);

  useEffect(() => { if (loaded && !q) nextQuestion(facts); /* eslint-disable-line */ }, [loaded]);

  function nextQuestion(currentFacts) {
    soonQueue.current.forEach(item => item.due--);
    const key = pickFact(currentFacts, lastKey.current, soonQueue.current);
    soonQueue.current = soonQueue.current.filter(item => item.key !== key);
    lastKey.current = key;
    const box = (currentFacts[key] && currentFacts[key].b) || 0;
    setQ(makeQuestion(key, box));
    setTyped("");
    setPhase("answer");
    setNote(null);
    askedAt.current = Date.now();
  }

  function submit() {
    if (!q || !typed) return;
    const val = parseInt(typed, 10);
    const ms = Date.now() - askedAt.current;
    if (val === q.answer) {
      const fast = ms < 6000;
      setFacts(prev => {
        const f = prev[q.key] || { b: 0, r: 0, w: 0 };
        let nb = f.b;
        if (phase === "answer") nb = f.b >= 3 ? (fast ? Math.min(4, f.b + 1) : f.b) : Math.min(4, f.b + 1);
        const next = { ...prev, [q.key]: { b: nb, r: f.r + 1, w: f.w } };
        if (phase === "answer" && nb === 4 && f.b < 4) setNote({ kind: "bloom", msg: `🌼 ${q.key.replace("x", " × ")} just bloomed! It'll only visit now and then to stay fresh.` });
        return next;
      });
      if (phase === "answer") {
        const ns = streak + 1;
        setStreak(ns);
        setBanked(null);
        if (ns > best) setBest(ns);
        const gain = 10 + 2 * Math.min(ns, 10) + (fast ? 3 : 0);
        setGp(g => g + gain);
        setDayGp(d => d + gain);
        setNote(n => n || { kind: "good", msg: fast ? `+${gain} growth · quick! ☀️` : `+${gain} growth` });
      } else {
        setGp(g => g + 4);
        setDayGp(d => d + 4);
        setNote({ kind: "good", msg: "Got it on the comeback — it'll sprout again soon. +4 growth" });
        soonQueue.current.push({ key: q.key, due: 3 });
      }
      setDayCount(c => c + 1);
      setPhase("correct");
      setPulse(p => p + 1);
      setTimeout(() => nextQuestion(factsRefSafe()), 850);
    } else {
      if (phase === "answer") {
        if (streak > 0) setBanked(streak);
        setStreak(0);
        setFacts(prev => {
          const f = prev[q.key] || { b: 0, r: 0, w: 0 };
          return { ...prev, [q.key]: { b: Math.max(0, f.b - 1), r: f.r, w: f.w + 1 } };
        });
        setNote({ kind: "hint", msg: strategyHint(q.key) + (q.dir !== "mult" ? ` (Same fact family, read ${q.dir === "div" ? "as division" : "with a blank"}.)` : "") });
        setPhase("retry");
        setTyped("");
      } else {
        setNote({ kind: "reveal", msg: `The answer is ${q.answer}. ${strategyHint(q.key)} It'll come back in a couple of turns — get it then!` });
        soonQueue.current.push({ key: q.key, due: 2 });
        setPhase("reveal");
        setDayCount(c => c + 1);
        setTimeout(() => nextQuestion(factsRefSafe()), 2600);
      }
    }
  }

  // facts state may be mid-update when timeouts fire; read latest via ref pattern
  const factsRef = useRef(facts);
  useEffect(() => { factsRef.current = facts; }, [facts]);
  function factsRefSafe() { return factsRef.current; }

  function tap(d) {
    if (phase === "correct" || phase === "reveal") return;
    if (d === "back") setTyped(t => t.slice(0, -1));
    else if (d === "go") submit();
    else if (typed.length < 3) setTyped(t => (t === "0" ? String(d) : t + String(d)));
  }

  const bloomCount = Object.values(facts).filter(f => f.b === 4).length;
  const { lvl, title, into } = levelInfo(gp);

  const milestoneRef = useRef(null); // last-seen {lvl, bloom} — auto-pop the splash on a genuine crossing
  useEffect(() => {
    if (!loaded) return;
    const prev = milestoneRef.current;
    if (prev && (lvl > prev.lvl || bloomCount > prev.bloom)) setSplash(true);
    milestoneRef.current = { lvl, bloom: bloomCount };
  }, [loaded, lvl, bloomCount]);

  return (
    <div className="wrap">
      <style>{css}</style>
      {splash && (
        <ResultsSplash
          emoji="🌱"
          title="Times Garden"
          accent="#3E9C84"
          headline={`Lv ${lvl} · ${title}`}
          cheer={bloomCount === FACT_KEYS.length ? "Every fact in bloom — the whole garden is glowing! 🌼" : "Keep tending it — every answer helps something grow."}
          today={[
            { value: dayCount, label: "answered" },
            { value: `+${dayGp}`, label: "growth" },
          ]}
          lifetime={[
            { value: `${bloomCount}/${FACT_KEYS.length}`, label: "in bloom" },
            { value: best, label: "best streak" },
            { value: gp, label: "total growth" },
          ]}
          onClose={() => setSplash(false)}
        />
      )}
      <div className="page">
        <header className="top">
          <div>
            <div className="eyebrow">Times Garden</div>
            <div className="leveltag">Lv {lvl} · {title}</div>
            <div className="gpbar"><div className="gpfill" style={{ width: `${(into / GP_PER_LEVEL) * 100}%` }} /></div>
          </div>
          <div className="topbtns">
            <button className="sharebtn" onClick={() => setSplash(true)} aria-label="Share progress">📸</button>
            <button className="gardenbtn" onClick={() => setShowGarden(s => !s)}>
              {showGarden ? "Back to play" : `🌼 ${bloomCount}/${FACT_KEYS.length}`}
            </button>
          </div>
        </header>

        <div className="statsrow">
          <span className={"stat" + (streak >= 5 ? " hot" : "")}>☀️ streak {streak}{banked ? <em className="bank"> (banked {banked})</em> : null}</span>
          <span className="stat">best {best}</span>
          <span className="stat">today {dayCount}{dayGp ? <em className="bank"> · +{dayGp} growth</em> : null}</span>
        </div>

        {showGarden ? (
          <GardenMap facts={facts} />
        ) : q ? (
          <div className={"playcard " + phase} key={q.key + phase + pulse}>
            <div className="dirchip">{q.dir === "mult" ? "multiply" : q.dir === "missing" ? "find the missing number" : "divide"}</div>
            <div className="question">{q.text} {q.dir !== "missing" && <span className="eq">= ?</span>}</div>
            <div className={"typedbox" + (phase === "correct" ? " good" : "")}>{phase === "correct" || phase === "reveal" ? q.answer : (typed || "\u00A0")}</div>
            {note && <div className={"note " + note.kind}>{note.msg}</div>}
            {phase === "retry" && <div className="retrytag">Use the trick and try once more ↑</div>}
            <div className="pad">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => <button key={d} className="key" onClick={() => tap(d)}>{d}</button>)}
              <button className="key soft" onClick={() => tap("back")}>⌫</button>
              <button className="key" onClick={() => tap(0)}>0</button>
              <button className="key go" onClick={() => tap("go")}>✓</button>
            </div>
          </div>
        ) : (
          <div className="loading">Preparing the garden…</div>
        )}

        {!showGarden && (
          <p className="footnote">Facts you miss come back quickly; facts in bloom visit only now and then. As a fact grows, the garden flips it around — into missing-number and division form — because division facts are multiplication facts read backward.</p>
        )}
      </div>
    </div>
  );
}

/* ---------------- garden map ---------------- */
function GardenMap({ facts }) {
  const nums = [];
  for (let n = MIN; n <= MAX; n++) nums.push(n);
  return (
    <div className="gardenwrap">
      <div className="gardentitle">Your fact garden</div>
      <div className="legend">
        {STAGES.map((s, i) => <span key={s} className="legitem"><i className={"cellswatch st" + i} />{STAGE_LABEL[i]}</span>)}
      </div>
      <div className="grid" style={{ gridTemplateColumns: `26px repeat(${nums.length}, 1fr)` }}>
        <div className="hdr" />
        {nums.map(n => <div key={"c" + n} className="hdr">{n}</div>)}
        {nums.map(row => (
          [<div key={"r" + row} className="hdr">{row}</div>,
          ...nums.map(col => {
            const a = Math.min(row, col), b = Math.max(row, col);
            const f = facts[`${a}x${b}`];
            const box = f ? f.b : 0;
            return <div key={row + "-" + col} className={"cellg st" + box} title={`${a}×${b} — ${STAGE_LABEL[box]}`}>{box === 4 ? "❀" : ""}</div>;
          })]
        ))}
      </div>
      <p className="gardennote">Each plot is one fact (the grid mirrors itself — 6×7 and 7×6 are the same plot). Bare soil means the game hasn't grown it yet. Blooms stay in rotation just enough to keep them fresh.</p>
    </div>
  );
}

/* ---------------- styles ---------------- */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;800&family=IBM+Plex+Mono:wght@500;600&display=swap');

.wrap { min-height: 100vh; background: repeating-linear-gradient(#FBF8F1 0px, #FBF8F1 27px, #E9E0CC 27px, #E9E0CC 28px); color: #2E3830; font-family: 'Bricolage Grotesque', system-ui, sans-serif; display:flex; justify-content:center; padding: 0 0 40px; }
.page { width:100%; max-width: 430px; padding: 18px 16px 0; }

.top { display:flex; justify-content:space-between; align-items:flex-start; gap: 10px; }
.eyebrow { font-size: 11px; letter-spacing:.14em; text-transform: uppercase; color:#7A836E; font-weight:600; }
.leveltag { font-size: 20px; font-weight: 800; color:#26413C; margin-top: 2px; }
.gpbar { width: 160px; height: 8px; background:#E4DECB; border-radius: 99px; margin-top: 6px; overflow:hidden; }
.gpfill { height:100%; background: linear-gradient(90deg,#3E9C84,#FFC24B); border-radius:99px; transition: width .4s ease; }
.gardenbtn { background:#26413C; color:#FBF8F1; border:none; border-radius: 99px; font-family:inherit; font-weight:700; font-size:14px; padding: 10px 14px; cursor:pointer; min-height:42px; }
.topbtns { display:flex; gap:8px; align-items:center; }
.sharebtn { background:#fff; border:1.5px solid #26413C; border-radius:99px; font-size:18px; line-height:1; padding:0 12px; min-height:42px; cursor:pointer; }
.sharebtn:active { transform: translateY(1px); }

.statsrow { display:flex; gap: 8px; margin: 12px 0; flex-wrap: wrap; }
.stat { font-size: 12.5px; font-weight:600; color:#4A554C; background:#fff; border:1.5px solid #D8D2BE; border-radius:99px; padding: 5px 11px; }
.stat.hot { border-color:#E4572E; color:#E4572E; }
.bank { font-style: normal; color:#8A927F; font-weight: 500; }

.playcard { background:#fff; border:1.5px solid #26413C; border-radius: 16px; padding: 18px 16px 14px; box-shadow: 4px 4px 0 rgba(38,65,60,.15); }
.playcard.correct { border-color:#3E9C84; box-shadow: 4px 4px 0 rgba(62,156,132,.35); }
.dirchip { display:inline-block; font-size: 10.5px; font-weight:700; letter-spacing:.1em; text-transform: uppercase; color:#fff; background:#3E9C84; padding: 4px 10px; border-radius: 99px; }
.question { font-family:'IBM Plex Mono', monospace; font-size: 34px; font-weight:600; text-align:center; margin: 18px 0 10px; color:#26413C; }
.eq { color:#B4AC93; }
.typedbox { font-family:'IBM Plex Mono', monospace; font-size: 30px; font-weight:600; text-align:center; background:#F5F2E8; border:1.5px dashed #C2C9B7; border-radius: 12px; padding: 10px; min-height: 56px; color:#26413C; }
.typedbox.good { background:#E6F4EF; border-color:#3E9C84; border-style: solid; color:#1F6B58; }

.note { margin-top: 12px; font-size: 14px; line-height: 1.55; padding: 10px 12px; border-radius: 10px; }
.note.good { background:#E6F4EF; color:#1F6B58; border:1px solid #A5D6C7; }
.note.bloom { background:#FFF4D6; color:#7A5A12; border:1px solid #EFD48E; }
.note.hint { background:#FDF1E2; color:#8A5314; border:1px solid #ECCB9B; }
.note.reveal { background:#FBEDEA; color:#93402E; border:1px solid #ECBCAE; }
.retrytag { margin-top: 8px; font-size: 12px; font-weight: 700; color:#E4572E; text-align:center; }

.pad { display:grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 14px; }
.key { font-family:'IBM Plex Mono', monospace; font-size: 22px; font-weight:600; padding: 13px 0; min-height: 54px; border-radius: 12px; border:1.5px solid #26413C; background:#FDFCF8; color:#26413C; cursor:pointer; box-shadow: 0 2px 0 rgba(38,65,60,.25); }
.key:active { transform: translateY(2px); box-shadow: none; }
.key.soft { background:#F0EDE1; }
.key.go { background:#FFC24B; }

.loading { text-align:center; color:#8A927F; padding: 40px 0; }
.footnote { font-size: 12px; line-height: 1.55; color:#7A836E; margin-top: 14px; border-left: 3px solid #FFC24B; padding-left: 10px; }

.gardenwrap { background:#fff; border:1.5px solid #26413C; border-radius: 16px; padding: 14px; box-shadow: 4px 4px 0 rgba(38,65,60,.15); }
.gardentitle { font-weight:800; font-size: 17px; color:#26413C; margin-bottom: 8px; }
.legend { display:flex; gap: 10px; flex-wrap: wrap; margin-bottom: 10px; }
.legitem { display:flex; align-items:center; gap: 4px; font-size: 11px; color:#5C665A; }
.cellswatch { width: 12px; height: 12px; border-radius: 3px; display:inline-block; }
.grid { display:grid; gap: 3px; }
.hdr { font-family:'IBM Plex Mono', monospace; font-size: 10px; color:#8A927F; display:flex; align-items:center; justify-content:center; }
.cellg { aspect-ratio: 1; border-radius: 4px; display:flex; align-items:center; justify-content:center; font-size: 10px; color:#7A5A12; }
.st0 { background:#EFEAD9; }
.st1 { background:#CDE3C2; }
.st2 { background:#8FC58C; }
.st3 { background:#4FA477; }
.st4 { background:#FFC24B; }
.gardennote { font-size: 11.5px; line-height: 1.55; color:#7A836E; margin: 10px 0 0; }

@media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
`;
