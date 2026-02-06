
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

/**
 * Refines an existing logo based on user instructions.
 */
export const refineLogo = async (base64Data: string, instructions: string, params: LogoGenerationParams): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const base64Content = base64Data.split(',')[1];

  const prompt = `You are a professional logo designer. I am providing you with an existing logo design.
  Please update the logo based on these specific instructions: "${instructions}"
  
  General brand context:
  Brand Name: "${params.brandName}"
  Style Target: ${params.style}
  Colors to Maintain: ${params.colors.join(", ")}
  
  Critical Rules:
  - Keep the overall essence of the current design unless asked otherwise.
  - Precisely add or remove parts as requested.
  - Ensure the output remains a high-quality, professional logo.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Content, mimeType: 'image/png' } },
          { text: prompt }
        ]
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
    
    throw new Error("No refinement data returned from Gemini");
  } catch (error) {
    console.error("Error refining logo:", error);
    throw error;
  }
};

/**
 * Uses a vision model to trace a raster image into professional SVG code.
 */
export const traceImageToSVG = async (base64Data: string, brandName: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const base64Content = base64Data.split(',')[1];

  const prompt = `Trace this logo image into clean, professional, and minimalist SVG code.
  - Convert all shapes into accurate SVG <path>, <circle>, or <rect> elements.
  - Ensure the colors match the provided image exactly.
  - Render the text "${brandName}" using high-quality SVG paths or standard web-safe fonts in <text> elements.
  - The output must be valid, stand-alone SVG XML code.
  - Do NOT use <image> or embed raster data. Everything must be vector paths.
  - Return ONLY the SVG code starting with <svg and ending with </svg>. No markdown, no comments.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{
        parts: [
          { inlineData: { data: base64Content, mimeType: 'image/png' } },
          { text: prompt }
        ]
      }],
    });

    let svgCode = response.text || '';
    svgCode = svgCode.replace(/```svg/g, '').replace(/```/g, '').trim();
    
    if (!svgCode.startsWith('<svg')) {
      throw new Error("Invalid SVG generated");
    }

    return svgCode;
  } catch (error) {
    console.error("Error tracing SVG:", error);
    throw error;
  }
};
