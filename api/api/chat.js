export default async function handler(request, response) {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (request.method === 'OPTIONS') {
        return response.status(200).end();
    }

    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { messages, userMessage } = request.body;

        const updatedMessages = messages.concat([
            { role: "user", content: userMessage }
        ]);

        const apiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + process.env.OPENROUTER_API_KEY,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://prompt-refiner.vercel.app",
                "X-Title": "Prompt Refiner"
            },
            body: JSON.stringify({
                model: "deepseek/deepseek-chat-v3-0324:free",
                messages: updatedMessages
            })
        });

        const data = await apiResponse.json();

        if (data.error) {
            return response.status(400).json({ error: data.error.message || "API Error" });
        }

        const assistantMessage = data.choices[0].message.content;

        const finalMessages = updatedMessages.concat([
            { role: "assistant", content: assistantMessage }
        ]);

        return response.status(200).json({
            response: assistantMessage,
            messages: finalMessages,
            ready_for_final: assistantMessage.includes("I have enough information")
        });

    } catch (error) {
        return response.status(500).json({ error: error.message });
    }
}