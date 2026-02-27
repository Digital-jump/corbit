import { GoogleGenAI } from "@google/genai";

// Initialize Gemini AI
// Note: process.env.GEMINI_API_KEY is injected by the environment
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateAIResponse(prompt: string, context?: string) {
  try {
    const model = "gemini-3-flash-preview";
    
    const systemInstruction = `You are Corbit AI, an intelligent workforce operating system assistant. 
    Your goal is to help employees and admins with professional tasks.
    
    Tone: Professional, efficient, helpful, and slightly executive.
    
    Capabilities:
    1. Draft professional emails or announcements.
    2. Analyze text for tone and clarity.
    3. Summarize complex HR policies or updates.
    4. Provide suggestions for team management.
    
    Context: ${context || 'No specific context provided.'}`;

    const response = await ai.models.generateContent({
      model: model,
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate AI response");
  }
}
