
export interface LogoGenerationParams {
  brandName: string;
  slogan: string;
  style: string;
  concept: string;
  additionalPrompt?: string;
  aspectRatio: "1:1" | "4:3" | "16:9";
  colors: string[];
}

export interface GeneratedLogo {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

export enum LogoStyle {
  MINIMALIST = "Minimalist & Clean",
  ABSTRACT = "Abstract & Geometric",
  CORPORATE = "Modern Corporate",
  PLAYFUL = "Friendly & Playful",
  LUXURY = "Elegant & High-end",
  TECH = "Futuristic Tech",
  VINTAGE = "Vintage & Retro"
}

export const DEFAULT_COLORS = [
  '#002951', // Navy
  '#04768A', // Teal
  '#AEC2AF', // Sage
  '#C2A3CC'  // Lavender
];
