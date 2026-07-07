import { useState, useEffect, useRef } from "react";

/* ============================================================
   LONG DIVISION MOUNTAIN — an endless expedition
   Each camp is one long-division problem. The worksheet fills
   in like handwriting, one micro-step at a time: how many fit?
   → multiply → subtract → tap to bring down. Every step is a
   small win, every slip gets a targeted hint, and the climb
   gets steeper every five camps. Estimating the answer's size
   before climbing ("scouting") earns a bonus flag — magnitude
   sense is half of long division.
   ============================================================ */

/* ---------------- problem generation ---------------- */
const TIER_NAMES = ["Foothills", "Pine Slopes", "Boulder Field", "High Camp", "Summit Ridge", "Sky Trail"];
function tierFor(camp) {
  if (camp <= 5) return 0;
  if (camp <= 10) return 1;
  if (camp <= 15) return 2;
  if (camp <= 20) return 3;
  if (camp <= 25) return 4;
  return 5; // Sky Trail: endless cycle of the hard tiers
}
function ri(lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); }
function genProblem(camp) {
  const t = tierFor(camp);
  let d, dividend;
  const hardPick = t === 5 ? [2, 3, 4][(camp - 26) % 3] : t;
  switch (hardPick) {
    case 0: { d = ri(3, 7); const q = ri(12, Math.floor(99 / d)); dividend = q * d; break; }
    case 1: { d = ri(3, 9); const q = ri(Math.ceil(100 / d), Math.floor(999 / d)); dividend = q * d; break; }
    case 2: { d = ri(3, 9); dividend = ri(Math.max(100, 10 * d), 989); break; }
    case 3: { d = ri(3, 9); dividend = ri(Math.max(1200, 100 * d), 9899); break; }
    default: { d = ri(11, 12); dividend = ri(10 * d + ri(0, 9), 999); break; }
  }
  return { dividend, divisor: d, tier: t };
}

/* Build the full micro-step script for a problem */
function buildScript(dividend, divisor) {
  const digits = String(dividend).split("").map(Number);
  const steps = [];
  let rem = 0, started = false, quotient = "";
  for (let i = 0; i < digits.length; i++) {
    const cur = rem * 10 + digits[i];
    if (!started && cur < divisor && i < digits.length - 1) {
      steps.push({ t: "lead", col: i, cur }); // chunk widens silently (highlight only)
      rem = cur;
      continue;
    }
    started = true;
    const qd = Math.floor(cur / divisor);
    const prod = qd * divisor;
    const diff = cur - prod;
    steps.push({ t: "q", col: i, cur, qd });
    steps.push({ t: "m", col: i, cur, qd, prod });
    steps.push({ t: "s", col: i, cur, prod, diff });
    if (i < digits.length - 1) steps.push({ t: "b", col: i + 1, digit: digits[i + 1], from: diff });
    rem = diff;
    quotient += String(qd);
  }
  return { steps, quotient, remainder: rem, digits };
}

/* ---------------- hint text ---------------- */
function hintFor(step, divisor, wrongVal) {
  if (step.t === "q") {
    const v = wrongVal;
    if (!isNaN(v)) {
      if (v * divisor > step.cur) return `${divisor} × ${v} = ${v * divisor} — that overshoots ${step.cur}. Go one smaller.`;
      if ((v + 1) * divisor <= step.cur) return `${divisor} × ${v} = ${v * divisor}, which leaves ${step.cur - v * divisor} — another ${divisor} still fits. Go one bigger.`;
    }
    return `Ask: what times ${divisor} gets closest to ${step.cur} without going over?`;
  }
  if (step.t === "m") {
    if (divisor >= 11) return `${step.qd} × ${divisor} = ${step.qd} × 10 + ${step.qd} × ${divisor - 10} = ${step.qd * 10} + ${step.qd * (divisor - 10)}.`;
    return `Count by ${divisor}s to get there: …, ${(step.qd - 1) * divisor}, ${step.qd * divisor}.`;
  }
  if (step.t === "s") {
    const tens = Math.floor(step.prod / 10) * 10;
    if (tens > 0) return `Take ${step.cur} − ${step.prod} in parts: first − ${tens} → ${step.cur - tens}, then − ${step.prod - tens}.`;
    return `Count up from ${step.prod} to ${step.cur} — the gap is your answer.`;
  }
  return "";
}
function promptFor(step, divisor) {
  if (step.t === "q") return `How many ${divisor}s fit in ${step.cur}?`;
  if (step.t === "m") return `${step.qd} × ${divisor} = ?`;
  if (step.t === "s") return `${step.cur} − ${step.prod} = ?`;
  if (step.t === "b") return `Tap the glowing digit to bring it down`;
  return "";
}
function answerFor(step) {
  if (step.t === "q") return step.qd;
  if (step.t === "m") return step.prod;
  if (step.t === "s") return step.diff;
  return null;
}

