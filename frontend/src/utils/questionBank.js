import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    dangerouslyAllowBrowser: true
});

export async function getQuestionBank(key) {
    // Define topics and prompts for each module
    const moduleConfig = {
        rbc: {
            topic: "Index Funds and Investment Basics",
            context: "RBC InvestEase platform focusing on index funds, expense ratios, diversification, and basic investment principles"
        },
        cohere: {
            topic: "AI and Language Models",
            context: "Cohere AI coaching platform focusing on prompts, tokens, AI model usage, and natural language processing"
        },
        options: {
            topic: "Options Trading",
            context: "Options trading basics including calls, puts, premiums, volatility, and risk management"
        }
    };

    const config = moduleConfig[key] || moduleConfig.rbc;

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
            temperature: 2,
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
        rbc: [
            {
                topic: "Index Funds",
                prompt: "What is the main benefit of an index fund?",
                choices: ["Guaranteed outperformance", "Broad market diversification", "Zero fees", "Daily dividends"],
                correct: 1,
                explain: "Index funds track a market index for wide exposure at low cost.",
                why: "Diversification reduces single-stock risk and usually lowers fees.",
                hints: ["Think about risk across many companies.", "Which choice mentions spreading bets?"],
            },
            {
                topic: "Fees",
                prompt: "Lower expense ratios typically mean:",
                choices: ["Lower returns", "Higher risk", "More of your returns kept", "More active trading"],
                correct: 2,
                explain: "Fees subtract from performance over time.",
                why: "If costs are lower, more of the gross return stays in your pocket.",
                hints: ["Fees come out of performance.", "Lower fees = ? of your return remains"],
            },
        ],
        cohere: [
            {
                topic: "AI Coaching",
                prompt: "A good prompt is usually:",
                choices: ["Vague", "Verbose with no structure", "Clear and specific", "Only emojis"],
                correct: 2,
                explain: "Specific goals and constraints guide the model.",
                why: "Clarity reduces ambiguity, improving outputs.",
                hints: ["How do you reduce ambiguity?", "What makes instructions easier to follow?"],
            },
            {
                topic: "Tokens",
                prompt: "Tokens are:",
                choices: ["Entire sentences", "Units of text pieces", "Only numbers", "Only images"],
                correct: 1,
                explain: "Models process inputs in token units.",
                why: "Understanding tokens helps estimate context limits.",
                hints: ["Smaller than a word sometimes.", "Models read text in chunks called …?"],
            },
        ],
        options: [
            {
                topic: "Calls",
                prompt: "A call option gives the holder the right to:",
                choices: ["Sell at a strike price", "Buy at a strike price", "Receive dividends", "Own the company"],
                correct: 1,
                explain: "Calls = right to buy; Puts = right to sell.",
                why: "Calls benefit if price goes up above strike.",
                hints: ["Calls and puts are opposites.", "Which one is the right to buy?"],
            },
            {
                topic: "Risk",
                prompt: "Option premiums primarily reflect:",
                choices: ["Company age", "Volatility", "Dividends", "CEO salary"],
                correct: 1,
                explain: "Higher volatility → higher premium.",
                why: "More uncertainty increases the value of optionality.",
                hints: ["What makes outcomes less predictable?", "More price swings mean…"],
            },
        ],
    };
    return base[key] || base.rbc;
}
