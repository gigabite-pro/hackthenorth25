import { useState, useEffect } from "react";
import { getQuestionBank } from "../../utils/questionBank";

export default function LearningView({ module, onBack, onQuizComplete }) {
    const [bank, setBank] = useState([]);
    const [loading, setLoading] = useState(true);
    const [idx, setIdx] = useState(0);
    const [choice, setChoice] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [wrongAnswers, setWrongAnswers] = useState(0);

    // Load questions asynchronously
    useEffect(() => {
        async function loadQuestions() {
            setLoading(true);
            try {
                const questions = await getQuestionBank(module.key);
                setBank(questions || []);
            } catch (error) {
                console.error("Failed to load questions:", error);
                setBank([]);
            } finally {
                setLoading(false);
            }
        }
        loadQuestions();
    }, [module.key]);

    useEffect(() => {
        setChoice(null);
        setSubmitted(false);
        setAttempts(0);
    }, [idx, module.key]);

    useEffect(() => {
        // Reset counters when module changes
        setCorrectAnswers(0);
        setWrongAnswers(0);
    }, [module.key]);

    // Handle loading and empty states
    if (loading) {
        return (
            <main className="learn content">
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div>Loading questions...</div>
                </div>
            </main>
        );
    }

    if (!bank || bank.length === 0) {
        return (
            <main className="learn content">
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div>No questions available for this module.</div>
                    <button className="ghost-btn" onClick={onBack} style={{ marginTop: '1rem' }}>
                        ← Back
                    </button>
                </div>
            </main>
        );
    }

    const q = bank[idx];
    const correct = submitted && choice === q?.correct;

    return (
        <main className="learn content">
            <section className="learn-grid" aria-label="Learning page">
                {/* Left: Brainrot video player */}
                <div className="video-panel">
                    <div className="video-head">
                        <button className="ghost-btn" onClick={onBack}>
                            ← Back
                        </button>
                        <div className="video-title">{module.title} • Brainrot Player</div>
                    </div>
                    <div className="video-wrap">
                        <video 
                            key={module.key} 
                            controls 
                            playsInline 
                            className="video" 
                            poster="" 
                            src={module.video} 
                        />
                    </div>
                </div>

                {/* Right: Questions */}
                <div className="qa-panel">
                    <div className="qa-head">
                        <div className="badge">
                            Question {idx + 1} / {bank.length}
                        </div>
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
                                ❌ Wrong answer! -10 points deducted.
                                <div className="explain">
                                    {q.why || q.explain || "The correct answer was: " + q.choices[q.correct]}
                                </div>
                            </div>
                        )}

                        {submitted && correct && (
                            <div className="result ok">
                                ✅ Correct! +10 points earned.
                                <div className="explain">{q.why || q.explain || "Nice work — that's the key idea."}</div>
                            </div>
                        )}

                        <div className="qa-actions">
                            <button
                                className="primary-btn"
                                onClick={() => {
                                    if (!submitted) {
                                        setSubmitted(true);
                                        // Track correct/wrong answers for final scoring
                                        if (choice === q.correct) {
                                            setCorrectAnswers(prev => prev + 1);
                                        } else {
                                            setWrongAnswers(prev => prev + 1);
                                        }
                                    } else if (idx < bank.length - 1) {
                                        setIdx((i) => Math.min(i + 1, bank.length - 1));
                                        setSubmitted(false);
                                        setChoice(null);
                                        setAttempts(0);
                                    } else {
                                        // Done button pressed - calculate final score and complete quiz
                                        const finalScore = correctAnswers * 10 - wrongAnswers * 10;
                                        if (onQuizComplete) {
                                            onQuizComplete(finalScore);
                                        }
                                        onBack();
                                    }
                                }}
                                disabled={choice === null && !submitted}
                            >
                                {!submitted ? "Check" : idx < bank.length - 1 ? "Next" : "Done"}
                            </button>
                            <button className="ghost-btn" onClick={() => setIdx(0)}>
                                Restart
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
