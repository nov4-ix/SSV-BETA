/**
 * 🎵 MUSIC GENERATION SERVICE - Servicio de Generación Musical
 */

import { PrismaClient, Generation, GenerationStatus, User } from '@prisma/client';
import { config } from '../../config';
import { AppError } from '../../utils/errors';
import { QueueService } from './queue.service';

const prisma = new PrismaClient();

export interface GenerationRequest {
  prompt: string;
  style?: string;
  title?: string;
  model?: string;
  customMode?: boolean;
  instrumental?: boolean;
  lyrics?: string;
  gender?: string;
  duration?: number;
}

export interface GenerationResponse {
  id: string;
  status: GenerationStatus;
  audioUrl?: string;
  imageUrl?: string;
  metadata?: any;
  estimatedTime?: number;
}

export interface SunoGenerateRequest {
  prompt: string;
  style?: string;
  title?: string;
  custom_mode?: boolean;
  instrumental?: boolean;
  lyrics?: string;
  gender?: string;
}

export interface SunoGenerateResponse {
  success: boolean;
  data?: {
    taskId: string;
    songs?: Array<{
      id: string;
      title: string;
      audio_url: string;
      stream_audio_url?: string;
      image_url: string;
      duration: number;
      model_name: string;
      createTime: string;
    }>;
  };
  error?: string;
}

export class MusicGenerationService {
  private queueService: QueueService;

  constructor() {
    this.queueService = new QueueService();
  }

  /**
   * Create a new music generation request
   */
  async createGeneration(
    userId: string,
    request: GenerationRequest
  ): Promise<GenerationResponse> {
    // Check user tier limits
    await this.checkUserLimits(userId);

    // Create generation record
    const generation = await prisma.generation.create({
      data: {
        userId,
        prompt: request.prompt,
        style: request.style,
        title: request.title || `Generated Track ${Date.now()}`,
        model: request.model || 'chirp-v3',
        duration: request.duration,
        status: 'PENDING',
        metadata: {
          customMode: request.customMode,
          instrumental: request.instrumental,
          lyrics: request.lyrics,
          gender: request.gender,
        },
      },
    });

    // Add to queue for processing
    await this.queueService.addGenerationJob(generation.id, request);

    return {
      id: generation.id,
      status: generation.status,
      estimatedTime: this.getEstimatedTime(request),
    };
  }

  /**
   * Get generation status
   */
  async getGenerationStatus(generationId: string): Promise<GenerationResponse> {
    const generation = await prisma.generation.findUnique({
      where: { id: generationId },
    });

    if (!generation) {
      throw new AppError(404, 'Generation not found');
    }

    return {
      id: generation.id,
      status: generation.status,
      audioUrl: generation.audioUrl,
      imageUrl: generation.imageUrl,
      metadata: generation.metadata,
    };
  }

