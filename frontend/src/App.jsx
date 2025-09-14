
import { useEffect, useMemo, useRef, useState } from "react";

// --- Configuration ---
const COHERE_API_KEY = import.meta.env.VITE_COHERE_API_KEY;
// --- Module Data ---
const modulesData = [
  { 
    id: 1, 
    key: "rbc", 
    title: "The Art of Budgeting", 
    subtitle: "50/30/20 Rule", 
    color: "#FDE68A",
    videoUrl: "https://www.youtube.com/embed/S_n-uxb6o3I",
    transcript: "This module explains the 50/30/20 rule. It is a simple budgeting framework where you allocate 50% of your after-tax income to Needs, 30% to Wants, and 20% to Savings. Needs are essential expenses like rent and groceries. Wants are non-essential lifestyle expenses like dining out or hobbies. Savings includes debt repayment and investments."
  },
  { 
    id: 2, 
    key: "cohere", 
    title: "Credit Score 101", 
    subtitle: "Your Financial Report Card", 
    color: "#A7F3D0",
    videoUrl: "https://www.youtube.com/embed/d_q-s_43_9k",
    transcript: "A credit score is a number between 300-900 that represents your creditworthiness. The single most important factor is paying bills on time. Keeping credit card balances low is also crucial. A good score makes it easier to get loans for cars or homes. A student credit card, used for small purchases and paid off in full each month, is a great way to build credit history." 
  },
  { 
    id: 3, 
    key: "options", 
    title: "Nonna's Mortgage Sauce", 
    subtitle: "Understanding Mortgages", 
    color: "#93C5FD",
    videoUrl: "https://www.youtube.com/embed/7PM4r_3yS_A",
    transcript: "A mortgage is a loan to buy a house. The DOWN PAYMENT is the money you bring yourself. The MORTGAGE is the large loan from the bank. INTEREST is the extra you pay the bank for the loan. AMORTIZATION is the long process of paying it off, where at first most of your payment goes to interest, but over time, more goes to paying down the loan itself, building your equity."
  },
];

// --- Live Cohere API Call (Updated for Duolingo-style sessions) ---
const callCohereApiForSession = async (transcript, apiKey) => {
  if (!apiKey || apiKey === "YOUR_COHERE_API_KEY") {
    throw new Error("Cohere API key is missing.");
  }

  const prompt = `
    You are an expert instructional designer creating engaging, Duolingo-style learning sessions.
    Based on the following module transcript, generate a JSON object for a full learning session.

    TRANSCRIPT: """
    ${transcript}
    """

    The JSON object MUST have a "sessionTitle" (string) and a "challenges" key, which is an array of 2 to 4 varied simulation objects.
    Each object in the "challenges" array MUST conform to one of the following schemas:

    SCHEMA 'quiz':
    - simulationType: "quiz"
    - questions: an array of objects, where EACH question object MUST have:
      - "text": string (The question itself)
      - "options": an array of 4 strings (The multiple choice answers)
      - "correctAnswer": a string that exactly matches one of the 'options'

    SCHEMA 'scenario': 
    - simulationType: "scenario"
    - title: string
    - description: string
    - choices: an array of objects with { "text", "outcome", "xp" }

    SCHEMA 'calculator': 
    - simulationType: "calculator"
    - title: string
    - description: string
    - inputs: an array of objects with { "id", "label", "type", "value" }
    - outputs: an array of objects with { "id", "label", "formula" }

    Generate a variety of challenge types to test the user in different ways.
    IMPORTANT: Only return the raw JSON object. Do not include any text or markdown formatting.
  `;

  const response = await fetch("https://api.cohere.ai/v1/chat", {
    method: "POST", headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "command-r", message: prompt, temperature: 0.5 }),
  });

  if (!response.ok) { const errorBody = await response.text(); throw new Error(`Cohere API error (${response.status}): ${errorBody}`); }
  const data = await response.json();
  const generatedText = data.text;
  try {
    const jsonMatch = generatedText.match(/{[\s\S]*}/);
    if (jsonMatch && jsonMatch[0]) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.challenges && Array.isArray(parsed.challenges)) {
            return parsed;
        }
    }
    throw new Error("Response did not match the expected session format.");
  } catch (error) {
      console.error("Raw text from Cohere:", generatedText);
      console.error("Parsing Error:", error);
      throw new Error("The session data returned was not valid JSON.");
  }
};

