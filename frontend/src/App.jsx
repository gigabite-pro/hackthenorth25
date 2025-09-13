import { useEffect, useMemo, useRef, useState } from "react";

// Duolingo-inspired dashboard. Now streams TWO charts side-by-side:
// 1) Biggest Winner (highest % gain over the current window)
// 2) Biggest Loser (lowest % change over the current window)
// The tile click still selects a module (for UI), but all modules stream so
// winners/losers update automatically.

export default function App() {
  // --- XP state (demo) ---
  const [xp, setXp] = useState(420);
  const xpGoal = 1000;
  const xpPct = Math.min(100, Math.round((xp / xpGoal) * 100));

  // --- Modules (tiles) ---
  const modules = [
    { id: 1, key: "rbc", title: "RBC InvestEase", subtitle: "Index Fund Basics", color: "#FDE68A" },
    { id: 2, key: "cohere", title: "Cohere Coach", subtitle: "AI Chat Tutor", color: "#A7F3D0" },
    { id: 3, key: "options", title: "Options 101", subtitle: "Risk & Reward", color: "#93C5FD" },
  ];

  // --- Series store per module ---
  const POINTS = 160; // samples kept in memory per module
  const seeds = { rbc: 100, cohere: 120, options: 80 };
  const [activeId, setActiveId] = useState(1);

  const [seriesMap, setSeriesMap] = useState(() => {
    const init = {};
    for (const m of modules) init[m.key] = makeInitialSeries(POINTS, seeds[m.key]);
    return init;
  });

  // Simulate realtime updates for ALL modules (so winner/loser can change)
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

  return (
    <div className="app-root">
      <StyleTag />
      <header className="topbar">
        <div className="brand">
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
          <button className="icon-btn" aria-label="Leaderboard"><span>🏆</span></button>
          <button className="icon-btn" aria-label="Profile"><span>👤</span></button>
        </div>
      </header>

      <main className="content">
        {/* Tiles grid */}
        <section className="tile-grid" aria-label="Learning modules">
          {modules.map((m) => (
            <button
              key={m.id}
              className={`tile ${activeId === m.id ? "selected" : ""}`}
              style={{ backgroundColor: m.color }}
              onClick={() => setActiveId(m.id)}
              aria-pressed={activeId === m.id}
            >
              <div className="tile-head">
                <span className="tile-emoji" aria-hidden>📚</span>
                <span className="tile-title">{m.title}</span>
              </div>
              <div className="tile-sub">{m.subtitle}</div>
              <div className="tile-cta">{activeId === m.id ? "Selected" : "Start →"}</div>
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

  const goingUp = lastDelta >= 0;

  // responsive sizing per panel
  const ref = useRef(null);
  const [size, setSize] = useState({ w: 900, h: 300 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        // aim for 16:9 but responsive
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
  // Fallbacks in case data missing
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
            <line x1={0} x2={w} y1={y} y2={y} stroke="#e5e7eb" strokeWidth={1} />
            <text x={8} y={y - 6} fontSize={12} fill="#6b7280">{val}</text>
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
        --accent: #22c55e; /* green */
        --accent-2: #6366f1; /* indigo */
        --shadow: 0 10px 24px rgba(2, 6, 23, 0.08);
        --radius: 18px;
        --maxw: 100vw;
        --tile-min: 240px;
      }
      * { box-sizing: border-box; }
      html, body, #root { height: 100%; }
      body { margin: 0; font-family: 'Nunito', system-ui, -apple-system, Segoe UI, Roboto, sans-serif; background: var(--bg); color: var(--ink); }

      .app-root { display: grid; grid-template-rows: auto 1fr auto; min-height: 100vh; }

      /* --- Top bar becomes two rows on small screens --- */
      .topbar { position: sticky; top: 0; z-index: 10; display: grid; grid-template-columns: 1fr auto auto; grid-template-areas: "brand xp actions"; gap: clamp(8px, 2vw, 16px); align-items: center; padding: 14px clamp(8px, 3vw, 24px); background: var(--bg); border-bottom: 1px solid #e5e7eb; width: 100vw; }
      .brand { grid-area: brand; display: flex; align-items: center; gap: clamp(8px, 1.5vw, 12px); font-weight: 800; letter-spacing: 0.2px; }
      .logo { font-size: clamp(18px, 2.4vw, 22px); }
      .title { font-size: clamp(18px, 2.2vw, 22px); }

      .xp { grid-area: xp; display: grid; gap: 6px; align-items: center; min-width: 180px; justify-self: center; }
      .xp-label { font-size: clamp(10px, 1.4vw, 12px); color: var(--muted); text-align: center; }
      .xp-bar { width: clamp(200px, 50vw, 900px); height: 14px; background: #e5f9ed; border-radius: 999px; overflow: hidden; border: 1px solid #b6f0c9; margin-inline: auto; }
      .xp-fill { height: 100%; background: linear-gradient(90deg, #16a34a, #22c55e, #86efac); box-shadow: inset 0 0 10px rgba(0,0,0,0.08); transition: width .6s ease; }

      .actions { grid-area: actions; display: flex; gap: 10px; justify-self: end; }
      .icon-btn { width: clamp(38px, 4.2vw, 42px); height: clamp(38px, 4.2vw, 42px); border: 0; border-radius: 50%; background: var(--card); box-shadow: var(--shadow); display: grid; place-items: center; font-size: clamp(16px, 2.2vw, 20px); cursor: pointer; transition: transform .12s ease, box-shadow .12s ease; }
      .icon-btn:hover { transform: translateY(-1px); box-shadow: 0 12px 28px rgba(2,6,23,0.12); }
      .icon-btn:active { transform: translateY(0); }
      .icon-btn:focus-visible { outline: 3px solid rgba(99,102,241,.45); outline-offset: 2px; }

      /* Stack layout on small screens */
      @media (max-width: 700px) {
        .topbar { grid-template-columns: 1fr auto; grid-template-areas: "brand actions" 
 "xp xp"; align-items: start; }
        .xp-bar { width: 100%; }
      }

      /* FULL-BLEED CONTENT */
      .content { width: 100vw; max-width: 100vw; margin: 0; padding: clamp(8px, 2.5vw, 20px); display: grid; gap: clamp(14px, 2.5vw, 22px); }

      /* --- Responsive tile grid: auto-fit across the full width --- */
      .tile-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(var(--tile-min), 1fr)); gap: clamp(10px, 2vw, 16px); }

      @media (min-width: 1140px) {
        :root { --tile-min: 300px; }
      }

      .tile { position: relative; display: grid; align-content: start; gap: 8px; padding: clamp(14px, 2.8vw, 18px); border-radius: var(--radius); border: 2px solid rgba(15,23,42,0.06); box-shadow: var(--shadow); cursor: pointer; text-align: left; transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease; }
      .tile:hover { transform: translateY(-2px) rotate(-0.25deg); box-shadow: 0 16px 36px rgba(2,6,23,0.12); }
      .tile.selected { border-color: rgba(99,102,241,0.6); }
      .tile-head { display: flex; align-items: center; gap: 10px; }
      .tile-emoji { font-size: clamp(20px, 2.6vw, 24px); }
      .tile-title { font-weight: 800; font-size: clamp(16px, 2.2vw, 18px); }
      .tile-sub { color: #334155; font-size: clamp(12px, 2vw, 14px); }
      .tile-cta { position: absolute; bottom: 12px; right: 16px; font-weight: 800; color: #111827; opacity: 0.8; font-size: clamp(12px, 2vw, 14px); }

      .chart-wrap { background: var(--card); border-radius: var(--radius); box-shadow: var(--shadow); border: 1px solid #e5e7eb; padding: clamp(10px, 2vw, 14px); }
      .chart-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 6px 8px 10px; }
      .chart-title { font-weight: 800; font-size: clamp(14px, 2.2vw, 18px); }
      .chip { font-size: clamp(11px, 1.8vw, 12px); font-weight: 800; padding: 6px 10px; border-radius: 999px; }
      .chip.up { background: #e7fbe9; color: #166534; border: 1px solid #bbf7d0; }
      .chip.down { background: #fee2e2; color: #7f1d1d; border: 1px solid #fecaca; }

      /* Dual charts grid */
      .charts-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: clamp(10px, 2vw, 16px); align-items: stretch; }
      @media (max-width: 900px) { .charts-grid { grid-template-columns: 1fr; } }

      /* Chart canvas scales per panel */
      .chart-canvas { width: 100%; height: auto; min-height: 220px; }

      .foot { padding: clamp(12px, 2vw, 18px); text-align: center; color: var(--muted); font-size: 13px; }

      /* Extremely narrow devices */
      @media (max-width: 360px) {
        :root { --radius: 14px; }
        .icon-btn { width: 36px; height: 36px; }
      }
    `}</style>
  );
}
