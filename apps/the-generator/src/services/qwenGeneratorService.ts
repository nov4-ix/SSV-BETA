import { clientManager } from './clientManager';

// 🎛️ INTERFACES PARA PERILLAS LITERARIAS
export interface LiteraryKnobs {
  narrativeDepth: number;        // 0-100: Profundidad narrativa
  emotionalIntensity: number;    // 0-100: Intensidad emocional  
  poeticComplexity: number;      // 0-100: Complejidad poética
  metaphorUsage: number;         // 0-100: Uso de metáforas
  rhymeDensity: number;          // 0-100: Densidad de rimas
  storyArc: number;              // 0-100: Desarrollo del arco narrativo
  characterDevelopment: number; // 0-100: Desarrollo de personajes
  thematicConsistency: number;  // 0-100: Consistencia temática
}

export interface LyricsRequest {
  prompt: string;
  literaryKnobs: LiteraryKnobs;
  structure: {
    type: 'verse-chorus' | 'verse-prechorus-chorus' | 'verse-chorus-bridge' | 'intro-verse-chorus-bridge' | 'custom';
    customStructure?: string;
  };
  style: string;
  genre: string;
  mood: string;
  userId: string;
}

export interface LyricsResponse {
  lyrics: string;
  structure: {
    sections: Array<{
      type: string;
      content: string;
      rhymeScheme?: string;
    }>;
  };
  analysis: {
    complexity: number;
    coherence: number;
    emotionalImpact: number;
    poeticDevices: string[];
  };
  metadata: {
    wordCount: number;
    lineCount: number;
    averageWordsPerLine: number;
    rhymeDensity: number;
  };
}

export interface GeneratorPromptRequest {
  prompt: string;
  style: string;
  genre: string;
  mood: string;
  creativityLevel: 'conservative' | 'moderate' | 'creative' | 'experimental';
  targetInstrumentation: string[];
  arrangementGoals: string[];
  userId: string;
}

export interface GeneratorPromptResponse {
  basePrompt: string;
  enhancedPrompt: string;
  creativePrompt: string;
  technicalPrompt: string;
  arrangementSuggestions: Array<{
    section: string;
    suggestion: string;
    confidence: number;
  }>;
  instrumentation: {
    primary: string[];
    secondary: string[];
    effects: string[];
  };
  creativeElements: string[];
  technicalSpecs: {
    tempo: string;
    key: string;
    timeSignature: string;
    dynamics: string;
  };
  confidence: number;
}

// 🎵 SERVICIO DE QWEN PARA THE GENERATOR
export class QwenGeneratorService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env?.VITE_API_BASE || "https://68edd79f78d7cef650777246--son1k.netlify.app/.netlify/functions";
  }

  // 📝 GENERAR LETRAS ESTRUCTURADAS CON PERILLAS LITERARIAS
  async generateStructuredLyrics(request: LyricsRequest): Promise<LyricsResponse> {
    try {
      const clientId = clientManager.getClientId();
      
      const response = await fetch(`${this.baseUrl}/structured-lyrics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': clientId,
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`Error generando letras: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en generateStructuredLyrics:', error);
      throw error;
    }
  }

  // 🎛️ GENERAR PROMPTS INTELIGENTES PARA THE GENERATOR
  async generateIntelligentPrompts(request: GeneratorPromptRequest): Promise<GeneratorPromptResponse> {
    try {
      const clientId = clientManager.getClientId();
      
      const response = await fetch(`${this.baseUrl}/generator-prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': clientId,
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`Error generando prompts: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en generateIntelligentPrompts:', error);
      throw error;
    }
  }

  // 🎵 GENERAR LETRAS SIMPLES CON QWEN
  async generateLyrics(request: {
    prompt: string;
    style: string;
    genre: string;
    mood: string;
    language: 'es' | 'en';
    length: 'short' | 'medium' | 'long';
    userId: string;
  }): Promise<string> {
    try {
      const clientId = clientManager.getClientId();
      
      const response = await fetch(`${this.baseUrl}/qwen-lyrics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': clientId,
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`Error generando letras: ${response.status}`);
      }

      const data = await response.json();
      return data.lyrics;
    } catch (error) {
      console.error('Error en generateLyrics:', error);
      throw error;
    }
  }

  // 🔄 CONVERTIR PERILLAS DE CONTROL A PERILLAS LITERARIAS
  convertControlKnobsToLiterary(
    tempo: number,
    energy: number, 
    creativity: number
  ): LiteraryKnobs {
    return {
      narrativeDepth: Math.round((tempo / 200) * 100), // Tempo más alto = más narrativa
      emotionalIntensity: energy, // Energía directa
      poeticComplexity: creativity, // Creatividad directa
      metaphorUsage: Math.round((creativity * 0.8) + (energy * 0.2)), // Más creatividad = más metáforas
      rhymeDensity: Math.round((tempo / 200) * 60 + (energy * 0.3)), // Tempo y energía influyen en rimas
      storyArc: Math.round((tempo / 200) * 80 + (creativity * 0.2)), // Tempo influye en desarrollo narrativo
      characterDevelopment: Math.round((creativity * 0.7) + (energy * 0.3)), // Creatividad para personajes
      thematicConsistency: Math.round(100 - (creativity * 0.3) + (tempo / 200) * 30) // Menos creatividad = más consistencia
    };
  }

  // 🎯 CONVERTIR PERILLAS A NIVEL DE CREATIVIDAD
  convertCreativityToLevel(creativity: number): 'conservative' | 'moderate' | 'creative' | 'experimental' {
    if (creativity < 25) return 'conservative';
    if (creativity < 50) return 'moderate';
    if (creativity < 75) return 'creative';
    return 'experimental';
  }
}

// 🚀 INSTANCIA SINGLETON
export const qwenGeneratorService = new QwenGeneratorService();
