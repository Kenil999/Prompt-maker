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
        const { messages, userMessage } = req.body;
        
        // Add user's new message
        const updatedMessages = [
            ...messages,
            { role: "user", content: userMessage }
        ];

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "deepseek/deepseek-chat-v3-0324:free",
                messages: updatedMessages
            })
        });

        const data = await response.json();
        const assistantMessage = data.choices[0].message.content;

        // Add assistant response
        const finalMessages = [
            ...updatedMessages,
            { role: "assistant", content: assistantMessage }
        ];

        return res.status(200).json({
            response: assistantMessage,
            messages: finalMessages,
            ready_for_final: assistantMessage.includes("I have enough information")
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}