export default function App() {
  const [xp, setXp] = useState(420);
  const xpGoal = 1000;
  const xpPct = Math.min(100, Math.round((xp / xpGoal) * 100));
  const [activeModule, setActiveModule] = useState(null);
  const POINTS = 160;
  const seeds = { rbc: 100, cohere: 120, options: 80 };
  const [seriesMap, setSeriesMap] = useState(() => { const init = {}; for (const m of modulesData) init[m.key] = makeInitialSeries(POINTS, seeds[m.key]); return init; });
  useEffect(() => { const id = setInterval(() => { setSeriesMap((prev) => { const map = { ...prev }; for (const key of Object.keys(map)) { const prevSeries = map[key]; const last = prevSeries[prevSeries.length - 1]; const y = nextVal(last.y); map[key] = [...prevSeries.slice(1), { x: last.x + 1, y }]; } return map; }); if (!activeModule) { setXp((v) => (v < xpGoal ? Math.min(xpGoal, v + Math.floor(Math.random() * 4)) : v)); } }, 900); return () => clearInterval(id); }, [activeModule]);
  const { winnerKey, loserKey, winnerPct, loserPct } = useMemo(() => pickWinners(seriesMap), [seriesMap]);
  const winnerModule = modulesData.find((m) => m.key === winnerKey) ?? modulesData[0];
  const loserModule = modulesData.find((m) => m.key === loserKey) ?? modulesData[1] ?? modulesData[0];
  const handleModuleComplete = (awardedXp) => { setXp(prev => Math.min(xpGoal, prev + awardedXp)); setActiveModule(null); };
  
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
        <section className="tile-grid" aria-label="Learning modules">
          {modulesData.map((m) => (
            <button
              key={m.id}
              className="tile"
              style={{ backgroundColor: m.color }}
              onClick={() => setActiveModule(m)}
            >
              <div className="tile-head">
                <span className="tile-emoji" aria-hidden>📚</span>
                <span className="tile-title">{m.title}</span>
              </div>
              <div className="tile-sub">{m.subtitle}</div>
              <div className="tile-cta">{"Start →"}</div>
            </button>
          ))}
        </section>

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
        <span>Built for the RBC Challenge</span>
      </footer>
      {activeModule && <LearningModal module={activeModule} onClose={() => setActiveModule(null)} onComplete={handleModuleComplete} />}
    </div>
  );
}

function LearningModal({ module, onClose, onComplete }) { 
    const [step, setStep] = useState("video"); 
    return ( 
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose} aria-label="Close module">×</button>
                <div className="modal-header">
                    <h2 className="modal-title">{module.title}</h2>
                    <p className="modal-subtitle">{module.subtitle}</p>
                </div>
                <div className="modal-body">
                    {step === 'video' && <VideoStep module={module} onNext={() => setStep('simulation')} />}
                    {step === 'simulation' && <CohereSimulationContainer module={module} onComplete={onComplete} />}
                </div>
            </div>
        </div> 
    ); 
}

function VideoStep({ module, onNext }) { 
    return ( 
        <div className="step-container">
            <h3>Step 1: Watch & Learn</h3>
            <div className="video-wrapper">
                <iframe 
                    width="560" height="315" 
                    src={module.videoUrl} 
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen>
                </iframe>
            </div>
            <button className="modal-cta-btn" onClick={onNext}>I'm ready for the challenge! →</button>
        </div> 
    ); 
}

