
export interface LogoGenerationParams {
  style: string;
  concept: string;
  additionalPrompt?: string;
  aspectRatio: "1:1" | "4:3" | "16:9";
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
  TECH = "Futuristic Tech"
}

export const COLORS = {
  navy: '#002951',
  teal: '#04768A',
  sage: '#AEC2AF',
  lavender: '#C2A3CC'
};
