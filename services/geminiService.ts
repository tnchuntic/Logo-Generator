
import { GoogleGenAI } from "@google/genai";
import { LogoGenerationParams, COLORS } from "../types";

export const generateLogo = async (params: LogoGenerationParams): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Create a professional, high-quality logo for a brand named "Life Hub". 
  The design should follow a ${params.style} style. 
  Concept: ${params.concept}. 
  Mandatory Color Palette: Deep Navy (${COLORS.navy}), Teal (${COLORS.teal}), Sage Green (${COLORS.sage}), and Soft Lavender (${COLORS.lavender}). 
  Requirements: 
  - Ensure the name "Life Hub" is clearly integrated or present if appropriate for the style.
  - The logo should be versatile, working well on both light and dark backgrounds.
  - No shadows or 3D effects unless specifically requested.
  - Focus on balance, interconnectedness, and growth.
  ${params.additionalPrompt ? `Additional instructions: ${params.additionalPrompt}` : ''}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: params.aspectRatio,
        },
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image data returned from Gemini");
  } catch (error) {
    console.error("Error generating logo:", error);
    throw error;
  }
};
