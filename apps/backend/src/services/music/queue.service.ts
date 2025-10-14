/**
 * 🔄 QUEUE SERVICE - Servicio de Cola para Generación Musical
 */

import { Queue, Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { config } from '../../config';
import { musicGenerationService } from './generation.service';
import { logger } from '../../utils/logger';

const prisma = new PrismaClient();

export interface GenerationJobData {
  generationId: string;
  request: {
    prompt: string;
    style?: string;
    title?: string;
    model?: string;
    customMode?: boolean;
    instrumental?: boolean;
    lyrics?: string;
    gender?: string;
    duration?: number;
  };
}

export class QueueService {
  private generationQueue: Queue<GenerationJobData>;
  private generationWorker: Worker<GenerationJobData>;

  constructor() {
    // Initialize generation queue
    this.generationQueue = new Queue<GenerationJobData>('generation', {
      connection: {
        host: config.database.redis.url,
      },
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    });

    // Initialize generation worker
    this.generationWorker = new Worker<GenerationJobData>(
      'generation',
      this.processGenerationJob.bind(this),
      {
        connection: {
          host: config.database.redis.url,
        },
        concurrency: 5,
      }
    );

    // Setup event listeners
    this.setupEventListeners();
  }

  /**
   * Add generation job to queue
   */
  async addGenerationJob(
    generationId: string,
    request: GenerationJobData['request']
  ): Promise<void> {
    const jobData: GenerationJobData = {
      generationId,
      request,
    };

    await this.generationQueue.add('generate-music', jobData, {
      priority: this.getJobPriority(request),
      delay: 0,
    });

    logger.info(`Added generation job for ${generationId}`);
  }

  /**
   * Process generation job
   */
  private async processGenerationJob(job: Job<GenerationJobData>): Promise<void> {
    const { generationId, request } = job.data;

    try {
      logger.info(`Processing generation job ${generationId}`);

      // Process the generation
      await musicGenerationService.processGeneration(generationId, request);

      // Update usage stats
      const generation = await prisma.generation.findUnique({
        where: { id: generationId },
        include: { user: true },
      });

      if (generation) {
        await musicGenerationService.updateUsageStats(generation.userId);
      }

      logger.info(`Successfully processed generation ${generationId}`);
    } catch (error) {
      logger.error(`Failed to process generation ${generationId}:`, error);
      throw error;
    }
  }

  /**
   * Get job priority based on user tier
   */
  private getJobPriority(request: GenerationJobData['request']): number {
    // Priority levels:
    // 1 = Highest (Enterprise)
    // 2 = High (Pro)
    // 3 = Medium (Starter)
    // 4 = Low (Free)

    // For now, return medium priority
    // In a real implementation, you'd check user tier
    return 3;
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Generation queue events
    this.generationQueue.on('completed', (job) => {
      logger.info(`Generation job ${job.id} completed`);
    });

    this.generationQueue.on('failed', (job, err) => {
      logger.error(`Generation job ${job?.id} failed:`, err);
    });

    this.generationQueue.on('stalled', (job) => {
      logger.warn(`Generation job ${job.id} stalled`);
    });

    // Generation worker events
    this.generationWorker.on('completed', (job) => {
      logger.info(`Worker completed job ${job.id}`);
    });

    this.generationWorker.on('failed', (job, err) => {
      logger.error(`Worker failed job ${job?.id}:`, err);
    });

    this.generationWorker.on('error', (err) => {
      logger.error('Worker error:', err);
    });
  }

  /**
   * Get queue status
   */
  async getQueueStatus() {
    const [waiting, active, completed, failed] = await Promise.all([
      this.generationQueue.getWaiting(),
      this.generationQueue.getActive(),
      this.generationQueue.getCompleted(),
      this.generationQueue.getFailed(),
    ]);

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      total: waiting.length + active.length + completed.length + failed.length,
    };
  }

  /**
   * Get job by ID
   */
  async getJob(jobId: string) {
    return await this.generationQueue.getJob(jobId);
  }

  /**
   * Cancel job
   */
  async cancelJob(jobId: string): Promise<boolean> {
    const job = await this.generationQueue.getJob(jobId);
    if (job) {
      await job.remove();
      return true;
    }
    return false;
  }

  /**
   * Pause queue
   */
  async pauseQueue(): Promise<void> {
    await this.generationQueue.pause();
  }

  /**
   * Resume queue
   */
  async resumeQueue(): Promise<void> {
    await this.generationQueue.resume();
  }

  /**
   * Clean old jobs
   */
  async cleanOldJobs(): Promise<void> {
    await this.generationQueue.clean(24 * 60 * 60 * 1000, 100); // Clean jobs older than 24 hours
  }

  /**
   * Get queue metrics
   */
  async getQueueMetrics() {
    const status = await this.getQueueStatus();
    const processingRate = await this.getProcessingRate();

    return {
      ...status,
      processingRate,
      avgWaitTime: await this.getAverageWaitTime(),
      successRate: status.total > 0 ? (status.completed / status.total) * 100 : 0,
    };
  }

  /**
   * Get processing rate (jobs per minute)
   */
  private async getProcessingRate(): Promise<number> {
    const completed = await this.generationQueue.getCompleted();
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);

    const recentJobs = completed.filter(job => {
      const jobTime = job.processedOn || 0;
      return jobTime > oneHourAgo;
    });

    return recentJobs.length / 60; // Jobs per minute
  }

  /**
   * Get average wait time
   */
  private async getAverageWaitTime(): Promise<number> {
    const completed = await this.generationQueue.getCompleted();
    
    if (completed.length === 0) {
      return 0;
    }

    const totalWaitTime = completed.reduce((sum, job) => {
      const waitTime = (job.processedOn || 0) - (job.timestamp || 0);
      return sum + waitTime;
    }, 0);

    return totalWaitTime / completed.length;
  }

  /**
   * Close queue connections
   */
  async close(): Promise<void> {
    await this.generationWorker.close();
    await this.generationQueue.close();
  }
}

export const queueService = new QueueService();
