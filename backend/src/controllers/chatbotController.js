const MAX_MESSAGE_LENGTH = 4000;
const MAX_HISTORY_MESSAGES = 20;

const CONTEXT = `
You are an AI assistant for Sarthak Sharma and WEB 3 TASK PRIVATE LIMITED. Use the following context to answer questions when relevant.

Context about Sarthak Sharma:
- Email: sarthakkaushik927@gmail.com, Mobile: +91-7060321453, Location: Ghaziabad, India
- Education: Ajay Kumar Garg Engineering College, Ghaziabad, B.Tech in Computer Science (CGPA: 7.5) (2024-2028)
- Skills: JavaScript, TypeScript, Python, Go, Java, C++, SQL, React.js, Next.js, React Native, Node.js, Express.js, FastAPI, GraphQL, WebSockets, MongoDB, PostgreSQL, Redis, Generative AI, RAG, Agentic AI, LangChain, LangGraph, AWS, Terraform, Docker, CI/CD.
- Experience:
  1. Full Stack & AI Developer Intern at AxioraPeople (Sep 2026-Present): built EdTalent, an AI hiring platform with 150+ APIs, load-tested at 500+ concurrent users.
  2. Web Developer (Part-time) at Cloud Computing Cell, AKGEC (Oct 2025-Present): built registration, probation management and assessment portals.
  3. Open Source Contributor to Podman, stdlib and Zulip (Sep 2026-Oct 2026).
- Projects: Fire Detection System, NextGen Assessment Systems.

Context about WEB 3 TASK PRIVATE LIMITED:
- We help startups scale with strong SaaS, conversion-ready dashboards, and integrated tech, AI, design, and automation solutions.
- 4+ years of experience, 500+ projects delivered, 99% client satisfaction rate, ISO certified (9001:2015, 27001:2022).
- Leaders: 
  - Sumit Nagar (Co-Founder & CEO): Charts strategic direction, philosophy is 'vision with execution'.
  - Sandeep Rana (CTO): Architect behind scalable platforms, deep roots in blockchain, mantra 'Build so it never breaks'.
  - Akash Sharma (CMO): Translates powerful tech into narratives.
  - Pulkit Sharma (CFO): Strategic mind ensuring long-term viability.
`;

// Keep only real conversation turns so callers can't add their own system instructions
const sanitizeHistory = (history) => {
    if (!Array.isArray(history)) return [];
    return history
        .filter((m) => ['user', 'assistant'].includes(m?.role) && typeof m.content === 'string')
        .slice(-MAX_HISTORY_MESSAGES)
        .map(({ role, content }) => ({ role, content: content.slice(0, MAX_MESSAGE_LENGTH) }));
};

const chat = async (req, res) => {
    try {
        const { message, history } = req.body;

        if (typeof message !== 'string' || !message.trim()) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        if (message.length > MAX_MESSAGE_LENGTH) {
            return res.status(400).json({ success: false, message: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer` });
        }

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ success: false, message: 'GROQ_API_KEY is not configured in environment variables.' });
        }

        const messages = [
            { role: 'system', content: CONTEXT },
            ...sanitizeHistory(history),
            { role: 'user', content: message }
        ];

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: messages,
                temperature: 0.7,
                max_tokens: 1024
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Groq API Error: ${error}`);
        }

        const data = await response.json();
        
        res.status(200).json({
            success: true,
            reply: data.choices[0].message.content
        });

    } catch (error) {
        console.error('Chatbot Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to process chat request' });
    }
};

module.exports = {
    chat
};