function CohereSimulationContainer({ module, onComplete }) {
  const [sessionData, setSessionData] = useState(null);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    callCohereApiForSession(module.transcript, COHERE_API_KEY).then(data => {
        console.log("Received session data:", data);
        setSessionData(data);
        setIsLoading(false);
    }).catch(err => {
        console.error(err);
        setError(err.message || "Could not generate session.");
        setIsLoading(false);
    });
  }, [module.transcript]);

  const handleStepComplete = (xpFromStep) => {
    setTotalXp(prev => prev + xpFromStep);
    if (challengeIndex < sessionData.challenges.length - 1) {
        setChallengeIndex(prev => prev + 1);
    } else {
        onComplete(totalXp + xpFromStep);
    }
  };

  if (isLoading) return <div className="loading-spinner"><div></div><p>Building Your Lesson...</p></div>;
  if (error) return <p className="error-message">{error}</p>;
  if (!sessionData) return null;

  const currentChallenge = sessionData.challenges[challengeIndex];
  const progressPct = ((challengeIndex + 1) / sessionData.challenges.length) * 100;
  
  const renderChallenge = () => {
    switch (currentChallenge.simulationType) {
        case 'calculator': return <CalculatorSimulation data={currentChallenge} onStepComplete={handleStepComplete} />;
        case 'quiz': return <QuizSimulation data={currentChallenge} onStepComplete={handleStepComplete} />;
        case 'scenario': return <ScenarioSimulation data={currentChallenge} onStepComplete={handleStepComplete} />;
        default: return <p>Unknown challenge type.</p>;
    }
  };

  return (
    <div className="step-container">
        <div className="session-progress-tracker">
            <div className="session-progress-bar" style={{width: `${progressPct}%`}} />
        </div>
        <h3>{sessionData.sessionTitle}</h3>
        {renderChallenge()}
    </div>
  );
}


function CalculatorSimulation({ data, onStepComplete }) {
  const initialValues = useMemo(() => { const state = {}; data.inputs.forEach(input => state[input.id] = input.value); return state; }, [data.inputs]);
  const [values, setValues] = useState(initialValues);
  const handleInputChange = (id, value) => setValues(prev => ({ ...prev, [id]: Number(value) }));
  const income = values.income || 1; const needs = values.needs || 0; const wants = values.wants || 0;
  const needsPct = Math.round((needs / income) * 100); const wantsPct = Math.round((wants / income) * 100); const savingsPct = Math.max(0, 100 - needsPct - wantsPct);
  const getFeedback = () => { if (savingsPct >= 18 && savingsPct <= 22) return "Perfect balance! 🏆"; if (savingsPct < 10) return "Good start! Trim some 'Wants' to boost savings."; if (savingsPct > 25) return "Amazing saver! 🔥"; return "Aim for 20% savings."; };
  
  if (!data || !Array.isArray(data.inputs)) {
    return <p>Loading calculator...</p>;
  }

  return ( <div className="sim-container calculator-sim"><h4>{data.title}</h4><p>{data.description}</p><div className="calculator-inputs">{data.inputs.map(input => ( <div key={input.id} className="input-group"><label htmlFor={input.id}>{input.label}: ${values[input.id]}</label><input id={input.id} type="range" value={values[input.id]} onChange={e => handleInputChange(input.id, e.target.value)} max={input.max || income} min={0} /></div> ))}</div><div className="calculator-results"><h4>Your Results:</h4><div className="result-bar"><div className="bar-segment needs" style={{width: `${needsPct}%`}}><span>Needs {needsPct}%</span></div><div className="bar-segment wants" style={{width: `${wantsPct}%`}}><span>Wants {wantsPct}%</span></div><div className="bar-segment savings" style={{width: `${savingsPct}%`}}><span>Savings {savingsPct}%</span></div></div><p className="feedback-text">{getFeedback()}</p></div><button className="modal-cta-btn" onClick={() => onStepComplete(50)}>Continue</button></div> );
}

