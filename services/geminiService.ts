
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
    // Clean up any markdown blocks if the model included them
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
