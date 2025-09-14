import { useEffect, useMemo, useRef, useState } from "react";

// Duolingo-inspired dashboard with dark mode toggle.
// Streams TWO charts side-by-side: Biggest Winner & Biggest Loser.
// Fully responsive, full-bleed layout.

export default function App() {
  // --- Theme (dark / light) ---
  const getPreferred = () =>
    (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches)
      ? "dark"
      : "light";
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || getPreferred());
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // --- Simple route: 'dashboard' | 'learn' ---
  const [route, setRoute] = useState({ view: "dashboard", moduleKey: null });

  // --- XP state (demo) ---
  const [xp, setXp] = useState(420);
  const xpGoal = 1000;
  const xpPct = Math.min(100, Math.round((xp / xpGoal) * 100));

  // --- Modules (tiles) ---
  const modules = [
    { id: 1, key: "rbc", title: "RBC InvestEase", subtitle: "Index Fund Basics", bgLight: "#FDE68A", bgDark: "#3a2e00", video: "https://www.w3schools.com/html/mov_bbb.mp4" },
    { id: 2, key: "cohere", title: "Cohere Coach", subtitle: "AI Chat Tutor", bgLight: "#A7F3D0", bgDark: "#0b3b2e", video: "https://www.w3schools.com/html/movie.mp4" },
    { id: 3, key: "options", title: "Options 101", subtitle: "Risk & Reward", bgLight: "#93C5FD", bgDark: "#0f2553", video: "https://www.w3schools.com/html/mov_bbb.mp4" },
  ];

  // --- Series store per module ---
  const POINTS = 160; // samples kept in memory per module
  const seeds = { rbc: 100, cohere: 120, options: 80 };

  const [seriesMap, setSeriesMap] = useState(() => {
    const init = {};
    for (const m of modules) init[m.key] = makeInitialSeries(POINTS, seeds[m.key]);
    return init;
  });

  // Simulate realtime updates for ALL modules
  useEffect(() => {
    const id = setInterval(() => {
      setSeriesMap((prev) => {
        const map = { ...prev };
        for (const key of Object.keys(map)) {
          const prevSeries = map[key];
          const last = prevSeries[prevSeries.length - 1];
          const y = nextVal(last.y);
          map[key] = [...prevSeries.slice(1), { x: last.x + 1, y }];
        }
        return map;
      });
      setXp((v) => (v < xpGoal ? Math.min(xpGoal, v + Math.floor(Math.random() * 4)) : v));
    }, 900);
    return () => clearInterval(id);
  }, []);

  // --- Compute biggest winner and loser by % change over the window ---
  const { winnerKey, loserKey, winnerPct, loserPct } = useMemo(() => pickWinners(seriesMap), [seriesMap]);

  const winnerModule = modules.find((m) => m.key === winnerKey) ?? modules[0];
  const loserModule = modules.find((m) => m.key === loserKey) ?? modules[1] ?? modules[0];

  const onTileClick = (m) => setRoute({ view: "learn", moduleKey: m.key });

  return (
    <div className="app-root">
      <StyleTag />
      <header className="topbar">
        <div className="brand">
          {route.view === "learn" && (
            <button className="back-btn" onClick={() => setRoute({ view: "dashboard", moduleKey: null })} aria-label="Back to dashboard">←</button>
          )}
          <span className="logo" aria-hidden>🪙</span>
          <span className="title">InvestLearn</span>
        </div>
        <div className="xp">
          <div className="xp-label" aria-live="polite">XP {xp}/{xpGoal}</div>
          <div className="xp-bar" aria-label="Experience progress">
            <div className="xp-fill" style={{ width: `${xpPct}%` }} />
          </div>
        </div>
        <div className="actions">
          <button
            className="icon-btn"
            aria-label="Toggle theme"
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            title={theme === "dark" ? "Switch to light" : "Switch to dark"}
          >
            <span>{theme === "dark" ? "🌞" : "🌙"}</span>
          </button>
          <button className="icon-btn" aria-label="Leaderboard"><span>🏆</span></button>
          <button className="icon-btn" aria-label="Profile"><span>👤</span></button>
        </div>
      </header>

      {route.view === "dashboard" ? (
        <main className="content">
          {/* Tiles grid */}
          <section className="tile-grid" aria-label="Learning modules">
            {modules.map((m) => (
              <button
                key={m.id}
                className="tile"
                style={{ backgroundColor: theme === "dark" ? m.bgDark : m.bgLight }}
                onClick={() => onTileClick(m)}
              >
                <div className="tile-head">
                  <span className="tile-emoji" aria-hidden>📚</span>
                  <span className="tile-title">{m.title}</span>
                </div>
                <div className="tile-sub">{m.subtitle}</div>
                <div className="tile-cta">Start →</div>
              </button>
            ))}
          </section>

          {/* Dual charts: biggest winner & biggest loser */}
          <section className="charts-grid" aria-label="Top movers">
            <ChartPanel
              id="winner"
              title={`Biggest Winner • ${winnerModule.title}`}
              series={seriesMap[winnerKey] ?? []}
              chipLabel={`▲ Up ${formatPct(winnerPct)}`}
              up
            />
            <ChartPanel
              id="loser"
              title={`Biggest Loser • ${loserModule.title}`}
              series={seriesMap[loserKey] ?? []}
              chipLabel={`▼ Down ${formatPct(Math.abs(loserPct))}`}
            />
          </section>
        </main>
      ) : (
        <LearningView
          theme={theme}
          module={modules.find((m) => m.key === route.moduleKey) ?? modules[0]}
          onBack={() => setRoute({ view: "dashboard", moduleKey: null })}
        />
      )}

      <footer className="foot">
        <span>Built for Hack The North • Demo UI</span>
      </footer>
    </div>
  );
}