  /**
   * Get user's generations
   */
  async getUserGenerations(
    userId: string,
    limit = 20,
    offset = 0
  ): Promise<Generation[]> {
    return await prisma.generation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Delete generation
   */
  async deleteGeneration(generationId: string, userId: string): Promise<void> {
    const generation = await prisma.generation.findFirst({
      where: {
        id: generationId,
        userId,
      },
    });

    if (!generation) {
      throw new AppError(404, 'Generation not found');
    }

    await prisma.generation.delete({
      where: { id: generationId },
    });
  }

  /**
   * Process generation with Suno AI
   */
  async processGeneration(
    generationId: string,
    request: GenerationRequest
  ): Promise<void> {
    try {
      // Update status to processing
      await prisma.generation.update({
        where: { id: generationId },
        data: { status: 'PROCESSING' },
      });

      // Call Suno AI API
      const sunoResponse = await this.callSunoAPI(request);

      if (sunoResponse.success && sunoResponse.data?.songs?.length > 0) {
        const song = sunoResponse.data.songs[0];

        // Update generation with results
        await prisma.generation.update({
          where: { id: generationId },
          data: {
            status: 'COMPLETED',
            audioUrl: song.stream_audio_url || song.audio_url,
            imageUrl: song.image_url,
            duration: song.duration,
            metadata: {
              ...request,
              sunoData: {
                id: song.id,
                title: song.title,
                modelName: song.model_name,
                createTime: song.createTime,
              },
            },
          },
        });
      } else {
        throw new AppError(500, sunoResponse.error || 'Generation failed');
      }
    } catch (error) {
      // Update status to failed
      await prisma.generation.update({
        where: { id: generationId },
        data: {
          status: 'FAILED',
          metadata: {
            ...request,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        },
      });

      throw error;
    }
  }

  /**
   * Call Suno AI API
   */
  private async callSunoAPI(request: GenerationRequest): Promise<SunoGenerateResponse> {
    const sunoRequest: SunoGenerateRequest = {
      prompt: request.prompt,
      style: request.style,
      title: request.title,
      custom_mode: request.customMode,
      instrumental: request.instrumental,
      lyrics: request.lyrics,
      gender: request.gender,
    };

    try {
      const response = await fetch(`${config.suno.baseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': config.suno.apiKey || '',
        },
        body: JSON.stringify(sunoRequest),
      });

      if (!response.ok) {
        throw new AppError(response.status, `Suno API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, 'Failed to call Suno API');
    }
  }

  /**
   * Poll Suno AI for generation status
   */
  async pollGenerationStatus(taskId: string): Promise<SunoGenerateResponse> {
    try {
      const response = await fetch(`${config.suno.pollingUrl}/get_mj_status/${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': config.suno.apiKey || '',
        },
      });

      if (!response.ok) {
        throw new AppError(response.status, `Suno polling error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, 'Failed to poll Suno API');
    }
  }

  /**
   * Check user tier limits
   */
  private async checkUserLimits(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        generations: true, // Para contar generaciones totales
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const tier = user.subscription?.tier || 'FREE';
    const tierLimits = this.getTierLimits(tier);

    // Para usuarios FREE: verificar límite total de generaciones
    if (tier === 'FREE') {
      const totalGenerations = user.generations.length;
      if (totalGenerations >= tierLimits.totalGenerations) {
        throw new AppError(429, 'Total generation limit reached. Upgrade to PRO for more generations.');
      }
      return; // No verificar límites diarios para FREE
    }

    // Para usuarios de pago: verificar límites diarios
    const todayUsage = await prisma.usageStats.findFirst({
      where: {
        userId,
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    const todayGenerations = todayUsage?.generationsUsed || 0;
    if (tierLimits.dailyGenerations !== -1 && todayGenerations >= tierLimits.dailyGenerations) {
      throw new AppError(429, 'Daily generation limit reached');
    }
  }

  /**
   * Get tier limits (Modelo 3-4-5 corregido)
   */
  private getTierLimits(tier: string) {
    const limits = {
      FREE: {
        totalGenerations: 5, // Solo 5 generaciones en total
        dailyGenerations: -1, // Sin límite diario
        monthlyGenerations: -1, // Sin límite mensual
        maxDuration: 30,
        downloads: 0, // No pueden descargar
        shares: 5, // Solo compartir con marca de agua
        tools: ['pixel-basic'], // Solo acceso básico a pixel
        features: ['basic-generation', 'watermark-share'],
      },
      PRO: {
        dailyGenerations: 4,
        monthlyGenerations: 120,
        maxDuration: 60,
        downloads: 10,
        shares: 5,
        tools: ['music-generator', 'ghost-studio', 'nova-post'],
        features: ['basic-generation', 'lyrics', 'projects', 'marketing'],
      },
      PREMIUM: {
        dailyGenerations: 5,
        monthlyGenerations: 150,
        maxDuration: 120,
        downloads: 25,
        shares: 15,
        tools: ['music-generator', 'ghost-studio', 'nova-post', 'sanctuary-social', 'nexus-visual'],
        features: ['basic-generation', 'lyrics', 'projects', 'marketing', 'collaboration', 'nexus-mode'],
      },
      ENTERPRISE: {
        dailyGenerations: -1, // unlimited
        monthlyGenerations: -1,
        maxDuration: -1,
        downloads: -1,
        shares: -1,
        tools: ['all'],
        features: ['all'],
      },
    };

    return limits[tier as keyof typeof limits] || limits.FREE;
  }

  /**
   * Get estimated generation time
   */
  private getEstimatedTime(request: GenerationRequest): number {
    // Base time: 30 seconds
    let estimatedTime = 30;

    // Add time for custom mode
    if (request.customMode) {
      estimatedTime += 15;
    }

    // Add time for lyrics
    if (request.lyrics) {
      estimatedTime += 10;
    }

    // Add time for longer duration
    if (request.duration && request.duration > 60) {
      estimatedTime += Math.floor(request.duration / 60) * 10;
    }

    return estimatedTime;
  }

  /**
   * Update usage stats
   */
  async updateUsageStats(userId: string): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.usageStats.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      update: {
        generationsUsed: {
          increment: 1,
        },
      },
      create: {
        userId,
        date: today,
        generationsUsed: 1,
      },
    });
  }

  /**
   * Get generation analytics
   */
  async getGenerationAnalytics(userId?: string) {
    const where = userId ? { userId } : {};

    const [total, completed, failed, pending] = await Promise.all([
      prisma.generation.count({ where }),
      prisma.generation.count({ where: { ...where, status: 'COMPLETED' } }),
      prisma.generation.count({ where: { ...where, status: 'FAILED' } }),
      prisma.generation.count({ where: { ...where, status: 'PENDING' } }),
    ]);

    const avgDuration = await prisma.generation.aggregate({
      where: { ...where, status: 'COMPLETED', duration: { not: null } },
      _avg: { duration: true },
    });

    return {
      total,
      completed,
      failed,
      pending,
      successRate: total > 0 ? (completed / total) * 100 : 0,
      avgDuration: avgDuration._avg.duration || 0,
    };
  }
}

export const musicGenerationService = new MusicGenerationService();
