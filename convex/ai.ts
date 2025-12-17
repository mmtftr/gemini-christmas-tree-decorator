/**
 * AI Functions - Gemini API integration
 *
 * These functions mimic Convex actions that would run on the backend.
 * In real Convex, these would be defined with `action()` and run server-side.
 */

import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedTheme } from '../types';

// In real Convex, API key would be in environment variables on the backend
const getAIClient = () => {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Generate a Christmas tree theme based on a prompt
 *
 * Convex signature: action({ args: { prompt: v.string() }, handler: async (ctx, args) => {...} })
 */
export async function generateTheme(args: { prompt: string }): Promise<GeneratedTheme> {
  const ai = getAIClient();
  const model = "gemini-2.0-flash-001";

  const systemInstruction = `You are an expert holiday decorator and color theorist.
  Generate a Christmas tree visual theme based on the user's request.
  Provide hex colors for the tree and ornaments, a background color, and a snow amount (0 to 1).`;

  const response = await ai.models.generateContent({
    model,
    contents: args.prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          treeColor: { type: Type.STRING, description: "Hex color code for the pine needles" },
          ornamentColors: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Array of 3-5 hex color codes for ornaments"
          },
          snowAmount: { type: Type.NUMBER, description: "Amount of snow/frost on tree (0.0 to 1.0)" },
          backgroundColor: { type: Type.STRING, description: "Hex color for the scene background" },
          description: { type: Type.STRING, description: "Short description of the theme vibe" }
        },
        required: ["treeColor", "ornamentColors", "snowAmount", "backgroundColor", "description"]
      }
    }
  });

  if (response.text) {
    return JSON.parse(response.text) as GeneratedTheme;
  }

  throw new Error("Failed to generate theme");
}

/**
 * Generate ornament placement suggestions
 *
 * Convex signature: action({ args: { treeConfig: v.object({...}), count: v.number() }, handler: ... })
 */
export async function suggestPlacements(args: {
  treeHeight: number;
  treeRadius: number;
  count: number;
}): Promise<Array<{ position: [number, number, number]; color: string }>> {
  const ai = getAIClient();
  const model = "gemini-2.0-flash-001";

  const systemInstruction = `You are a Christmas tree decoration expert.
  Generate aesthetically pleasing ornament placement positions for a tree.
  The tree is ${args.treeHeight} units tall and ${args.treeRadius} units wide at the base.
  Tree is centered at origin, base at y=0.`;

  const response = await ai.models.generateContent({
    model,
    contents: `Generate ${args.count} ornament positions with colors for a balanced, beautiful look.`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          placements: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER },
                z: { type: Type.NUMBER },
                color: { type: Type.STRING, description: "Hex color code" }
              },
              required: ["x", "y", "z", "color"]
            }
          }
        },
        required: ["placements"]
      }
    }
  });

  if (response.text) {
    const data = JSON.parse(response.text);
    return data.placements.map((p: any) => ({
      position: [p.x, p.y, p.z] as [number, number, number],
      color: p.color
    }));
  }

  throw new Error("Failed to generate placements");
}
