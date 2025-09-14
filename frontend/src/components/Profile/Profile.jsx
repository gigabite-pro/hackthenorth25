import { useState, useEffect } from "react";
import { getLeaderboard } from "../../utils/api";

export default function Profile({ onBack, user, userPoints, userCoins }) {
    const [userRank, setUserRank] = useState(null);
    const [totalUsers, setTotalUsers] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserRank = async () => {
            if (!user?.email) return;
            
            try {
                const leaderboard = await getLeaderboard();
                const userIndex = leaderboard.findIndex(u => u.email === user.email);
                setUserRank(userIndex >= 0 ? userIndex + 1 : null);
                setTotalUsers(leaderboard.length);
            } catch (error) {
                console.error('Error fetching user rank:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserRank();
    }, [user?.email]);

    const getJoinDate = () => {
        if (user?.sub) {
            // Extract date from Auth0 user creation or use current date
            return new Date().toLocaleDateString('en-CA');
        }
        return new Date().toLocaleDateString('en-CA');
    };

    const getAchievements = () => {
        const achievements = [];
        
        if (userPoints >= 100) achievements.push({ name: "Century Club", icon: "💯", desc: "Earned 100+ points" });
        if (userPoints >= 500) achievements.push({ name: "High Achiever", icon: "🌟", desc: "Earned 500+ points" });
        if (userCoins >= 1000) achievements.push({ name: "Coin Collector", icon: "🪙", desc: "Accumulated 1000+ coins" });
        if (userRank && userRank <= 10) achievements.push({ name: "Top 10", icon: "🏆", desc: "Ranked in top 10" });
        if (userRank === 1) achievements.push({ name: "Champion", icon: "👑", desc: "Rank #1 player" });
        
        return achievements;
    };

    const getProgressLevel = () => {
        if (userPoints >= 1000) return { level: "Expert", color: "#8b5cf6", next: "Master", nextAt: 2000 };
        if (userPoints >= 500) return { level: "Advanced", color: "#3b82f6", next: "Expert", nextAt: 1000 };
        if (userPoints >= 200) return { level: "Intermediate", color: "#10b981", next: "Advanced", nextAt: 500 };
        if (userPoints >= 50) return { level: "Beginner", color: "#f59e0b", next: "Intermediate", nextAt: 200 };
        return { level: "Novice", color: "#6b7280", next: "Beginner", nextAt: 50 };
    };

    const achievements = getAchievements();
    const progress = getProgressLevel();

    return (
        <main className="content">
            <div className="profile-header">
                <button className="ghost-btn" onClick={onBack}>
                    ← Back to Dashboard
                </button>
                <div className="profile-title">
                    <h1>👤 My Profile</h1>
                    <p>Your financial learning journey</p>
                </div>
            </div>

            <div className="profile-content">
                {/* User Info Card */}
                <div className="profile-card">
                    <div className="profile-card-header">
                        <div className="profile-avatar">
                            {user?.picture ? (
                                <img src={user.picture} alt="Profile" className="avatar-img" />
                            ) : (
                                <div className="avatar-placeholder">👤</div>
                            )}
                        </div>
                        <div className="profile-info">
                            <h2>{user?.name || "Anonymous User"}</h2>
                            <p className="profile-email">{user?.email}</p>
                            <p className="profile-joined">Joined: {getJoinDate()}</p>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="profile-stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">📊</div>
                        <div className="stat-info">
                            <div className="stat-value">{userPoints}</div>
                            <div className="stat-label">Total Points</div>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-icon">🪙</div>
                        <div className="stat-info">
                            <div className="stat-value">{userCoins}</div>
                            <div className="stat-label">Coins</div>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-icon">🏆</div>
                        <div className="stat-info">
                            <div className="stat-value">
                                {loading ? "..." : userRank ? `#${userRank}` : "Unranked"}
                            </div>
                            <div className="stat-label">Global Rank</div>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-icon">👥</div>
                        <div className="stat-info">
                            <div className="stat-value">{totalUsers}</div>
                            <div className="stat-label">Total Players</div>
                        </div>
                    </div>
                </div>

                {/* Progress Level */}
                <div className="profile-card">
                    <h3>🎯 Progress Level</h3>
                    <div className="level-info">
                        <div className="level-badge" style={{ backgroundColor: progress.color }}>
                            {progress.level}
                        </div>
                        <div className="level-progress">
                            <p>Next: <strong>{progress.next}</strong> at {progress.nextAt} points</p>
                            <div className="progress-bar">
                                <div 
                                    className="progress-fill" 
                                    style={{ 
                                        width: `${Math.min(100, (userPoints / progress.nextAt) * 100)}%`,
                                        backgroundColor: progress.color 
                                    }}
                                />
                            </div>
                            <p className="progress-text">
                                {progress.nextAt - userPoints > 0 
                                    ? `${progress.nextAt - userPoints} points to next level`
                                    : "Max level achieved!"
                                }
                            </p>
                        </div>
                    </div>
                </div>

                {/* Achievements */}
                <div className="profile-card">
                    <h3>🏅 Achievements</h3>
                    {achievements.length > 0 ? (
                        <div className="achievements-grid">
                            {achievements.map((achievement, index) => (
                                <div key={index} className="achievement-item">
                                    <div className="achievement-icon">{achievement.icon}</div>
                                    <div className="achievement-info">
                                        <div className="achievement-name">{achievement.name}</div>
                                        <div className="achievement-desc">{achievement.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-achievements">
                            Keep learning to unlock achievements! 🌟
                        </p>
                    )}
                </div>
            </div>
        </main>
    );
}
