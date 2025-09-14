export default function StyleTag() {
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

      .qa-actions { display: flex; gap: 10px; margin-top: 16px; }
      .primary-btn { background: linear-gradient(90deg, #16a34a, #22c55e, #86efac); color: #06210f; border: 0; padding: 10px 14px; border-radius: 12px; font-weight: 800; cursor: pointer; }
      .ghost-btn { background: transparent; color: var(--ink); border: 1px solid var(--border); padding: 10px 14px; border-radius: 12px; font-weight: 800; cursor: pointer; }

      /* --- Redeem Page Styles --- */
      .redeem-header { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
      .redeem-title h1 { margin: 0; font-size: clamp(24px, 4vw, 32px); }
      .redeem-title p { margin: 8px 0 0 0; color: var(--muted); font-size: clamp(14px, 2vw, 16px); }
      
      .redeem-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; }
      
      .redeem-card { 
        background: var(--card-bg); 
        border: 2px solid var(--border); 
        border-radius: 16px; 
        padding: 20px; 
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .redeem-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
      
      .redeem-card-header { display: flex; align-items: center; gap: 12px; }
      .redeem-emoji { font-size: 24px; }
      .redeem-brand { font-weight: 700; font-size: 18px; color: var(--ink); }
      
      .redeem-card-body { flex: 1; }
      .redeem-offer { margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: var(--ink); }
      .redeem-description { margin: 0; color: var(--muted); font-size: 14px; line-height: 1.4; }
      
      .redeem-card-footer { display: flex; justify-content: space-between; align-items: center; }
      .redeem-cost { display: flex; flex-direction: column; gap: 2px; }
      .cost-label { font-size: 12px; color: var(--muted); text-transform: uppercase; font-weight: 600; }
      .cost-value { font-size: 16px; font-weight: 700; color: #f59e0b; }
      
      .redeem-btn { 
        background: linear-gradient(90deg, #3b82f6, #1d4ed8); 
        color: white; 
        border: 0; 
        padding: 10px 16px; 
        border-radius: 8px; 
        font-weight: 700; 
        cursor: pointer;
        transition: opacity 0.2s ease;
      }
      .redeem-btn:hover { opacity: 0.9; }
      .redeem-btn.disabled { 
        background: var(--muted); 
        cursor: not-allowed; 
        opacity: 0.5; 
      }

      /* --- Profile Page Styles --- */
      .profile-header { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
      .profile-title h1 { margin: 0; font-size: clamp(24px, 4vw, 32px); }
      .profile-title p { margin: 8px 0 0 0; color: var(--muted); font-size: clamp(14px, 2vw, 16px); }
      
      .profile-content { display: flex; flex-direction: column; gap: 24px; }
      
      .profile-card { 
        background: var(--card-bg); 
        border: 2px solid var(--border); 
        border-radius: 16px; 
        padding: 24px; 
      }
      .profile-card h3 { margin: 0 0 16px 0; font-size: 18px; color: var(--ink); }
      
      .profile-card-header { display: flex; align-items: center; gap: 20px; }
      .profile-avatar { width: 80px; height: 80px; border-radius: 50%; overflow: hidden; background: var(--border); display: flex; align-items: center; justify-content: center; }
      .avatar-img { width: 100%; height: 100%; object-fit: cover; }
      .avatar-placeholder { font-size: 32px; color: var(--muted); }
      
      .profile-info h2 { margin: 0 0 8px 0; font-size: 24px; color: var(--ink); }
      .profile-email { margin: 4px 0; color: var(--muted); font-size: 16px; }
      .profile-joined { margin: 4px 0 0 0; color: var(--muted); font-size: 14px; }
      
      .profile-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
      .stat-card { 
        background: var(--card-bg); 
        border: 2px solid var(--border); 
        border-radius: 12px; 
        padding: 20px; 
        display: flex; 
        align-items: center; 
        gap: 16px; 
      }
      .stat-icon { font-size: 24px; }
      .stat-value { font-size: 24px; font-weight: 700; color: var(--ink); margin-bottom: 4px; }
      .stat-label { font-size: 14px; color: var(--muted); text-transform: uppercase; font-weight: 600; }
      
      .level-info { display: flex; flex-direction: column; gap: 16px; }
      .level-badge { 
        display: inline-block; 
        padding: 8px 16px; 
        border-radius: 20px; 
        color: white; 
        font-weight: 700; 
        font-size: 14px; 
        text-transform: uppercase; 
        width: fit-content; 
      }
      .level-progress p { margin: 8px 0; color: var(--ink); }
      .progress-bar { 
        width: 100%; 
        height: 8px; 
        background: var(--border); 
        border-radius: 4px; 
        overflow: hidden; 
      }
      .progress-fill { height: 100%; transition: width 0.3s ease; }
      .progress-text { font-size: 14px; color: var(--muted); }
      
      .achievements-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; }
      .achievement-item { 
        display: flex; 
        align-items: center; 
        gap: 12px; 
        padding: 16px; 
        background: rgba(34,197,94,0.1); 
        border: 1px solid rgba(34,197,94,0.3); 
        border-radius: 12px; 
      }
      .achievement-icon { font-size: 24px; }
      .achievement-name { font-weight: 600; color: var(--ink); margin-bottom: 4px; }
      .achievement-desc { font-size: 14px; color: var(--muted); }
      .no-achievements { color: var(--muted); text-align: center; padding: 20px; font-style: italic; }

      /* --- Logo Styles --- */
      .logo { 
        width: 32px; 
        height: 32px; 
        object-fit: contain; 
        border-radius: 4px; 
      }

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
