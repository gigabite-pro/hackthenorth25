import "./App.css";
import { useEffect, useMemo, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

// Components
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import LearningView from "./components/Learning";
import { StyleTag } from "./components/UI";

// Utils
import { makeInitialSeries, nextVal, pickWinners } from "./utils/chartHelpers";

export default function App() {
    const { user, isAuthenticated } = useAuth0();
    // --- Theme (dark / light) ---
    const getPreferred = () => (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
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

    const onTileClick = (m) => setRoute({ view: "learn", moduleKey: m.key });

    // Show login message if not authenticated
    if (!isAuthenticated) {
        return (
            <div className="app-root">
                <StyleTag />
                <Header theme={theme} setTheme={setTheme} route={route} setRoute={setRoute} xp={0} xpGoal={xpGoal} user={null} isAuthenticated={false} />

                <main className="content" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center", gap: "1.5rem" }}>
                    <div style={{ fontSize: "3rem" }}>🔒</div>
                    <h2 style={{ margin: 0, fontSize: "clamp(24px, 4vw, 32px)" }}>Authentication Required</h2>
                    <p style={{ color: "var(--muted)", fontSize: "clamp(16px, 2.5vw, 18px)", maxWidth: "500px", lineHeight: 1.6 }}>
                        Please log in to access your personalized learning dashboard, track your progress, and take interactive quizzes.
                    </p>
                    <button className="primary-btn" style={{ padding: "12px 24px", fontSize: "16px", marginTop: "1rem" }} onClick={() => window.location.reload()}>
                        Refresh to Login
                    </button>
                </main>

                <footer className="foot">
                    <span>Built for Hack The North • Demo UI</span>
                </footer>
            </div>
        );
    }

    return (
        <div className="app-root">
            <StyleTag />

            <Header theme={theme} setTheme={setTheme} route={route} setRoute={setRoute} xp={xp} xpGoal={xpGoal} user={user} isAuthenticated={isAuthenticated} />

            {route.view === "dashboard" ? (
                <Dashboard modules={modules} theme={theme} onTileClick={onTileClick} seriesMap={seriesMap} winnerKey={winnerKey} loserKey={loserKey} winnerPct={winnerPct} loserPct={loserPct} />
            ) : (
                <LearningView module={modules.find((m) => m.key === route.moduleKey) ?? modules[0]} onBack={() => setRoute({ view: "dashboard", moduleKey: null })} />
            )}

            <footer className="foot">
                <span>Built for Hack The North • Demo UI</span>
            </footer>
        </div>
    );
}
