
import { GoogleGenAI, Type } from "@google/genai";
import { ExtractionResult } from "../types";

/**
 * Searches for tools mentioned in a specific YouTube episode using Google Search grounding.
 * Optimized for high fidelity: gets correct channel name, title, thumbnail, and upload date.
 * Features strict filtering to only include software tools and apps, excluding sponsors.
 */
export const searchForEpisodeTools = async (youtubeUrl: string): Promise<ExtractionResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Step 1: Search using Google Search (Grounding)
  const searchResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Using Google Search, find details for this YouTube video: ${youtubeUrl}.
    I need:
    1. The exact video title.
    2. The official Channel Name (e.g., "How I AI", "Lenny's Podcast").
    3. The exact upload date in YYYY-MM-DD format.
    4. A list of all software tools, AI models, developer platforms, or productivity apps mentioned. 
    
    Look specifically in sections like "Tools referenced".
    
    CRITICAL EXCLUSION RULES:
    - DO NOT extract Sponsors or Advertisers. Ignore sections starting with "Brought to you by" or "Sponsors". (e.g., skip things like Brex, Mercury, etc. if they are sponsors).
    - ONLY extract software tools, AI platforms, and technical apps (e.g., ChatGPT, Claude, Cursor, GitHub, Whisper).
    - DO NOT extract non-software references like documentaries, films, books, historical figures, organizations, or museums (e.g., Ken Burns, PBS, Library of Congress).
    - IGNORE sections like "Other references" or "Suggested watching" if they contain non-software items.
    
    5. The YouTube Video ID from the URL.`,
    config: {
      tools: [{ googleSearch: {} }],
    }
  });

  // Step 2: Structure the search results into a specific JSON schema
  const extractionResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Convert these search findings into a structured JSON object.
    
    FILTERING INSTRUCTIONS:
    - Review the list of items found.
    - KEEP items that are: AI Models, SaaS products, Mobile Apps, Developer Tools, or Software Platforms mentioned as referenced tools.
    - REMOVE/IGNORE items identified as Sponsors (e.g., Brex, Mercury, etc. from "Brought to you by" sections).
    - REMOVE items that are: Documentaries, Movies, Books, People, General Organizations, or Historical Events.
    - For kept software items, provide the official URL and a 1-sentence description.
    - Construct the thumbnailUrl using: https://img.youtube.com/vi/[VIDEO_ID]/maxresdefault.jpg
    
    Search findings:
    ${searchResponse.text}
    
    Video URL: ${youtubeUrl}`,
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
                uploadDate: { type: Type.STRING, description: "YYYY-MM-DD format" },
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
  });

  return JSON.parse(extractionResponse.text || '{"episodes": []}');
};