// ---- Components ----
function ChartPanel({ id, title, series, chipLabel, up = false }) {
  const lastDelta = useMemo(() => {
    if (series.length < 2) return 0;
    const a = series[series.length - 2].y;
    const b = series[series.length - 1].y;
    return b - a;
  }, [series]);

  const ref = useRef(null);
  const [size, setSize] = useState({ w: 900, h: 300 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        const targetH = Math.max(220, Math.min(520, cr.width * 0.5));
        setSize({ w: cr.width, h: targetH });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { path, minY, maxY } = useMemo(() => buildPath(series, size.w, size.h), [series, size]);

  return (
    <div className="chart-wrap">
      <div className="chart-head">
        <div className="chart-title">{title}</div>
        <div className={`chip ${up ? "up" : "down"}`}>{chipLabel}</div>
      </div>
      <div className="chart-canvas" ref={ref}>
        <svg width="100%" height="100%" viewBox={`0 0 ${size.w} ${size.h}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id={`areaFill-${id}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={up ? "#22c55e" : "#ef4444"} stopOpacity="0.25" />
              <stop offset="100%" stopColor={up ? "#22c55e" : "#ef4444"} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${path} L ${size.w} ${size.h} L 0 ${size.h} Z`} fill={`url(#areaFill-${id})`} />
          <GuideLines minY={minY} maxY={maxY} w={size.w} h={size.h} />
          <path d={path} fill="none" stroke={up ? "#16a34a" : "#dc2626"} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

// ---- Learning View ----
function LearningView({ theme, module, onBack }) {
  // sample questions per module
  const bank = useMemo(() => getQuestionBank(module.key), [module.key]);
  const [idx, setIdx] = useState(0);
  const q = bank[idx];
  const [choice, setChoice] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const correct = submitted && choice === q.correct;
  const [attempts, setAttempts] = useState(0);

  useEffect(() => { setChoice(null); setSubmitted(false); setAttempts(0); }, [idx, module.key]);

  return (
    <main className="learn content">
      <section className="learn-grid" aria-label="Learning page">
        {/* Left: Brainrot video player */}
        <div className="video-panel">
          <div className="video-head">
            <button className="ghost-btn" onClick={onBack}>← Back</button>
            <div className="video-title">{module.title} • Brainrot Player</div>
          </div>
          <div className="video-wrap">
            <video key={module.key} controls playsInline className="video" poster="" src={module.video} />
          </div>
        </div>

        {/* Right: Questions */}
        <div className="qa-panel">
          <div className="qa-head">
            <div className="badge">Question {idx + 1} / {bank.length}</div>
            <div className="badge secondary">Topic: {q.topic}</div>
          </div>

          <div className="qa-card">
            <h3 className="qa-q">{q.prompt}</h3>
            <div className="qa-choices">
              {q.choices.map((c, i) => (
                <label key={i} className={`choice ${choice === i ? "picked" : ""}`}>
                  <input
                    type="radio"
                    name="choice"
                    checked={choice === i}
                    onChange={() => setChoice(i)}
                  />
                  <span>{c}</span>
                </label>
              ))}
            </div>

            {submitted && !correct && (
              <div className="result no">
                ❌ Not quite.
                <div className="explain">
                  Hint: {q.hints?.[Math.max(0, Math.min(attempts - 1, (q.hints?.length || 1) - 1))] || "Re-read the prompt and eliminate obviously wrong options."}
                </div>
              </div>
            )}

            {submitted && correct && (
              <div className="result ok">
                ✅ Correct!
                <div className="explain">{q.why || q.explain || "Nice work — that’s the key idea."}</div>
              </div>
            )}

            <div className="qa-actions">
              <button
                className="primary-btn"
                onClick={() => {
                if (!submitted) {
                  if (choice !== null && choice !== q.correct) setAttempts((a) => a + 1);
                  setSubmitted(true);
                } else {
                  setIdx((i) => Math.min(i + 1, bank.length - 1));
                  setSubmitted(false);
                  setChoice(null);
                  setAttempts(0);
                }
              }}
                disabled={choice === null && !submitted}
              >
                {!submitted ? "Check" : idx < bank.length - 1 ? "Next" : "Done"}
              </button>
              <button className="ghost-btn" onClick={() => setIdx(0)}>Restart</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function getQuestionBank(key) {
  const base = {
    rbc: [
      {
        topic: "Index Funds",
        prompt: "What is the main benefit of an index fund?",
        choices: ["Guaranteed outperformance", "Broad market diversification", "Zero fees", "Daily dividends"],
        correct: 1,
        explain: "Index funds track a market index for wide exposure at low cost.",
        why: "Diversification reduces single-stock risk and usually lowers fees.",
        hints: ["Think about risk across many companies.", "Which choice mentions spreading bets?"],
      },
      {
        topic: "Fees",
        prompt: "Lower expense ratios typically mean:",
        choices: ["Lower returns", "Higher risk", "More of your returns kept", "More active trading"],
        correct: 2,
        explain: "Fees subtract from performance over time.",
        why: "If costs are lower, more of the gross return stays in your pocket.",
        hints: ["Fees come out of performance.", "Lower fees = ? of your return remains"],
      },
    ],
    cohere: [
      {
        topic: "AI Coaching",
        prompt: "A good prompt is usually:",
        choices: ["Vague", "Verbose with no structure", "Clear and specific", "Only emojis"],
        correct: 2,
        explain: "Specific goals and constraints guide the model.",
        why: "Clarity reduces ambiguity, improving outputs.",
        hints: ["How do you reduce ambiguity?", "What makes instructions easier to follow?"],
      },
      {
        topic: "Tokens",
        prompt: "Tokens are:",
        choices: ["Entire sentences", "Units of text pieces", "Only numbers", "Only images"],
        correct: 1,
        explain: "Models process inputs in token units.",
        why: "Understanding tokens helps estimate context limits.",
        hints: ["Smaller than a word sometimes.", "Models read text in chunks called …?"],
      },
    ],
    options: [
      {
        topic: "Calls",
        prompt: "A call option gives the holder the right to:",
        choices: ["Sell at a strike price", "Buy at a strike price", "Receive dividends", "Own the company"],
        correct: 1,
        explain: "Calls = right to buy; Puts = right to sell.",
        why: "Calls benefit if price goes up above strike.",
        hints: ["Calls and puts are opposites.", "Which one is the right to buy?"],
      },
      {
        topic: "Risk",
        prompt: "Option premiums primarily reflect:",
        choices: ["Company age", "Volatility", "Dividends", "CEO salary"],
        correct: 1,
        explain: "Higher volatility → higher premium.",
        why: "More uncertainty increases the value of optionality.",
        hints: ["What makes outcomes less predictable?", "More price swings mean…"],
      },
    ],
  };
  return base[key] || base.rbc;
}

// ---- helpers ----
function makeInitialSeries(n, seed = 100) {
  let val = seed;
  return Array.from({ length: n }, (_, i) => {
    val = nextVal(val);
    return { x: i, y: val };
  });
}

function nextVal(prev) {
  // random walk with soft boundaries for nicer demo ranges
  const drift = Math.random() * 2 - 1; // -1..1
  const step = drift * 2.2; // scale
  const noise = (Math.random() - 0.5) * 1.3;
  const y = Math.max(40, Math.min(200, prev + step + noise));
  return Math.round(y * 100) / 100;
}

function buildPath(points, width, height) {
  if (!points || points.length === 0) return { path: "", minY: 0, maxY: 0 };
  const minY = Math.min(...points.map((p) => p.y));
  const maxY = Math.max(...points.map((p) => p.y));
  const pad = 12; // padding for top/bottom
  const yScale = (v) => {
    if (maxY === minY) return height / 2;
    const t = (v - minY) / (maxY - minY);
    return height - (pad + t * (height - pad * 2));
  };
  const xScale = (i) => {
    const n = points.length - 1;
    return n === 0 ? 0 : (i / n) * width;
  };
  let d = "";
  points.forEach((p, i) => {
    const x = xScale(i);
    const y = yScale(p.y);
    d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  });
  return { path: d, minY, maxY };
}

function pickWinners(map) {
  let winnerKey = null, loserKey = null;
  let max = -Infinity, min = Infinity;
  for (const [key, series] of Object.entries(map)) {
    if (!series || series.length < 2) continue;
    const first = series[0].y;
    const last = series[series.length - 1].y;
    const pct = first === 0 ? 0 : ((last - first) / first) * 100;
    if (pct > max) { max = pct; winnerKey = key; }
    if (pct < min) { min = pct; loserKey = key; }
  }
  if (!winnerKey) winnerKey = Object.keys(map)[0];
  if (!loserKey) loserKey = Object.keys(map)[1] || winnerKey;
  return { winnerKey, loserKey, winnerPct: max, loserPct: min };
}

function formatPct(p) {
  if (!isFinite(p)) return "0%";
  const sign = p < 0 ? -1 : 1;
  const v = Math.abs(p);
  const str = v >= 10 ? v.toFixed(0) : v.toFixed(1);
  return `${sign < 0 ? "-" : ""}${str}%`;
}

function GuideLines({ minY, maxY, w, h }) {
  const labels = [minY, (minY + maxY) / 2, maxY].map((n) => Math.round(n));
  return (
    <g>
      {labels.map((val, i) => {
        const y = h - ((val - minY) / Math.max(1, maxY - minY)) * (h - 0);
        return (
          <g key={i}>
            <line x1={0} x2={w} y1={y} y2={y} stroke="var(--grid)" strokeWidth={1} />
            <text x={8} y={y - 6} fontSize={12} fill="var(--muted)">{val}</text>
          </g>
        );
      })}
    </g>
  );
}

function StyleTag() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800&display=swap');
      :root {
        --bg: #f7f9fb;
        --card: #ffffff;
        --ink: #0f172a;
        --muted: #6b7280;
        --border: #e5e7eb;
        --grid: #e5e7eb;
        --accent: #22c55e;
        --accent-2: #6366f1;
        --shadow: 0 10px 24px rgba(2, 6, 23, 0.08);
        --radius: 18px;
        --maxw: 100vw;
        --tile-min: 240px;
        --tile-border: rgba(15,23,42,0.06);
        --xp-bg: #e5f9ed;
        --xp-border: #b6f0c9;
        --chip-up-bg: #e7fbe9; --chip-up-fg: #166534; --chip-up-border: #bbf7d0;
        --chip-down-bg: #fee2e2; --chip-down-fg: #7f1d1d; --chip-down-border: #fecaca;
        --topbar-h: 64px;
        --footer-h: 48px;
        --content-pad: clamp(8px, 2.5vw, 20px);
      }
      :root[data-theme="dark"] {
        --bg: #0b1220;
        --card: #0f172a;
        --ink: #e5e7eb;
        --muted: #9aa4b2;
        --border: #1f2937;
        --grid: #243043;
        --accent: #22c55e;
        --accent-2: #818cf8;
        --shadow: 0 10px 26px rgba(0, 0, 0, 0.45);
        --tile-border: rgba(255,255,255,0.08);
        --xp-bg: #09361f; /* deep green */
        --xp-border: #14532d;
        --chip-up-bg: #052e16; --chip-up-fg: #86efac; --chip-up-border: #14532d;
        --chip-down-bg: #2f1414; --chip-down-fg: #fecaca; --chip-down-border: #7f1d1d;
      }

      * { box-sizing: border-box; }
      html, body, #root { height: 100%; }
      body { margin: 0; font-family: 'Nunito', system-ui, -apple-system, Segoe UI, Roboto, sans-serif; background: var(--bg); color: var(--ink); }

      .app-root { display: grid; grid-template-rows: auto 1fr auto; min-height: 100vh; }

      .topbar { position: sticky; top: 0; z-index: 10; display: grid; grid-template-columns: 1fr auto auto; grid-template-areas: "brand xp actions"; gap: clamp(8px, 2vw, 16px); align-items: center; padding: 14px clamp(8px, 3vw, 24px); background: var(--bg); border-bottom: 1px solid var(--border); width: 100vw; }
      .brand { grid-area: brand; display: flex; align-items: center; gap: clamp(8px, 1.5vw, 12px); font-weight: 800; letter-spacing: 0.2px; }
      .back-btn { all: unset; display: grid; place-items: center; width: 36px; height: 36px; border-radius: 10px; margin-right: 6px; cursor: pointer; background: var(--card); color: var(--ink); border: 1px solid var(--border); }
      .back-btn:hover { transform: translateY(-1px); box-shadow: 0 12px 28px rgba(0,0,0,.12); }
      .logo { font-size: clamp(18px, 2.4vw, 22px); }
      .title { font-size: clamp(18px, 2.2vw, 22px); }

      .xp { grid-area: xp; display: grid; gap: 6px; align-items: center; min-width: 180px; justify-self: center; }
      .xp-label { font-size: clamp(10px, 1.4vw, 12px); color: var(--muted); text-align: center; }
      .xp-bar { width: clamp(200px, 50vw, 900px); height: 14px; background: var(--xp-bg); border-radius: 999px; overflow: hidden; border: 1px solid var(--xp-border); margin-inline: auto; }
      .xp-fill { height: 100%; background: linear-gradient(90deg, #16a34a, #22c55e, #86efac); box-shadow: inset 0 0 10px rgba(0,0,0,0.08); transition: width .6s ease; }

      .actions { grid-area: actions; display: flex; gap: 10px; justify-self: end; }
      .icon-btn { width: clamp(38px, 4.2vw, 42px); height: clamp(38px, 4.2vw, 42px); border: 0; border-radius: 50%; background: var(--card); box-shadow: var(--shadow); display: grid; place-items: center; font-size: clamp(16px, 2.2vw, 20px); cursor: pointer; transition: transform .12s ease, box-shadow .12s ease; color: var(--ink); }
      .icon-btn:hover { transform: translateY(-1px); box-shadow: 0 12px 28px rgba(2,6,23,0.12); }
      .icon-btn:active { transform: translateY(0); }
      .icon-btn:focus-visible { outline: 3px solid rgba(99,102,241,.45); outline-offset: 2px; }

      @media (max-width: 700px) {
        .topbar { grid-template-columns: 1fr auto; grid-template-areas: "brand actions" "xp xp"; align-items: start; }
        .xp-bar { width: 100%; }
      }

      .content { width: 100vw; max-width: 100vw; margin: 0; padding: var(--content-pad); display: grid; gap: clamp(14px, 2.5vw, 22px); }

      /* Learning view layout */
      .learn .learn-grid { display: grid; grid-template-columns: minmax(300px, 0.9fr) 1.1fr; gap: clamp(12px, 2.2vw, 18px); align-items: stretch; height: calc(100dvh - var(--topbar-h) - var(--footer-h) - 2 * var(--content-pad)); }
      @media (max-width: 1250px) { .learn .learn-grid { grid-template-columns: 1fr; height: auto; } }

      /* --- Standalone video column (no card), responsive & non-overlapping --- */
      .video-standalone { display: flex; flex-direction: column; gap: 10px; background: transparent; border: 0; box-shadow: none; }
      .video-standalone .video-head { border: 0; padding-inline: 0; }
      .video-standalone .video-wrap { padding: 0; display: flex; justify-content: center; align-items: center; height: auto; }
      .video { display: block; max-width: min(90%, 520px); max-height: 70vh; width: auto; height: auto; aspect-ratio: 9 / 16; object-fit: contain; object-position: center; border-radius: 16px; background: #000; box-shadow: 0 8px 24px rgba(0,0,0,.25); }
      @media (max-width: 640px) { .video { max-width: 92vw; } }

      .video-panel, .qa-panel { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow); overflow: hidden; }
      .video-head { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-bottom: 1px solid var(--border); }
      .video-title { font-weight: 800; }
      .video-wrap { padding: clamp(8px, 1.6vw, 14px); display: grid; place-items: center; height: clamp(420px, 60vh, 900px); }

      .qa-head { display: flex; gap: 8px; align-items: center; padding: 10px 12px; border-bottom: 1px solid var(--border); }
      .badge { background: rgba(99,102,241,0.12); color: var(--ink); border: 1px solid var(--border); border-radius: 999px; padding: 6px 10px; font-size: 12px; font-weight: 800; }
      .badge.secondary { background: rgba(34,197,94,0.12); }

      .qa-panel { display: flex; flex-direction: column; height: 100%; z-index: 2; }
      .qa-head  { flex: 0 0 auto; }
      .qa-card  { flex: 1 1 auto; overflow: auto; padding: clamp(10px, 2vw, 16px); }
      .qa-q { margin: 0; font-size: clamp(16px, 2.2vw, 20px); }
      .qa-choices { display: grid; gap: 10px; }
      .choice { display: grid; grid-template-columns: 18px 1fr; align-items: center; gap: 10px; padding: 10px 12px; border: 1px solid var(--border); border-radius: 14px; cursor: pointer; }
      .choice input { accent-color: #6366f1; }
      .choice.picked { border-color: #6366f1; background: rgba(99,102,241,0.08); }

      .result { padding: 10px 12px; border-radius: 12px; font-weight: 700; }
      .result.ok { background: rgba(34,197,94,0.12); border: 1px solid #14532d; color: #86efac; }
      .result.no { background: rgba(239,68,68,0.12); border: 1px solid #7f1d1d; color: #fecaca; }
      .explain { margin-top: 6px; font-weight: 600; color: var(--muted); }

      .qa-actions { display: flex; gap: 10px; }
      .primary-btn { background: linear-gradient(90deg, #16a34a, #22c55e, #86efac); color: #06210f; border: 0; padding: 10px 14px; border-radius: 12px; font-weight: 800; cursor: pointer; }
      .ghost-btn { background: transparent; color: var(--ink); border: 1px solid var(--border); padding: 10px 14px; border-radius: 12px; font-weight: 800; cursor: pointer; }

      /* --- Responsive tile grid: auto-fit across the full width --- */
      .tile-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(var(--tile-min), 1fr)); gap: clamp(10px, 2vw, 16px); }
      @media (min-width: 1140px) { :root { --tile-min: 300px; } }

      .tile { position: relative; display: grid; align-content: start; gap: 8px; padding: clamp(14px, 2.8vw, 18px); border-radius: var(--radius); border: 2px solid var(--tile-border); box-shadow: var(--shadow); cursor: pointer; text-align: left; transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease; color: var(--ink); }
      .tile:hover { transform: translateY(-2px) rotate(-0.25deg); box-shadow: 0 16px 36px rgba(2,6,23,0.12); }
      .tile.selected { border-color: rgba(99,102,241,0.6); }
      .tile-head { display: flex; align-items: center; gap: 10px; }
      .tile-emoji { font-size: clamp(20px, 2.6vw, 24px); }
      .tile-title { font-weight: 800; font-size: clamp(16px, 2.2vw, 18px); }
      .tile-sub { color: var(--muted); font-size: clamp(12px, 2vw, 14px); }
      .tile-cta { position: absolute; bottom: 12px; right: 16px; font-weight: 800; color: var(--ink); opacity: 0.85; font-size: clamp(12px, 2vw, 14px); }

      .chart-wrap { background: var(--card); border-radius: var(--radius); box-shadow: var(--shadow); border: 1px solid var(--border); padding: clamp(10px, 2vw, 14px); color: var(--ink); }
      .chart-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 6px 8px 10px; }
      .chart-title { font-weight: 800; font-size: clamp(14px, 2.2vw, 18px); }
      .chip { font-size: clamp(11px, 1.8vw, 12px); font-weight: 800; padding: 6px 10px; border-radius: 999px; }
      .chip.up { background: var(--chip-up-bg); color: var(--chip-up-fg); border: 1px solid var(--chip-up-border); }
      .chip.down { background: var(--chip-down-bg); color: var(--chip-down-fg); border: 1px solid var(--chip-down-border); }

      .charts-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: clamp(10px, 2vw, 16px); align-items: stretch; }
      @media (max-width: 900px) { .charts-grid { grid-template-columns: 1fr; } }

      .chart-canvas { width: 100%; height: auto; min-height: 220px; }

      .foot { padding: clamp(12px, 2vw, 18px); text-align: center; color: var(--muted); font-size: 13px; }

      @media (max-width: 360px) { :root { --radius: 14px; } .icon-btn { width: 36px; height: 36px; } }
    `}</style>
  );
}