/* ---------------- persistence ---------------- */
const STORE_KEY = "division-mountain-v1";
async function loadState() {
  try { if (typeof window !== "undefined" && window.storage) { const r = await window.storage.get(STORE_KEY); if (r && r.value) return JSON.parse(r.value); } } catch (e) { /* first run */ }
  return null;
}
async function saveState(s) {
  try { if (typeof window !== "undefined" && window.storage) await window.storage.set(STORE_KEY, JSON.stringify(s)); } catch (e) { /* offline ok */ }
}

/* ---------------- component ---------------- */
export default function DivisionMountain() {
  const [camp, setCamp] = useState(1);
  const [stars, setStars] = useState({}); // campNo -> 1..3
  const [flags, setFlags] = useState(0);  // scout bonuses earned
  const [loaded, setLoaded] = useState(false);

  const [prob, setProb] = useState(null);   // {dividend, divisor, script:{steps,quotient,remainder,digits}}
  const [si, setSi] = useState(0);          // step index
  const [typed, setTyped] = useState("");
  const [misses, setMisses] = useState(0);
  const [tries, setTries] = useState(0);    // tries on current step
  const [note, setNote] = useState(null);
  const [scout, setScout] = useState("ask"); // ask | won | lost | skip
  const [done, setDone] = useState(false);

  useEffect(() => {
    loadState().then(s => {
      if (s) { setCamp(s.camp || 1); setStars(s.stars || {}); setFlags(s.flags || 0); }
      setLoaded(true);
    });
  }, []);
  useEffect(() => { if (loaded) saveState({ camp, stars, flags }); }, [camp, stars, flags, loaded]);
  useEffect(() => { if (loaded && !prob) startCamp(camp); /* eslint-disable-line */ }, [loaded]);

  function startCamp(c) {
    const p = genProblem(c);
    const script = buildScript(p.dividend, p.divisor);
    setProb({ ...p, script });
    setSi(firstRealStep(script.steps, 0));
    setTyped(""); setMisses(0); setTries(0); setNote(null); setDone(false); setScout("ask");
  }
  function firstRealStep(steps, from) {
    let i = from;
    while (i < steps.length && steps[i].t === "lead") i++;
    return i;
  }

  const step = prob && !done ? prob.script.steps[si] : null;

  function advance() {
    const next = firstRealStep(prob.script.steps, si + 1);
    if (next >= prob.script.steps.length) {
      // camp complete
      const s = misses === 0 ? 3 : misses <= 2 ? 2 : 1;
      setStars(prev => ({ ...prev, [camp]: Math.max(prev[camp] || 0, s) }));
      setDone(true);
      setNote(null);
    } else {
      setSi(next); setTyped(""); setTries(0); setNote(null);
    }
  }

  function submit() {
    if (!step || step.t === "b" || !typed) return;
    const val = parseInt(typed, 10);
    const ans = answerFor(step);
    if (val === ans) {
      setNote(null);
      advance();
    } else if (tries === 0) {
      setTries(1); setMisses(m => m + 1); setTyped("");
      setNote({ kind: "hint", msg: hintFor(step, prob.divisor, val) });
    } else {
      setTyped("");
      setNote({ kind: "reveal", msg: `It's ${ans}. ${hintFor(step, prob.divisor, NaN)} Keep climbing — filled it in for you.` });
      setTimeout(() => advance(), 1900);
    }
  }
  function bringDown() {
    if (step && step.t === "b") advance();
  }
  function tap(d) {
    if (!step || step.t === "b") return;
    if (d === "back") setTyped(t => t.slice(0, -1));
    else if (d === "go") submit();
    else if (typed.length < 4) setTyped(t => (t === "0" ? String(d) : t + String(d)));
  }
  function scoutAnswer(n) {
    if (n === prob.script.quotient.length) { setScout("won"); setFlags(f => f + 1); }
    else setScout("lost");
  }

  const totalStars = Object.values(stars).reduce((a, b) => a + b, 0);
  const tier = prob ? tierFor(camp) : 0;

  return (
    <div className="wrap">
      <style>{css}</style>
      <div className="page">
        <header className="top">
          <div>
            <div className="eyebrow">Long Division Mountain</div>
            <div className="camptag">Camp {camp} · {TIER_NAMES[tier]}</div>
          </div>
          <div className="totals">★ {totalStars}<span className="flagchip">⚑ {flags}</span></div>
        </header>

        <CampTrail camp={camp} stars={stars} />

        {prob && scout === "ask" && !done && (
          <div className="scoutcard">
            <div className="scouttitle">⚑ Scout the peak</div>
            <p className="scoutq">Before you climb: about how big will <b>{prob.dividend} ÷ {prob.divisor}</b> be? Pick how many digits the answer has.</p>
            <div className="scoutrow">
              {[1, 2, 3, 4].map(n => <button key={n} className="scoutbtn" onClick={() => scoutAnswer(n)}>{n} digit{n > 1 ? "s" : ""}</button>)}
              <button className="scoutskip" onClick={() => setScout("skip")}>skip</button>
            </div>
          </div>
        )}

        {prob && scout !== "ask" && (
          <>
            {scout === "won" && !done && <div className="scoutresult won">⚑ Scouted it — the answer has {prob.script.quotient.length} digits. Bonus flag earned!</div>}
            {scout === "lost" && !done && <div className="scoutresult lost">Good guess — it'll actually have {prob.script.quotient.length} digits. Watch how the first chunk decides that.</div>}

            <Worksheet prob={prob} si={si} done={done} onBringDown={bringDown} />

            {!done && step && (
              <div className="stepcard">
                <div className="steplabel">{step.t === "q" ? "① divide" : step.t === "m" ? "② multiply" : step.t === "s" ? "③ subtract" : "④ bring down"}</div>
                <div className="stepprompt">{promptFor(step, prob.divisor)}</div>
                {step.t !== "b" ? (
                  <>
                    <div className="typedbox">{typed || "\u00A0"}</div>
                    {note && <div className={"note " + note.kind}>{note.msg}</div>}
                    <div className="pad">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => <button key={d} className="key" onClick={() => tap(d)}>{d}</button>)}
                      <button className="key soft" onClick={() => tap("back")}>⌫</button>
                      <button className="key" onClick={() => tap(0)}>0</button>
                      <button className="key go" onClick={() => tap("go")}>✓</button>
                    </div>
                  </>
                ) : (
                  <div className="bringnote">The subtraction left {step.from}. Bring the next digit down beside it to make your new number.</div>
                )}
              </div>
            )}

            {done && (
              <div className="donecard">
                <div className="donestars">{"★".repeat(stars[camp] || 1)}{"☆".repeat(3 - (stars[camp] || 1))}</div>
                <div className="donemain">{prob.dividend} ÷ {prob.divisor} = <b>{prob.script.quotient}</b>{prob.script.remainder > 0 && <span> R {prob.script.remainder}</span>}</div>
                <div className="donesub">{misses === 0 ? "Flawless climb — every step first try." : misses <= 2 ? "Strong climb — a couple of wobbles, all recovered." : "You made it up — this camp is worth a rematch someday."}</div>
                <div className="donecheck">Check: {prob.script.quotient} × {prob.divisor}{prob.script.remainder > 0 ? ` + ${prob.script.remainder}` : ""} = {prob.dividend} ✓</div>
                <button className="nextbtn" onClick={() => { const c = camp + 1; setCamp(c); startCamp(c); }}>Climb to Camp {camp + 1} →</button>
              </div>
            )}
          </>
        )}

        <p className="footnote">The rhythm is always the same: divide → multiply → subtract → bring down, then repeat. Camps get steeper every 5: bigger numbers, remainders, then the {TIER_NAMES[4]} (÷11 and ÷12).</p>
      </div>
    </div>
  );
}