function QuizSimulation({ data, onStepComplete }) {
  const [qIndex, setQIndex] = useState(0); const [score, setScore] = useState(0); const [selection, setSelection] = useState({ answer: null, isCorrect: false }); const [isAnswered, setIsAnswered] = useState(false);

  if (!data || !Array.isArray(data.questions) || data.questions.length === 0) {
      return <p>Loading quiz...</p>;
  }
  
  const question = data.questions[qIndex];
  
  const handleAnswer = (option) => { if (isAnswered) return; const correct = option === question.correctAnswer; setSelection({ answer: option, isCorrect: correct }); setIsAnswered(true); if (correct) setScore(s => s + 1); };
  const handleNext = () => { if (qIndex < data.questions.length - 1) { setQIndex(i => i + 1); setIsAnswered(false); setSelection({ answer: null, isCorrect: false }); } else { onStepComplete(Math.round((score / data.questions.length) * 50)); } };
  
  if (!question) return <p>Loading question...</p>;

  const questionText = question.text || question.question;
  const questionOptions = question.options || [];

  return ( <div className="sim-container quiz-sim"><h4>Question {qIndex + 1}/{data.questions.length}</h4><p className="quiz-question">{questionText}</p><div className="quiz-options">{questionOptions.map((option, i) => { let btnClass = ""; if (isAnswered) { if (option === question.correctAnswer) btnClass = "correct"; else if (option === selection.answer) btnClass = "incorrect"; } return <button key={i} className={`quiz-option-btn ${btnClass}`} onClick={() => handleAnswer(option)} disabled={isAnswered}>{option}</button> })}</div>{isAnswered && <button className="modal-cta-btn" onClick={handleNext}>Continue</button>}</div> );
}

