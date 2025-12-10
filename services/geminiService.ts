import { GoogleGenAI, Type } from "@google/genai";
import { SketchinessMetric } from "../types";

// Initialize Gemini Client
// NOTE: In a real production app, ensure API_KEY is set in environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Analyzes a project description to generate a "Sketchiness" radar chart data.
 */
export const analyzeSketchiness = async (title: string, description: string): Promise<SketchinessMetric[]> => {
  const modelId = "gemini-2.5-flash";
  
  const prompt = `
    Analyze the crypto project "${title}" with the following description for potential risks ("sketchiness").
    Description: "${description}"
    
    Return a JSON object with a 'metrics' array. 
    Each item in the array should have:
    - 'subject' (e.g., "Dev Team", "Tokenomics", "Hype", "Utility", "Roadmap")
    - 'A' (an integer 0-100, where 100 is EXTREMELY SKETCHY/RISKY and 0 is completely safe/doxxed/audited)
    - 'fullMark' (always 100)
    
    Be critical but fair. Meme coins generally have high risk in "Utility" but maybe lower in "Hype".
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            metrics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  subject: { type: Type.STRING },
                  A: { type: Type.INTEGER },
                  fullMark: { type: Type.INTEGER }
                }
              }
            }
          }
        }
      }
    });

    const json = JSON.parse(response.text || '{"metrics": []}');
    // Fallback if AI fails or returns empty
    if (!json.metrics || json.metrics.length === 0) {
       return [
        { subject: "Team Anonymity", A: 80, fullMark: 100 },
        { subject: "Tokenomics", A: 50, fullMark: 100 },
        { subject: "Liquidity", A: 90, fullMark: 100 },
        { subject: "Utility", A: 70, fullMark: 100 },
        { subject: "Hype", A: 20, fullMark: 100 },
      ];
    }
    return json.metrics;

  } catch (error) {
    console.error("AI Analysis Failed", error);
    // Return default mock data on error
    return [
      { subject: "Team Anonymity", A: 50, fullMark: 100 },
      { subject: "Tokenomics", A: 50, fullMark: 100 },
      { subject: "Liquidity", A: 50, fullMark: 100 },
      { subject: "Utility", A: 50, fullMark: 100 },
      { subject: "Hype", A: 50, fullMark: 100 },
    ];
  }
};

/**
 * Generates a "Soulbound" NFT image based on project description.
 */
export const generateSoulboundNFT = async (projectTitle: string, description: string): Promise<string> => {
  const modelId = "gemini-2.5-flash-image"; // Using the flash image model for speed/cost

  const prompt = `
    Create a unique, cool, pixel-art style digital badge or emblem for a crypto backer.
    It should represent the project "${projectTitle}".
    Project Vibe: ${description.substring(0, 100)}...
    The image should use a blue and white color palette (Base chain theme).
    Minimalist, icon-like, suitable for a profile badge.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    // Extract image
    // Note: The response handling depends on how the specific model returns the image.
    // For gemini-2.5-flash-image doing generation:
    // We check parts.
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    // Fallback placeholder if no image found in response
    return `https://picsum.photos/seed/${projectTitle}/200/200`;

  } catch (error) {
    console.error("NFT Generation Failed", error);
    return `https://picsum.photos/seed/${projectTitle}/200/200`;
  }
};
