import "./App.css";
import { useEffect, useMemo, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

// Components
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import LearningView from "./components/Learning";
import Leaderboard from "./components/Leaderboard";
import Redeem from "./components/Redeem";
import Profile from "./components/Profile";
import { StyleTag } from "./components/UI";
import htnLogo from "./assets/htn_logo.png";

// Utils
import { makeInitialSeries, nextVal, pickWinners } from "./utils/chartHelpers";
import { createUser, getUserByEmail, updateUserPoints, deductCoins, addCoins } from "./utils/api";

export default function App() {
    const { user, isAuthenticated, loginWithRedirect } = useAuth0();
    // --- Theme (dark / light) ---
    const getPreferred = () => (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const [theme, setTheme] = useState(() => localStorage.getItem("theme") || getPreferred());
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    // --- Simple route: 'dashboard' | 'learn' | 'leaderboard' ---
    const [route, setRoute] = useState({ view: "dashboard", moduleKey: null });

    // --- User points and coins state ---
    const [userPoints, setUserPoints] = useState(0);
    const [userCoins, setUserCoins] = useState(1000);
    const xpGoal = 1000;

    // --- Modules (tiles) with coin costs and rewards ---
    const modules = [
        {
            id: 1,
            key: "budgeting",
            title: "The Art of Budgeting",
            subtitle: "Master Your Money",
            bgLight: "#FDE68A",
            bgDark: "#3a2e00",
            video: "/src/assets/vid1.mp4",
            costCoins: 50,
            rewardCoins: 100,
        },
        { id: 2, key: "credit", title: "The Credit Score Game", subtitle: "Build Your Score", bgLight: "#A7F3D0", bgDark: "#0b3b2e", video: "/src/assets/vid2.mp4", costCoins: 75, rewardCoins: 150 },
        { id: 3, key: "stocks", title: "The Stock Market", subtitle: "Invest Like a Pro", bgLight: "#93C5FD", bgDark: "#0f2553", video: "/src/assets/vid1.mp4", costCoins: 100, rewardCoins: 200 },
    ];

    // --- Series store per module ---
    const POINTS = 160; // samples kept in memory per module
    const seeds = { budgeting: 100, credit: 120, stocks: 80 };

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
        }, 900);
        return () => clearInterval(id);
    }, []);

    // Handle user authentication and database operations
    useEffect(() => {
        if (isAuthenticated && user?.email) {
            handleUserLogin(user.email);
        }
    }, [isAuthenticated, user]);

    const handleUserLogin = async (email) => {
        try {
            // Try to get existing user
            let userData = await getUserByEmail(email);

            // If user doesn't exist, create them
            if (!userData) {
                userData = await createUser(email);
            }

            setUserPoints(userData.points || 0);
            setUserCoins(userData.coins || 1000);
        } catch (error) {
            console.error("Error handling user login:", error);
            setUserPoints(0);
            setUserCoins(1000);
        }
    };

    const handleQuizStart = async (moduleKey) => {
        if (!user?.email) return false;

        const module = modules.find((m) => m.key === moduleKey);
        if (!module) return false;

        if (userCoins < module.costCoins) {
            alert(`Insufficient coins! You need ${module.costCoins} coins but only have ${userCoins}.`);
            return false;
        }

        try {
            const updatedUser = await deductCoins(user.email, module.costCoins);
            setUserCoins(updatedUser.coins);
            return true;
        } catch (error) {
            console.error("Error deducting coins:", error);
            return false;
        }
    };

    const handleQuizComplete = async (moduleKey, finalScore = 0) => {
        const module = modules.find((m) => m.key === moduleKey);
        if (!module) return;

        // Use the calculated final score from the quiz (can be negative)
        const newPoints = Math.max(0, userPoints + finalScore); // Prevent negative total points

        try {
            // Update points (can be negative change) and add coins only if score is positive
            await updateUserPoints(user.email, newPoints);

            // Only award coins if the final score is positive
            if (finalScore > 0) {
                const updatedUser = await addCoins(user.email, module.rewardCoins);
                setUserCoins(updatedUser.coins);
            }

            setUserPoints(newPoints);
        } catch (error) {
            console.error("Error updating user rewards:", error);
        }
    };

    const handleRedeemSuccess = async (coinCost) => {
        try {
            const updatedUser = await deductCoins(user.email, coinCost);
            setUserCoins(updatedUser.coins);
        } catch (error) {
            console.error("Error deducting coins for redemption:", error);
        }
    };

    const onTileClick = async (m) => {
        const canStart = await handleQuizStart(m.key);
        if (canStart) {
            setRoute({ view: "learn", moduleKey: m.key });
        }
    };

    // Show login message if not authenticated
    if (!isAuthenticated) {
        return (
            <div className="app-root">
                <StyleTag />
                <Header theme={theme} setTheme={setTheme} route={route} setRoute={setRoute} xp={0} xpGoal={xpGoal} user={null} isAuthenticated={false} />

                <main className="content" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center", gap: "1.5rem" }}>
                    <img src={htnLogo} alt="HTN Logo" style={{ width: "500px", height: "500px", objectFit: "contain" }} />
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                        <h2 style={{ margin: 0, fontSize: "clamp(24px, 4vw, 32px)" }}>Authentication Required</h2>
                        <p style={{ color: "var(--muted)", fontSize: "clamp(16px, 2.5vw, 18px)", maxWidth: "500px", lineHeight: 1.6, margin: 0 }}>
                            Please log in to access your personalized learning dashboard, track your progress, and take interactive quizzes.
                        </p>
                        <button className="primary-btn" style={{ padding: "12px 24px", fontSize: "16px", marginTop: "0.5rem" }} onClick={() => loginWithRedirect()}>
                            Login
                        </button>
                    </div>
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

            <Header theme={theme} setTheme={setTheme} route={route} setRoute={setRoute} xp={userPoints} xpGoal={xpGoal} user={user} isAuthenticated={isAuthenticated} coins={userCoins} />

            {route.view === "dashboard" ? (
                <Dashboard modules={modules} theme={theme} onTileClick={onTileClick} seriesMap={seriesMap} />
            ) : route.view === "leaderboard" ? (
                <Leaderboard onBack={() => setRoute({ view: "dashboard", moduleKey: null })} />
            ) : route.view === "redeem" ? (
                <Redeem onBack={() => setRoute({ view: "dashboard", moduleKey: null })} userCoins={userCoins} onRedeemSuccess={handleRedeemSuccess} />
            ) : route.view === "profile" ? (
                <Profile onBack={() => setRoute({ view: "dashboard", moduleKey: null })} user={user} userPoints={userPoints} userCoins={userCoins} />
            ) : (
                <LearningView
                    module={modules.find((m) => m.key === route.moduleKey) ?? modules[0]}
                    onBack={() => setRoute({ view: "dashboard", moduleKey: null })}
                    onQuizComplete={(finalScore) => handleQuizComplete(route.moduleKey, finalScore)}
                />
            )}

            <footer className="foot">
                <span>Built for Hack The North • Demo UI</span>
            </footer>
        </div>
    );
}