/* ---------------- camp trail ---------------- */
function CampTrail({ camp, stars }) {
  const start = Math.max(1, camp - 2);
  const nodes = [];
  for (let c = start; c < start + 6; c++) nodes.push(c);
  return (
    <div className="trail">
      {nodes.map(c => (
        <div key={c} className={"node" + (c === camp ? " here" : c < camp ? " past" : " future")}>
          <div className="nodenum">{c}</div>
          <div className="nodestars">{c < camp ? "★".repeat(stars[c] || 0) || "·" : c === camp ? "⛺" : "🏔"}</div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- worksheet renderer ---------------- */
function Worksheet({ prob, si, done, onBringDown }) {
  const { steps, digits, quotient, remainder } = prob.script;
  const n = digits.length;
  const COLS = n + 1; // one spare leading column for minus signs
  const upTo = done ? steps.length : si;

  // quotient digits completed
  const qDigits = {}; // col -> digit
  // work rows: each cycle produces {prodRow, diffRow}
  const rows = []; // {cells: {col: {ch, cls}}}
  let lastDiffRow = null;
  let highlight = { row: "dividend", cols: [] };
  let bringGlowCol = null;

  // determine highlight for the current step
  const cstep = !done ? steps[si] : null;

  // leading chunk cols (before first q): all 'lead' steps’ cols + first q col
  for (let idx = 0; idx < steps.length; idx++) {
    const st = steps[idx];
    const isDone = idx < upTo;
    if (st.t === "q" && isDone) qDigits[st.col] = st.qd;
    if (st.t === "m" && isDone) {
      const cells = {};
      const s = String(st.prod);
      for (let k = 0; k < s.length; k++) cells[st.col - (s.length - 1) + k + 1] = { ch: s[k] };
      cells[st.col - s.length + 1] = { ch: "−", cls: "minus" };
      rows.push({ cells });
    }
    if (st.t === "s" && isDone) {
      const cells = {};
      const s = String(st.diff);
      for (let k = 0; k < s.length; k++) cells[st.col - (s.length - 1) + k + 1] = { ch: s[k], cls: "diff" };
      rows.push({ cells });
      lastDiffRow = rows[rows.length - 1];
    }
    if (st.t === "b" && isDone && lastDiffRow) {
      lastDiffRow.cells[st.col + 1] = { ch: String(st.digit), cls: "brought" };
    }
  }

  if (cstep) {
    if (cstep.t === "q") {
      // chunk = the digits forming cur
      const w = String(cstep.cur).length;
      if (lastDiffRow) {
        highlight = { row: "lastdiff", cols: [] };
        // highlight all cells of lastDiffRow
      } else {
        highlight = { row: "dividend", cols: Array.from({ length: w }, (_, k) => cstep.col - w + 1 + k + 1) };
      }
    } else if (cstep.t === "b") {
      bringGlowCol = cstep.col + 1;
    }
  }

  return (
    <div className="sheet">
      <div className="sgrid" style={{ gridTemplateColumns: `52px repeat(${COLS}, 30px)` }}>
        {/* quotient row */}
        <div className="scell gutter" />
        {Array.from({ length: COLS }, (_, c) => (
          <div key={"q" + c} className="scell qrow">{qDigits[c - 1] !== undefined ? qDigits[c - 1] : ""}</div>
        ))}
        {/* dividend row with bracket */}
        <div className="scell gutter divisor">{prob.divisor}<span className="brk">)</span></div>
        {Array.from({ length: COLS }, (_, c) => {
          const dIdx = c - 1;
          const ch = dIdx >= 0 && dIdx < n ? digits[dIdx] : "";
          const hl = highlight.row === "dividend" && highlight.cols.includes(c);
          const glow = bringGlowCol === c;
          return (
            <div key={"d" + c} className={"scell drow" + (hl ? " hl" : "") + (glow ? " glow" : "")}
              onClick={glow ? onBringDown : undefined}>{ch}</div>
          );
        })}
        {/* work rows */}
        {rows.map((row, ri2) => {
          const hlAll = row === lastDiffRow && highlight.row === "lastdiff";
          return [
            <div key={ri2 + "g"} className="scell gutter" />,
            ...Array.from({ length: COLS }, (_, k) => {
              const cell = row.cells[k]; // cells are keyed 0..COLS-1, matching the digit grid (digit i sits at k = i + 1)
              const hl = hlAll && !!cell;
              return <div key={ri2 + "c" + k} className={"scell wrow " + (cell ? (cell.cls || "") : "") + (hl ? " hl" : "")}>{cell ? cell.ch : ""}</div>;
            })
          ];
        })}
      </div>
      {done && <div className="remline">{remainder > 0 ? `remainder ${remainder}` : "no remainder — it divides evenly"}</div>}
    </div>
  );
}

/* ---------------- styles ---------------- */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;800&family=IBM+Plex+Mono:wght@500;600&display=swap');

.wrap { min-height: 100vh; background: repeating-linear-gradient(#F7F8F6 0px, #F7F8F6 27px, #DEE3DC 27px, #DEE3DC 28px); color: #2B3438; font-family: 'Bricolage Grotesque', system-ui, sans-serif; display:flex; justify-content:center; padding: 0 0 40px; }
.page { width:100%; max-width: 430px; padding: 18px 16px 0; }

.top { display:flex; justify-content:space-between; align-items:flex-start; }
.eyebrow { font-size: 11px; letter-spacing:.14em; text-transform: uppercase; color:#6E7F84; font-weight:600; }
.camptag { font-size: 20px; font-weight: 800; color:#274248; margin-top: 2px; }
.totals { font-size: 16px; font-weight: 800; color:#B07B10; display:flex; align-items:center; gap:8px; }
.flagchip { font-size: 13px; color:#2E6E5E; background:#E2F0EA; border-radius:99px; padding: 3px 9px; }

.trail { display:flex; gap: 8px; margin: 12px 0; overflow-x:auto; padding-bottom: 4px; }
.node { flex-shrink:0; width: 54px; background:#fff; border:1.5px solid #C7CFC9; border-radius: 12px; padding: 6px 4px; text-align:center; }
.node.here { border-color:#274248; box-shadow: 2px 2px 0 rgba(39,66,72,.2); }
.node.future { opacity:.45; }
.nodenum { font-size: 11px; font-weight: 700; color:#6E7F84; }
.nodestars { font-size: 13px; color:#E2A400; min-height: 18px; }

.scoutcard { background:#fff; border:1.5px solid #274248; border-radius: 14px; padding: 14px; box-shadow: 3px 3px 0 rgba(39,66,72,.15); margin-bottom: 12px; }
.scouttitle { font-weight: 800; color:#2E6E5E; font-size: 14px; }
.scoutq { font-size: 14px; line-height:1.5; margin: 6px 0 10px; }
.scoutrow { display:flex; gap: 6px; flex-wrap: wrap; }
.scoutbtn { font-family:inherit; font-weight:700; font-size: 13.5px; padding: 10px 12px; border-radius: 10px; border:1.5px solid #274248; background:#FDFDFA; cursor:pointer; min-height:44px; }
.scoutskip { font-family:inherit; font-size: 12px; color:#8B979B; background:none; border:none; cursor:pointer; text-decoration: underline; }
.scoutresult { font-size: 13px; padding: 9px 12px; border-radius: 10px; margin-bottom: 10px; }
.scoutresult.won { background:#E2F0EA; color:#245C4E; border:1px solid #A9D3C4; }
.scoutresult.lost { background:#F2F1E4; color:#6E6A45; border:1px solid #DAD6B4; }

.sheet { background:#fff; border:1.5px solid #274248; border-radius: 14px; padding: 14px 10px; box-shadow: 3px 3px 0 rgba(39,66,72,.15); overflow-x:auto; }
.sgrid { display:grid; grid-auto-rows: 34px; justify-content:center; }
.scell { font-family:'IBM Plex Mono', monospace; font-size: 20px; font-weight:600; display:flex; align-items:center; justify-content:center; color:#274248; }
.scell.qrow { border-bottom: 2px solid #274248; color:#2E6E5E; font-weight:700; }
.scell.gutter { justify-content:flex-end; padding-right: 6px; }
.scell.divisor { font-weight:700; }
.brk { margin-left: 3px; font-weight:400; transform: scaleY(1.6); display:inline-block; }
.scell.drow { }
.scell.hl { background:#FFEBB8; border-radius: 6px; }
.scell.glow { background:#FFD980; border-radius: 8px; cursor:pointer; animation: pulse 1s ease infinite alternate; }
@keyframes pulse { from { box-shadow: 0 0 0 0 rgba(226,164,0,.5);} to { box-shadow: 0 0 0 6px rgba(226,164,0,0);} }
.scell.minus { color:#C15B45; }
.scell.diff { color:#274248; }
.scell.brought { color:#B07B10; font-weight:700; }
.remline { text-align:center; font-size: 12.5px; color:#6E7F84; margin-top: 8px; }

.stepcard { background:#fff; border:1.5px solid #274248; border-radius: 14px; padding: 14px; box-shadow: 3px 3px 0 rgba(39,66,72,.15); margin-top: 12px; }
.steplabel { font-size: 11px; font-weight:800; letter-spacing:.1em; text-transform: uppercase; color:#2E6E5E; }
.stepprompt { font-size: 18px; font-weight:700; margin: 8px 0 10px; color:#274248; }
.typedbox { font-family:'IBM Plex Mono', monospace; font-size: 26px; font-weight:600; text-align:center; background:#F2F4F1; border:1.5px dashed #B9C4BE; border-radius: 12px; padding: 8px; min-height: 50px; }
.note { margin-top: 10px; font-size: 13.5px; line-height: 1.5; padding: 9px 11px; border-radius: 10px; }
.note.hint { background:#FDF2E0; color:#8A5314; border:1px solid #ECCB9B; }
.note.reveal { background:#FBEDEA; color:#93402E; border:1px solid #ECBCAE; }
.bringnote { font-size: 14px; line-height: 1.5; color:#4B5B60; background:#FFF7E2; border:1.5px dashed #E2C878; border-radius: 10px; padding: 10px 12px; }

.pad { display:grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 12px; }
.key { font-family:'IBM Plex Mono', monospace; font-size: 22px; font-weight:600; padding: 12px 0; min-height: 52px; border-radius: 12px; border:1.5px solid #274248; background:#FDFDFA; color:#274248; cursor:pointer; box-shadow: 0 2px 0 rgba(39,66,72,.25); }
.key:active { transform: translateY(2px); box-shadow:none; }
.key.soft { background:#EDF0EC; }
.key.go { background:#FFC24B; }

.donecard { background:#fff; border:1.5px solid #2E6E5E; border-radius: 14px; padding: 18px 14px; box-shadow: 3px 3px 0 rgba(46,110,94,.25); margin-top: 12px; text-align:center; }
.donestars { font-size: 30px; color:#E2A400; letter-spacing: 4px; }
.donemain { font-size: 19px; margin: 8px 0 4px; }
.donesub { font-size: 13px; color:#5C6B70; }
.donecheck { font-family:'IBM Plex Mono', monospace; font-size: 12.5px; color:#2E6E5E; margin-top: 8px; }
.nextbtn { margin-top: 12px; width:100%; background:#274248; color:#F7F8F6; border:none; border-radius: 12px; font-family:inherit; font-weight:800; font-size: 16px; padding: 14px; cursor:pointer; min-height: 52px; }

.footnote { font-size: 12px; line-height:1.55; color:#6E7F84; margin-top: 14px; border-left: 3px solid #E2A400; padding-left: 10px; }

@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
`;
