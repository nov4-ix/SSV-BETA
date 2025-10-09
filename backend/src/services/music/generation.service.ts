import { prisma } from '@/config/database.config';
import { GenerationStatus } from '@prisma/client';
import { 
  ValidationError, 
  RateLimitError,
  ServiceUnavailableError 
} from '@/utils/errors';
import { logger } from '@/utils/logger';
import { sunoAIService } from '@/services/ai/suno.service';

interface GenerationRequest {
  userId: string;
  prompt: string;
  duration: number;
  genre?: string;
  mood?: string;
  tempo?: number;
  key?: string;
  instruments?: string[];
  style?: string;
}

interface GenerationResult {
  generationId: string;
  status: GenerationStatus;
  estimatedCompletionTime?: number;
}

export class MusicGenerationService {
  private readonly maxDuration = 300; // 5 minutes
  private readonly minDuration = 5;   // 5 seconds
  
  async initiateGeneration(request: GenerationRequest): Promise<GenerationResult> {
    // Validate duration
    if (request.duration < this.minDuration || request.duration > this.maxDuration) {
      throw new ValidationError(
        `Duration must be between ${this.minDuration} and ${this.maxDuration} seconds`
      );
    }
    
    // Check user limits
    await this.validateUserLimits(request.userId);
    
    // Create generation record
    const generation = await prisma.generation.create({
      data: {
        userId: request.userId,
        prompt: request.prompt,
        duration: request.duration,
        genre: request.genre,
        mood: request.mood,
        tempo: request.tempo,
        key: request.key,
        instruments: request.instruments || [],
        style: request.style,
        status: GenerationStatus.PENDING,
      },
    });
    
    // Increment user's generation count
    await prisma.user.update({
      where: { id: request.userId },
      data: {
        generationsUsedThisMonth: {
          increment: 1,
        },
      },
    });
    
    // Start Suno AI generation
    try {
      const sunoResult = await sunoAIService.generateMusic({
        prompt: request.prompt,
        duration: request.duration,
        genre: request.genre,
        mood: request.mood,
        tempo: request.tempo,
        key: request.key,
        instruments: request.instruments,
        style: request.style,
      });

      // Update generation with Suno AI response
      await prisma.generation.update({
        where: { id: generation.id },
        data: {
          status: sunoResult.status === 'completed' ? GenerationStatus.COMPLETED : GenerationStatus.PROCESSING,
          audioUrl: sunoResult.audioUrl,
          waveformUrl: sunoResult.waveformUrl,
          processingStartedAt: new Date(),
          ...(sunoResult.status === 'completed' && { processingCompletedAt: new Date() }),
        },
      });

      // If completed immediately, create track
      if (sunoResult.status === 'completed' && sunoResult.audioUrl) {
        await this.createTrackFromGeneration(generation.id, sunoResult);
      }

    } catch (error) {
      // Update generation with error
      await prisma.generation.update({
        where: { id: generation.id },
        data: {
          status: GenerationStatus.FAILED,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          processingCompletedAt: new Date(),
        },
      });
      throw error;
    }
    
    logger.info(
      { generationId: generation.id, userId: request.userId },
      'Generation initiated'
    );
    
    // Estimate completion time (adjust based on actual processing time)
    const estimatedTime = this.estimateCompletionTime(request.duration);
    
    return {
      generationId: generation.id,
      status: generation.status,
      estimatedCompletionTime: estimatedTime,
    };
  }
  
  async getGenerationStatus(generationId: string, userId: string) {
    const generation = await prisma.generation.findFirst({
      where: {
        id: generationId,
        userId,
      },
      include: {
        track: {
          select: {
            id: true,
            title: true,
            audioUrl: true,
            duration: true,
          },
        },
      },
    });
    
    if (!generation) {
      throw new NotFoundError('Generation');
    }
    
    return generation;
  }
  
  async listUserGenerations(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      status?: GenerationStatus;
    } = {}
  ) {
    const { limit = 20, offset = 0, status } = options;
    
    const [generations, total] = await Promise.all([
      prisma.generation.findMany({
        where: {
          userId,
          ...(status && { status }),
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
        include: {
          track: {
            select: {
              id: true,
              title: true,
              audioUrl: true,
              thumbnailUrl: true,
            },
          },
        },
      }),
      prisma.generation.count({
        where: {
          userId,
          ...(status && { status }),
        },
      }),
    ]);
    
    return {
      generations,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    };
  }
  
  async cancelGeneration(generationId: string, userId: string): Promise<void> {
    const generation = await prisma.generation.findFirst({
      where: {
        id: generationId,
        userId,
      },
    });
    
    if (!generation) {
      throw new NotFoundError('Generation');
    }
    
    if (generation.status === GenerationStatus.COMPLETED) {
      throw new ValidationError('Cannot cancel completed generation');
    }
    
    if (generation.status === GenerationStatus.FAILED) {
      throw new ValidationError('Cannot cancel failed generation');
    }
    
    await prisma.generation.update({
      where: { id: generationId },
      data: { status: GenerationStatus.CANCELLED },
    });
    
    // TODO: Cancel queue job if still pending
    
    logger.info({ generationId, userId }, 'Generation cancelled');
  }
  
  private async validateUserLimits(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        generationsUsedThisMonth: true,
        generationsLimit: true,
        subscriptionTier: true,
      },
    });
    
    if (!user) {
      throw new ValidationError('User not found');
    }
    
    if (user.generationsUsedThisMonth >= user.generationsLimit) {
      throw new RateLimitError(
        `Monthly generation limit reached (${user.generationsLimit}). Upgrade your plan for more.`
      );
    }
  }
  
  private async createTrackFromGeneration(generationId: string, sunoResult: any): Promise<void> {
    const generation = await prisma.generation.findUnique({
      where: { id: generationId },
      include: { user: true },
    });

    if (!generation) return;

    await prisma.track.create({
      data: {
        title: `Generated Track - ${generation.prompt.substring(0, 50)}...`,
        description: `AI-generated music: ${generation.prompt}`,
        audioUrl: sunoResult.audioUrl!,
        waveformUrl: sunoResult.waveformUrl,
        duration: sunoResult.duration || generation.duration,
        format: 'mp3',
        fileSize: 0, // Will be updated when file is processed
        genre: generation.genre,
        mood: generation.mood,
        tempo: generation.tempo,
        key: generation.key,
        tags: generation.instruments,
        status: 'COMPLETED',
        userId: generation.userId,
        generationId: generation.id,
      },
    });
  }

  private estimateCompletionTime(durationSeconds: number): number {
    // Suno AI typically takes 30-60 seconds for most generations
    return Math.min(60, Math.max(30, durationSeconds * 0.5));
  }
}

export const musicGenerationService = new MusicGenerationService();
