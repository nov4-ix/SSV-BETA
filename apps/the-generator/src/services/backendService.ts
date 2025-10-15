// Backend Service for The Generator
const API_BASE = import.meta.env.VITE_API_BASE || "https://68edd79f78d7cef650777246--son1k.netlify.app/.netlify/functions";

export interface GeneratorPromptRequest {
  basePrompt: string;
  literaryKnobs: Record<string, number>;
  creativityLevel: number;
}

export interface GeneratorPromptResponse {
  success: boolean;
  prompts: string | string[];
  error?: string;
}

export interface LyricsGenerationRequest {
  prompt: string;
  literaryKnobs: Record<string, number>;
  voiceGender: string;
  isInstrumental: boolean;
}

export interface LyricsGenerationResponse {
  success: boolean;
  lyrics: string;
  error?: string;
}

export const backendService = {
  generateIntelligentPrompts: async (request: GeneratorPromptRequest): Promise<GeneratorPromptResponse> => {
    const response = await fetch(`${API_BASE}/generator-prompt`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-client-id': 'the-generator'
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      throw new Error(`Error in generator-prompt: ${response.statusText}`);
    }
    
    return response.json();
  },

  generateStructuredLyrics: async (request: LyricsGenerationRequest): Promise<LyricsGenerationResponse> => {
    const response = await fetch(`${API_BASE}/structured-lyrics`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-client-id': 'the-generator'
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      throw new Error(`Error in structured-lyrics: ${response.statusText}`);
    }
    
    return response.json();
  },
};

