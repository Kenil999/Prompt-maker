export const config = {
    runtime: 'edge'
};

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

export default async function handler(req) {
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        });
    }

    try {
        const body = await req.json();
        const { prompt } = body;

        const messages = [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: `Here is my raw prompt that needs refinement:\n\n${prompt}` }
        ];

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://prompt-refiner.vercel.app",
                "X-Title": "Prompt Refiner"
            },
            body: JSON.stringify({
                model: "deepseek/deepseek-chat-v3-0324:free",
                messages: messages
            })
        });

        const data = await response.json();
        
        if (data.error) {
            return new Response(JSON.stringify({ error: data.error.message }), {
                status: 400,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        const assistantMessage = data.choices[0].message.content;

        const updatedMessages = [
            ...messages,
            { role: "assistant", content: assistantMessage }
        ];

        return new Response(JSON.stringify({
            response: assistantMessage,
            messages: updatedMessages,
            ready_for_final: assistantMessage.includes("I have enough information")
        }), {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}