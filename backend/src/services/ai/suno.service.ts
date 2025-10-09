import { config } from '@/config';
import { logger } from '@/utils/logger';
import { ServiceUnavailableError, ValidationError } from '@/utils/errors';

interface SunoGenerationRequest {
  prompt: string;
  duration: number;
  genre?: string;
  mood?: string;
  tempo?: number;
  key?: string;
  instruments?: string[];
  style?: string;
}

interface SunoGenerationResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  audioUrl?: string;
  waveformUrl?: string;
  duration?: number;
  error?: string;
}

export class SunoAIService {
  private readonly baseUrl = 'https://api.suno.ai/v1';
  private readonly apiKey: string;

  constructor() {
    this.apiKey = config.ai.apiKey || '';
    if (!this.apiKey) {
      logger.warn('Suno API key not configured');
    }
  }

  async generateMusic(request: SunoGenerationRequest): Promise<SunoGenerationResponse> {
    if (!this.apiKey) {
      throw new ServiceUnavailableError('Suno AI service not configured');
    }

    try {
      logger.info({ request }, 'Initiating Suno AI music generation');

      const response = await fetch(`${this.baseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: request.prompt,
          duration: request.duration,
          genre: request.genre,
          mood: request.mood,
          tempo: request.tempo,
          key: request.key,
          instruments: request.instruments,
          style: request.style,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ServiceUnavailableError(
          `Suno AI API error: ${response.status} - ${errorData.message || response.statusText}`
        );
      }

      const result = await response.json();
      
      logger.info({ generationId: result.id }, 'Suno AI generation initiated successfully');
      
      return {
        id: result.id,
        status: result.status,
        audioUrl: result.audio_url,
        waveformUrl: result.waveform_url,
        duration: result.duration,
        error: result.error,
      };

    } catch (error) {
      logger.error({ error, request }, 'Suno AI generation failed');
      
      if (error instanceof ServiceUnavailableError) {
        throw error;
      }
      
      throw new ServiceUnavailableError('Failed to generate music with Suno AI');
    }
  }

  async getGenerationStatus(generationId: string): Promise<SunoGenerationResponse> {
    if (!this.apiKey) {
      throw new ServiceUnavailableError('Suno AI service not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/generations/${generationId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new ValidationError('Generation not found');
        }
        throw new ServiceUnavailableError(`Suno AI API error: ${response.status}`);
      }

      const result = await response.json();
      
      return {
        id: result.id,
        status: result.status,
        audioUrl: result.audio_url,
        waveformUrl: result.waveform_url,
        duration: result.duration,
        error: result.error,
      };

    } catch (error) {
      logger.error({ error, generationId }, 'Failed to get Suno AI generation status');
      
      if (error instanceof ValidationError) {
        throw error;
      }
      
      throw new ServiceUnavailableError('Failed to get generation status from Suno AI');
    }
  }

  async cancelGeneration(generationId: string): Promise<void> {
    if (!this.apiKey) {
      throw new ServiceUnavailableError('Suno AI service not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/generations/${generationId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new ServiceUnavailableError(`Failed to cancel generation: ${response.status}`);
      }

      logger.info({ generationId }, 'Suno AI generation cancelled successfully');

    } catch (error) {
      logger.error({ error, generationId }, 'Failed to cancel Suno AI generation');
      throw new ServiceUnavailableError('Failed to cancel generation');
    }
  }
}

export const sunoAIService = new SunoAIService();
