import { GoogleGenAI, GenerateContentParameters, GenerateContentResponse } from "@google/genai";

const MAX_RETRIES = 5;
const INITIAL_DELAY = 1000; // 1 second

/**
 * Helper to call Gemini API with exponential backoff for 429 errors.
 */
export async function generateContentWithRetry(
  params: GenerateContentParameters,
  retries = MAX_RETRIES,
  delay = INITIAL_DELAY
): Promise<GenerateContentResponse> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  try {
    const response = await ai.models.generateContent(params);
    return response;
  } catch (error: any) {
    // Check if it's a 429 error (Rate limit exceeded)
    const errorString = JSON.stringify(error);
    const isRateLimitError = 
      error?.message?.includes('429') || 
      error?.status === 429 || 
      error?.message?.includes('RESOURCE_EXHAUSTED') ||
      errorString.includes('429') ||
      errorString.includes('RESOURCE_EXHAUSTED');

    if (isRateLimitError && retries > 0) {
      console.warn(`Gemini API rate limit hit. Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return generateContentWithRetry(params, retries - 1, delay * 2);
    }

    // If not a rate limit error or no retries left, throw
    throw error;
  }
}
