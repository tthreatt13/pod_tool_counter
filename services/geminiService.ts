
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { ExtractionResult } from "../types";

const MAX_RETRIES = 2; // Reduced from 3 to prevent extreme total wait times
const INITIAL_DELAY = 1500;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Strips markdown code blocks from a string if present.
 */
function cleanJsonResponse(text: string): string {
  return text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
}

/**
 * Utility to wrap Gemini API calls with exponential backoff retry logic.
 */
async function withRetry<T>(fn: () => Promise<T>, retries = MAX_RETRIES, ms = INITIAL_DELAY): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isRateLimit = error?.message?.includes('429') || error?.status === 429 || error?.error?.code === 429;
    const isServerError = error?.message?.includes('500') || error?.status === 500 || error?.error?.code === 500;

    if ((isRateLimit || isServerError) && retries > 0) {
      console.warn(`Gemini API ${error?.status || 'Error'}. Retrying in ${ms}ms...`);
      await delay(ms);
      return withRetry(fn, retries - 1, ms * 2);
    }
    throw error;
  }
}

/**
 * Extracts tools from a YouTube video URL.
 * Uses a two-step process: Search Grounding (metadata) -> Structuring (JSON).
 */
export const searchForEpisodeTools = async (youtubeUrl: string): Promise<ExtractionResult> => {
  // Fresh instance to ensure latest API keys are used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Step 1: Search grounding to get metadata and find the "Tools referenced" section
  const searchResponse = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Find specific details for this YouTube video: ${youtubeUrl}.
    Identify: Official Title, Channel Name, Upload Date (YYYY-MM-DD), and specifically look for a "Tools referenced" or "Links" section in the description.
    
    EXCLUDE: Sponsors, advertisers (like Brex, Mercury), non-software items (books, films, organizations).
    INCLUDE: Software, AI tools, apps, platforms.
    
    Output a bulleted list of tools and their URLs only. Be concise.`,
    config: {
      tools: [{ googleSearch: {} }],
    }
  }));

  const searchContent = searchResponse.text || "";
  
  // Extract search grounding URLs as per rules
  const groundingLinks = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const groundingInfo = JSON.stringify(groundingLinks);

  // Step 2: Structure the findings into clean JSON
  const extractionResponse = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Convert the following findings into a structured JSON object. 
    
    Search Summary: ${searchContent}
    Grounding Context: ${groundingInfo}
    Original URL: ${youtubeUrl}

    REQUIREMENTS:
    1. Extract tools, URLs, and a 1-sentence description.
    2. Construct the thumbnailUrl using: https://img.youtube.com/vi/[VIDEO_ID]/maxresdefault.jpg
    3. Categorize each tool (e.g., AI Model, Dev Tool, Productivity).
    4. Ensure NO sponsors are included.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          episodes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                episodeTitle: { type: Type.STRING },
                podcastName: { type: Type.STRING },
                youtubeUrl: { type: Type.STRING },
                thumbnailUrl: { type: Type.STRING },
                uploadDate: { type: Type.STRING },
                tools: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      url: { type: Type.STRING },
                      description: { type: Type.STRING },
                      category: { type: Type.STRING },
                    },
                    required: ["name", "url", "description", "category"]
                  }
                }
              },
              required: ["episodeTitle", "podcastName", "youtubeUrl", "thumbnailUrl", "uploadDate", "tools"]
            }
          }
        },
        required: ["episodes"]
      }
    }
  }));

  const rawJson = extractionResponse.text || '{"episodes": []}';
  try {
    return JSON.parse(cleanJsonResponse(rawJson));
  } catch (e) {
    console.error("Failed to parse Gemini JSON output", rawJson);
    return { episodes: [] };
  }
};
