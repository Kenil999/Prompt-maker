import { GoogleGenAI, Type, Schema } from "@google/genai";

// Initialize Gemini Client
// IMPORTANT: The API key must be provided via environment variable at build time.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

// Retry logic helper
async function callWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return callWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export interface RefinementResponse {
  questions: string[];
}

export const generateRefinementQuestions = async (idea: string): Promise<string[]> => {
  const prompt = `
    You are an expert Prompt Engineer. The user has a raw idea: "${idea}".
    Your goal is to gather specific details to craft the perfect, sophisticated prompt.
    Generate exactly 5 highly relevant, specific refinement questions that will help clarify the user's intent, tone, format, and constraints.
    Do not ask generic questions. Be specific to the idea.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      questions: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "A list of 5 refinement questions.",
      },
    },
    required: ["questions"],
  };

  const execute = async () => {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const data = JSON.parse(text) as RefinementResponse;
    return data.questions;
  };

  return callWithRetry(execute);
};

export const generateFinalPrompt = async (
  originalIdea: string,
  qaPairs: { question: string; answer: string }[]
): Promise<string> => {
  
  const context = qaPairs.map((qa, i) => `Q${i + 1}: ${qa.question}\nA${i + 1}: ${qa.answer}`).join("\n\n");

  const prompt = `
    Task: Create one extremely sophisticated, optimized AI prompt based on the following context.

    Original Intent: "${originalIdea}"

    User Refinements:
    ${context}

    Instructions:
    1. Act as a world-class Prompt Engineering expert.
    2. Synthesize the original intent and the user's answers into a single, powerful prompt.
    3. Use advanced techniques: System Role definition, Chain-of-Thought instructions, clear delimiters, output formatting, and constraints.
    4. The final output should be ready to copy-paste into an LLM (like ChatGPT, Claude, or Gemini).
    5. RETURN ONLY THE RAW TEXT OF THE PROMPT. Do not include markdown code blocks (like \`\`\`) wrapping the whole response, just the text.
  `;

  const execute = async () => {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        temperature: 0.8,
      },
    });
    
    return response.text || "Failed to generate prompt.";
  };

  return callWithRetry(execute);
};