function ScenarioSimulation({ data, onStepComplete }) {
  // --- This is the new, corrected logic ---
  const [step, setStep] = useState('choice'); // 'choice', 'challenge', 'outcome'
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selection, setSelection] = useState(null);

  if (!data || !Array.isArray(data.choices)) {
    return <p>Loading scenario...</p>;
  }

  const handleChoiceSelect = (choice) => {
    setSelectedChoice(choice);
    setStep('challenge');
  };

  const handleChallengeAnswer = (answer) => {
    if (isAnswered) return;
    const correct = answer === selectedChoice.challenge.correctAnswer;
    setSelection(answer);
    setIsCorrect(correct);
    setIsAnswered(true);
    setTimeout(() => {
        setStep('outcome');
    }, 1500); // Wait 1.5s to show feedback before moving on
  };

  // --- Render based on the current step ---

  if (step === 'choice') {
    return (
      <div className="sim-container scenario-sim">
        <h4>{data.title}</h4>
        <p>{data.description}</p>
        <div className="scenario-options">
          {data.choices.map((choice) => (
            <button key={choice.id} className="scenario-choice-btn" onClick={() => handleChoiceSelect(choice)}>
              {choice.text}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === 'challenge') {
    return (
      <div className="sim-container scenario-sim">
        <h4>Your Choice: "{selectedChoice.text}"</h4>
        <p className="quiz-question">{selectedChoice.challenge.question}</p>
        <div className="quiz-options">
          {selectedChoice.challenge.options.map((option, i) => {
            let btnClass = "";
            if (isAnswered) {
              if (option === selectedChoice.challenge.correctAnswer) btnClass = "correct";
              else if (option === selection) btnClass = "incorrect";
            }
            return <button key={i} className={`quiz-option-btn ${btnClass}`} onClick={() => handleChallengeAnswer(option)} disabled={isAnswered}>{option}</button>
          })}
        </div>
      </div>
    );
  }

  if (step === 'outcome') {
    const outcome = isCorrect ? selectedChoice.outcomes.correct : selectedChoice.outcomes.incorrect;
    return (
      <div className="sim-container scenario-sim outcome-view">
        <h4>Outcome</h4>
        <p className={isCorrect ? 'outcome-text correct' : 'outcome-text incorrect'}>
          {outcome.text}
        </p>
        <p className="final-score">You earned {outcome.xp} XP!</p>
        <button className="modal-cta-btn" onClick={() => onStepComplete(outcome.xp)}>Continue</button>
      </div>
    );
  }
}


function ChartPanel({ id, title, series, chipLabel, up = false }) {
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

function makeInitialSeries(n, seed = 100) {
  let val = seed;
  return Array.from({ length: n }, (_, i) => {
    val = nextVal(val);
    return { x: i, y: val };
  });
}

function nextVal(prev) {
  const drift = Math.random() * 2 - 1; 
  const step = drift * 2.2; 
  const noise = (Math.random() - 0.5) * 1.3;
  const y = Math.max(40, Math.min(200, prev + step + noise));
  return Math.round(y * 100) / 100;
}

function buildPath(points, width, height) {
  if (!points || points.length === 0) return { path: "", minY: 0, maxY: 0 };
  const minY = Math.min(...points.map((p) => p.y));
  const maxY = Math.max(...points.map((p) => p.y));
  const pad = 12; 
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
      :root { --bg: #f7f9fb; --card: #ffffff; --ink: #0f172a; --muted: #6b7280; --accent: #22c55e; --accent-2: #6366f1; --shadow: 0 10px 24px rgba(2, 6, 23, 0.08); --radius: 18px; --maxw: 100vw; --tile-min: 240px; }
      * { box-sizing: border-box; }
      html, body, #root { height: 100%; }
      body { margin: 0; font-family: 'Nunito', system-ui, -apple-system, Segoe UI, Roboto, sans-serif; background: var(--bg); color: var(--ink); }
      .app-root { display: grid; grid-template-rows: auto 1fr auto; min-height: 100vh; }
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
      @media (max-width: 700px) { .topbar { grid-template-columns: 1fr auto; grid-template-areas: "brand actions" "xp xp"; align-items: start; } .xp-bar { width: 100%; } }
      .content { width: 100vw; max-width: 100vw; margin: 0; padding: clamp(8px, 2.5vw, 20px); display: grid; gap: clamp(14px, 2.5vw, 22px); }
      .tile-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(var(--tile-min), 1fr)); gap: clamp(10px, 2vw, 16px); }
      .tile { position: relative; display: grid; align-content: start; gap: 8px; padding: clamp(14px, 2.8vw, 18px); border-radius: var(--radius); border: 2px solid rgba(15,23,42,0.06); box-shadow: var(--shadow); cursor: pointer; text-align: left; transition: transform .12s ease, box-shadow .12s ease; }
      .tile:hover { transform: translateY(-2px) rotate(-0.25deg); box-shadow: 0 16px 36px rgba(2,6,23,0.12); }
      .tile-head { display: flex; align-items: center; gap: 10px; }
      .tile-title { font-weight: 800; font-size: clamp(16px, 2.2vw, 18px); }
      .tile-sub { color: #334155; font-size: clamp(12px, 2vw, 14px); }
      .tile-cta { position: absolute; bottom: 12px; right: 16px; font-weight: 800; color: #111827; opacity: 0.8; }
      .charts-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: clamp(10px, 2vw, 16px); align-items: stretch; }
      @media (max-width: 900px) { .charts-grid { grid-template-columns: 1fr; } }
      .chart-wrap, .modal-content { background: var(--card); border-radius: var(--radius); box-shadow: var(--shadow); border: 1px solid #e5e7eb; }
      .chart-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 6px 8px 10px; }
      .chart-title { font-weight: 800; font-size: clamp(14px, 2.2vw, 18px); }
      .chip.up { background: #e7fbe9; color: #166534; } .chip.down { background: #fee2e2; color: #7f1d1d; }
      .foot { padding: clamp(12px, 2vw, 18px); text-align: center; color: var(--muted); font-size: 13px; }
      .modal-backdrop { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.8); z-index: 100; display: grid; place-items: center; padding: 16px; backdrop-filter: blur(8px); }
      .modal-content { position: relative; max-width: 800px; width: 100%; max-height: 90vh; overflow-y: auto; padding: clamp(20px, 4vw, 32px); }
      .modal-close-btn { position: absolute; top: 12px; right: 12px; width: 32px; height: 32px; border: 0; background: #e5e7eb; color: var(--muted); border-radius: 50%; font-size: 20px; cursor: pointer; }
      .modal-header { text-align: center; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb; }
      .modal-title { font-size: 24px; font-weight: 800; margin: 0; } .modal-subtitle { font-size: 16px; color: var(--muted); margin: 4px 0 0; }
      .modal-body { padding-top: 24px; }
      .step-container h3 { font-size: 20px; margin-bottom: 16px; text-align: center; }
      .video-wrapper { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; background: #000; border-radius: 12px; margin-bottom: 24px; }
      .video-wrapper iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
      .modal-cta-btn { font-family: 'Nunito', sans-serif; background: var(--accent-2); color: white; border: 0; border-radius: 999px; padding: 12px 24px; font-size: 16px; font-weight: 700; cursor: pointer; transition: transform .1s ease; margin-top: 16px; display: block; margin-left: auto; margin-right: auto; }
      .modal-cta-btn:hover { transform: scale(1.03); }
      .loading-spinner { text-align: center; color: var(--muted); }
      .loading-spinner > div { width: 40px; height: 40px; border: 4px solid #e5e7eb; border-top-color: var(--accent-2); border-radius: 50%; margin: 0 auto 12px; animation: spin 1s linear infinite; }
      @keyframes spin { to { transform: rotate(360deg); } }
      .error-message { text-align: center; color: #b91c1c; background: #fee2e2; padding: 12px; border-radius: 8px; }
      
      /* --- SIMULATION & SESSION STYLES --- */
      .session-progress-tracker { height: 12px; background: #e5e7eb; border-radius: 99px; margin-bottom: 16px; overflow: hidden; }
      .session-progress-bar { height: 100%; background: var(--accent); transition: width 0.4s ease; }
      .sim-container { padding: 16px; border: 1px solid #e5e7eb; border-radius: 12px; background: #f9fafb; }
      .sim-container h4 { margin: 0 0 8px 0; }
      .sim-container p { margin: 0 0 16px 0; color: var(--muted); }
      
      .calculator-inputs { display: grid; gap: 16px; margin-bottom: 24px; }
      .input-group label { font-weight: 700; display: block; margin-bottom: 6px; }
      .input-group input[type="range"] { width: 100%; }
      .result-bar { display: flex; width: 100%; height: 32px; background: #e5e7eb; border-radius: 8px; overflow: hidden; font-size: 12px; color: white; font-weight: 700; transition: all 0.3s ease; }
      .bar-segment { display: grid; place-items: center; transition: width 0.4s ease; text-shadow: 1px 1px 2px rgba(0,0,0,0.4); }
      .bar-segment.needs { background: #3b82f6; } .bar-segment.wants { background: #a855f7; } .bar-segment.savings { background: #22c55e; }
      .feedback-text { font-weight: bold; text-align: center; margin-top: 16px; font-size: 16px; }

      .quiz-question { font-size: 18px; font-weight: 700; }
      .quiz-options { display: grid; gap: 12px; margin: 16px 0; }
 .quiz-option-btn { 
        width: 100%; 
        padding: 14px; 
        border: 2px solid #e5e7eb; 
        border-radius: 8px;
        text-align: left; 
        background: var(--card); 
        cursor: pointer; 
        font-size: 16px; 
        transition: all .15s ease;
        color: #0f172a;  /* THIS IS THE FIX */
      }
      .quiz-option-btn:hover:not(:disabled) { border-color: var(--accent-2); transform: translateY(-2px); }
      .quiz-option-btn:disabled { cursor: not-allowed; }
      .quiz-option-btn.correct { background: #dcfce7; border-color: #22c55e; color: #15803d; font-weight: bold; animation: pop-in 0.3s ease; }
      .quiz-option-btn.incorrect { background: #fee2e2; border-color: #ef4444; color: #b91c1c; animation: shake 0.5s ease; }
      .final-score { font-size: 24px; font-weight: bold; }
      
      .scenario-options { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; perspective: 1000px; }
      .scenario-card-container { cursor: pointer; }
      .scenario-card { position: relative; transition: transform 0.6s; transform-style: preserve-3d; border-radius: 12px; }
      .card-front, .card-back { padding: 24px; min-height: 120px; backface-visibility: hidden; display: grid; place-content: center; text-align: center; border: 2px solid #e5e7eb; border-radius: 12px; }
card-front { 
        background: var(--card); 
        font-weight: bold; 
        color: #0f172a; /* THIS FIXES THE SCENARIO CARD TEXT */
      }      .card-back { background: var(--accent-2); color: white; position: absolute; top: 0; left: 0; width: 100%; height: 100%; transform: rotateY(180deg); }
      .xp-reward { font-weight: bold; background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 99px; margin-top: 8px; display: inline-block; }
      .scenario-card-container.revealed .scenario-card.selected { transform: rotateY(180deg); }
      .scenario-card-container.revealed .scenario-card:not(.selected) { opacity: 0.5; }

      @keyframes pop-in { 0% { transform: scale(0.9); } 100% { transform: scale(1); } }
      @keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50% { transform: translateX(-5px); } 20%, 40% { transform: translateX(5px); } }
    `}</style>
  );
}

