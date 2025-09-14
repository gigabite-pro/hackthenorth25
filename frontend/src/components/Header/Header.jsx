import { useAuth0 } from "@auth0/auth0-react";

export default function Header({ theme, setTheme, route, setRoute, xp, xpGoal, user, isAuthenticated }) {
    const { loginWithRedirect, logout } = useAuth0();
    const xpPct = Math.min(100, Math.round((xp / xpGoal) * 100));

    return (
        <header className="topbar">
            <div className="brand">
                {route.view === "learn" && (
                    <button 
                        className="back-btn" 
                        onClick={() => setRoute({ view: "dashboard", moduleKey: null })} 
                        aria-label="Back to dashboard"
                    >
                        ←
                    </button>
                )}
                <span className="logo" aria-hidden>
                    🪙
                </span>
                <span className="title">
                    {user ? "Hi " + user.name + "" : "Crocodilo Financilo"}
                </span>
                <div>
                    {isAuthenticated && (
                        <button className="login" onClick={() => logout()}>
                            Logout
                        </button>
                    )}
                    {!isAuthenticated && (
                        <button className="login" onClick={() => loginWithRedirect()}>
                            Login
                        </button>
                    )}
                </div>
            </div>

            <div className="xp">
                <div className="xp-label" aria-live="polite">
                    XP {xp}/{xpGoal}
                </div>
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
                <button className="icon-btn" aria-label="Leaderboard">
                    <span>🏆</span>
                </button>
                <button className="icon-btn" aria-label="Profile">
                    <span>👤</span>
                </button>
            </div>
        </header>
    );
}
