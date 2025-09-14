import { useState, useEffect } from "react";
import { getLeaderboard } from "../../utils/api";

export default function Leaderboard({ onBack }) {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                setLoading(true);
                const data = await getLeaderboard();
                setLeaderboardData(data);
            } catch (err) {
                setError('Failed to load leaderboard data');
                console.error('Error fetching leaderboard:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    if (loading) {
        return (
            <main className="content">
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div>Loading leaderboard...</div>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="content">
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{ color: 'var(--error)', marginBottom: '1rem' }}>{error}</div>
                    <button className="ghost-btn" onClick={onBack}>
                        ← Back to Dashboard
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="content">
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                    <button className="ghost-btn" onClick={onBack} style={{ marginRight: '1rem' }}>
                        ← Back
                    </button>
                    <h1 style={{ margin: 0, fontSize: 'clamp(24px, 4vw, 32px)' }}>
                        🏆 Leaderboard
                    </h1>
                </div>

                {leaderboardData.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
                        <h3>No players yet!</h3>
                        <p style={{ color: 'var(--muted)' }}>Be the first to complete a quiz and earn points.</p>
                    </div>
                ) : (
                    <div className="leaderboard-container">
                        <div className="leaderboard-header" style={{
                            display: 'grid',
                            gridTemplateColumns: '60px 1fr 120px 120px',
                            gap: '1rem',
                            padding: '1rem',
                            borderBottom: '2px solid var(--border)',
                            fontWeight: 'bold',
                            color: 'var(--muted)'
                        }}>
                            <div>Rank</div>
                            <div>Player</div>
                            <div>Points</div>
                            <div>Coins</div>
                        </div>

                        {leaderboardData.map((user, index) => (
                            <div 
                                key={user._id} 
                                className="leaderboard-row"
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '60px 1fr 120px 120px',
                                    gap: '1rem',
                                    padding: '1rem',
                                    borderBottom: '1px solid var(--border)',
                                    backgroundColor: index < 3 ? 'var(--bg-secondary)' : 'transparent',
                                    borderRadius: index < 3 ? '8px' : '0',
                                    margin: index < 3 ? '0.5rem 0' : '0'
                                }}
                            >
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    fontSize: '1.2rem',
                                    fontWeight: 'bold'
                                }}>
                                    {index === 0 && '🥇'}
                                    {index === 1 && '🥈'}
                                    {index === 2 && '🥉'}
                                    {index > 2 && `#${index + 1}`}
                                </div>
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    fontWeight: index < 3 ? 'bold' : 'normal'
                                }}>
                                    {user.email.split('@')[0]}
                                </div>
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    fontWeight: 'bold',
                                    color: 'var(--primary)'
                                }}>
                                    {user.points} XP
                                </div>
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    color: 'var(--accent)'
                                }}>
                                    🪙 {user.coins}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div style={{ 
                    marginTop: '2rem', 
                    padding: '1rem', 
                    backgroundColor: 'var(--bg-secondary)', 
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>
                        Complete quizzes to earn points and climb the leaderboard! 🚀
                    </p>
                </div>
            </div>
        </main>
    );
}
