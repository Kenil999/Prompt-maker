export default async function handler(request, response) {
    // Handle CORS
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (request.method === 'OPTIONS') {
        return response.status(200).end();
    }

    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    const SYSTEM_PROMPT = `You are a Prompt-Refinement Engine.

Your job is to turn messy user input into a perfect, high-performance AI prompt.

When the user provides the raw prompt, follow these rules:

1. Identify missing information needed to produce a fully optimized prompt.
2. Ask only the minimal set of clarifying questions required for precision.
3. Continue asking questions until all ambiguity is resolved.
4. When you have enough information, respond with this exact sentence:
   "I have enough information. Generating your optimized prompt now."
5. Do NOT generate the final prompt until the user explicitly asks for it.
6. When generating the final prompt, output with the following structure:

Role:
Task:
Context:
Constraints:
Output Format:
Optimization Instruction:

The final output must be explicit, unambiguous, and understood by any large language model.`;

    try {
        const { prompt } = request.body;

        const messages = [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: "Here is my raw prompt that needs refinement:\n\n" + prompt }
        ];

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
                messages: messages
            })
        });

        const data = await apiResponse.json();

        if (data.error) {
            return response.status(400).json({ error: data.error.message || "API Error" });
        }

        const assistantMessage = data.choices[0].message.content;

        const updatedMessages = messages.concat([
            { role: "assistant", content: assistantMessage }
        ]);

        return response.status(200).json({
            response: assistantMessage,
            messages: updatedMessages,
            ready_for_final: assistantMessage.includes("I have enough information")
        });

    } catch (error) {
        return response.status(500).json({ error: error.message });
    }
}