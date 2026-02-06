
import { GoogleGenAI } from "@google/genai";
import { LogoGenerationParams } from "../types";

export const generateLogo = async (params: LogoGenerationParams): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const colorString = params.colors.join(", ");
  const prompt = `Create a professional, high-quality logo.
  Brand Name: "${params.brandName}"
  ${params.slogan ? `Slogan: "${params.slogan}"` : ''}
  Style: ${params.style}
  Core Concept: ${params.concept}
  Required Color Palette: ${colorString}
  
  Requirements:
  - Integrate the Brand Name clearly. ${params.slogan ? 'Optionally include the slogan if it fits the design well.' : ''}
  - The design should be versatile and look premium.
  - Avoid generic clip-art. Focus on unique, bespoke iconography.
  - Use the exact colors provided: ${colorString}.
  ${params.additionalPrompt ? `Special Instructions: ${params.additionalPrompt}` : ''}`;

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
