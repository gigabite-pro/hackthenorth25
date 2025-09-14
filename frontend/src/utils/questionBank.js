import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    dangerouslyAllowBrowser: true
});

export async function getQuestionBank(key) {
    // Define topics and prompts for each module
    const moduleConfig = {
        budgeting: {
            topic: "The Art of Budgeting",
            context: "Personal budgeting strategies, expense tracking, saving goals, emergency funds, and money management techniques"
        },
        credit: {
            topic: "The Credit Score Game",
            context: "Credit scores, credit reports, building credit history, credit utilization, payment history, and credit improvement strategies"
        },
        stocks: {
            topic: "The Stock Market",
            context: "Stock market basics, investing principles, market analysis, portfolio diversification, and long-term wealth building"
        }
    };

    const config = moduleConfig[key] || moduleConfig.budgeting;

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are an educational content generator. Generate exactly 2 multiple choice questions about ${config.topic}. 

Context: ${config.context}

Return ONLY a valid JSON array with this exact structure:
[
  {
    "topic": "Short topic name",
    "prompt": "Question text?",
    "choices": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "explain": "Brief explanation of the answer",
    "why": "Why this answer is correct",
    "hints": ["Hint 1", "Hint 2"]
  }
]

Make questions practical and educational. Ensure the correct answer index (0-3) matches the right choice.`
                },
                {
                    role: "user",
                    content: `Generate 2 multiple choice questions about ${config.topic} for the ${config.context}.`
                }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 1,
            max_tokens: 1000
        });

        const response = completion.choices[0]?.message?.content;
        console.log(response)
        if (response) {
            try {
                const questions = JSON.parse(response);
                if (Array.isArray(questions) && questions.length > 0) {
                    return questions;
                }
            } catch (parseError) {
                console.warn("Failed to parse Groq response as JSON:", parseError);
            }
        }
    } catch (error) {
        console.warn("Groq API error, falling back to static questions:", error);
    }

    // Fallback to static questions if Groq fails
    const base = {
        budgeting: [
            {
                topic: "Emergency Fund",
                prompt: "How much should you ideally save in an emergency fund?",
                choices: ["1 month of expenses", "3-6 months of expenses", "1 year of expenses", "Only $1,000"],
                correct: 1,
                explain: "Financial experts recommend 3-6 months of living expenses for emergencies.",
                why: "This amount covers most unexpected situations without being excessive.",
                hints: ["Think about job loss scenarios.", "Not too little, not too much."],
            },
            {
                topic: "50/30/20 Rule",
                prompt: "In the 50/30/20 budgeting rule, what does the 20% represent?",
                choices: ["Entertainment", "Housing costs", "Savings and debt repayment", "Food expenses"],
                correct: 2,
                explain: "The 20% goes toward savings and paying off debt.",
                why: "This ensures you're building wealth and reducing financial obligations.",
                hints: ["Think about your financial future.", "What helps you get ahead financially?"],
            },
        ],
        credit: [
            {
                topic: "Credit Utilization",
                prompt: "What's the ideal credit utilization ratio for a good credit score?",
                choices: ["90% or higher", "50-70%", "Under 30%", "Exactly 100%"],
                correct: 2,
                explain: "Keeping credit utilization under 30% shows responsible credit management.",
                why: "Lower utilization demonstrates you're not maxing out your available credit.",
                hints: ["Lower is generally better.", "Think about what shows financial responsibility."],
            },
            {
                topic: "Payment History",
                prompt: "What percentage of your credit score is based on payment history?",
                choices: ["15%", "35%", "30%", "10%"],
                correct: 1,
                explain: "Payment history is the most important factor, making up 35% of your score.",
                why: "Consistently paying on time shows lenders you're reliable.",
                hints: ["It's the biggest factor.", "Think about what lenders care about most."],
            },
        ],
        stocks: [
            {
                topic: "Diversification",
                prompt: "What is the main benefit of portfolio diversification?",
                choices: ["Guaranteed profits", "Reducing overall risk", "Avoiding all losses", "Maximizing short-term gains"],
                correct: 1,
                explain: "Diversification spreads risk across different investments.",
                why: "When some investments decline, others may perform well, balancing your portfolio.",
                hints: ["Don't put all eggs in one basket.", "Think about risk management."],
            },
            {
                topic: "Dollar-Cost Averaging",
                prompt: "Dollar-cost averaging means:",
                choices: ["Buying only cheap stocks", "Investing the same amount regularly", "Selling when prices drop", "Only investing large amounts"],
                correct: 1,
                explain: "Dollar-cost averaging involves investing a fixed amount at regular intervals.",
                why: "This strategy reduces the impact of market volatility over time.",
                hints: ["Think about consistency.", "Same amount, different intervals."],
            },
        ],
    };
    return base[key] || base.budgeting;
}
