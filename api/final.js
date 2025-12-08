export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { messages } = req.body;
        
        // Add request for final prompt
        const finalMessages = [
            ...messages,
            { role: "user", content: "Please generate the final optimized prompt now." }
        ];

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "deepseek/deepseek-chat-v3-0324:free",
                messages: finalMessages
            })
        });

        const data = await response.json();
        const finalPrompt = data.choices[0].message.content;

        return res.status(200).json({
            final_prompt: finalPrompt
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}