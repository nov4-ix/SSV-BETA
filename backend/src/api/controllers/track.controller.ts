import { Request, Response, NextFunction } from 'express';
import { SubscriptionTier } from '@prisma/client';
import { WatermarkService } from '@/services/watermark.service';
import { LimitsService } from '@/services/limits.service';
import { asyncHandler } from '@/utils/async-handler';
import { sendSuccess, sendError } from '@/utils/responses';
import { ForbiddenError } from '@/utils/errors';

/**
 * 🎵 CONTROLADOR DE TRACKS SON1KVERSE
 * 
 * Controlador para manejar descargas, compartir y marcas de agua
 * según el tier de suscripción del usuario
 */

export class TrackController {
  /**
   * Descargar pista (solo PRO+)
   */
  downloadTrack = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { trackId } = req.params;
      const userTier = req.user?.subscriptionTier as SubscriptionTier;
      
      // Verificar permisos de descarga
      const canDownload = LimitsService.canDownloadTracks(userTier);
      
      if (!canDownload) {
        throw new ForbiddenError(
          'Las descargas están disponibles solo para usuarios PRO y superiores. ' +
          'Los usuarios FREE pueden compartir pistas con marca de agua de Son1kverse.'
        );
      }

      // Obtener información de la pista
      const trackData = await this.getTrackData(trackId);
      
      if (!trackData) {
        return sendError(res, 404, 'Pista no encontrada');
      }

      // Para usuarios PRO+, devolver URL original sin marca de agua
      const downloadUrl = await this.generateDownloadUrl(trackData, userTier);
      
      sendSuccess(res, {
        trackId,
        title: trackData.title,
        artist: trackData.artist,
        downloadUrl,
        expiresIn: 3600, // 1 hora
        tier: userTier,
        watermarkApplied: false
      }, 200, 'Descarga autorizada');
    }
  );

  /**
   * Compartir pista (todos los tiers)
   */
  shareTrack = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { trackId } = req.params;
      const { platform } = req.body;
      const userTier = req.user?.subscriptionTier as SubscriptionTier;
      
      // Obtener información de la pista
      const trackData = await this.getTrackData(trackId);
      
      if (!trackData) {
        return sendError(res, 404, 'Pista no encontrada');
      }

      // Aplicar marca de agua si es requerida
      const watermarkResult = await WatermarkService.applyWatermarkToTrack(
        trackData.audioUrl,
        userTier,
        {
          title: trackData.title,
          artist: trackData.artist,
          duration: trackData.duration
        }
      );

      // Generar códigos de compartir
      const shareCodes = WatermarkService.generateShareCode(userTier, {
        id: trackId,
        title: trackData.title,
        artist: trackData.artist,
        audioUrl: watermarkResult.watermarkedUrl || trackData.audioUrl,
        coverImage: trackData.coverImage
      });

      // Generar overlay visual para redes sociales
      const socialOverlay = WatermarkService.createSocialOverlay(userTier, {
        title: trackData.title,
        artist: trackData.artist,
        coverImage: trackData.coverImage
      });

      sendSuccess(res, {
        trackId,
        title: trackData.title,
        artist: trackData.artist,
        shareCodes,
        socialOverlay,
        watermarkApplied: watermarkResult.requiresWatermark,
        watermarkConfig: watermarkResult.watermarkConfig,
        tier: userTier,
        canDownload: LimitsService.canDownloadTracks(userTier),
        shareUrl: shareCodes.directLink
      }, 200, 'Códigos de compartir generados');
    }
  );

  /**
   * Obtener información de límites del usuario
   */
  getUserLimits = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const userTier = req.user?.subscriptionTier as SubscriptionTier;
      
      const limits = LimitsService.getTierLimits(userTier);
      const theGeneratorLimits = LimitsService.getTheGeneratorLimits(userTier);
      
      sendSuccess(res, {
        tier: userTier,
        permissions: {
          canDownload: LimitsService.canDownloadTracks(userTier),
          requiresWatermark: LimitsService.requiresWatermark(userTier),
          hasQwen2Access: LimitsService.hasQwen2Access(userTier),
          hasPixelAssistant: LimitsService.hasPixelAssistant(userTier)
        },
        limits: {
          general: {
            generations: limits.generations,
            storageGB: limits.storageGB
          },
          theGenerator: theGeneratorLimits,
          features: limits.features
        },
        upgradePrompt: userTier === 'FREE' ? {
          message: 'Actualiza a PRO para descargar pistas sin marca de agua',
          benefits: [
            'Descargas ilimitadas',
            'Sin marca de agua',
            'Pixel Assistant completo',
            'Qwen 2 avanzado',
            'Soporte prioritario'
          ]
        } : null
      }, 200, 'Límites del usuario obtenidos');
    }
  );

  /**
   * Generar URL de vista previa (todos los tiers)
   */
  getTrackPreview = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { trackId } = req.params;
      const userTier = req.user?.subscriptionTier as SubscriptionTier;
      
      // Obtener información de la pista
      const trackData = await this.getTrackData(trackId);
      
      if (!trackData) {
        return sendError(res, 404, 'Pista no encontrada');
      }

      // Aplicar marca de agua si es requerida
      const watermarkResult = await WatermarkService.applyWatermarkToTrack(
        trackData.audioUrl,
        userTier,
        {
          title: trackData.title,
          artist: trackData.artist,
          duration: trackData.duration
        }
      );

      sendSuccess(res, {
        trackId,
        title: trackData.title,
        artist: trackData.artist,
        duration: trackData.duration,
        previewUrl: watermarkResult.watermarkedUrl || trackData.audioUrl,
        watermarkApplied: watermarkResult.requiresWatermark,
        watermarkConfig: watermarkResult.watermarkConfig,
        tier: userTier,
        canDownload: LimitsService.canDownloadTracks(userTier),
        canShare: true
      }, 200, 'Vista previa generada');
    }
  );

  /**
   * Obtener estadísticas de uso del usuario
   */
  getUserUsageStats = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.userId;
      const userTier = req.user?.subscriptionTier as SubscriptionTier;
      
      // Obtener estadísticas de uso del mes actual
      const usageStats = await this.getUserMonthlyUsage(userId);
      
      // Calcular límites restantes
      const limits = LimitsService.getTierLimits(userTier);
      const remainingGenerations = LimitsService.getRemainingGenerations(
        userTier,
        {
          model35: usageStats.model35Used,
          model5: usageStats.model5Used
        }
      );

      const musicGenerationLimits = LimitsService.canGenerateMusic(
        userTier,
        usageStats.musicGenerationsUsed
      );

      sendSuccess(res, {
        tier: userTier,
        currentMonth: new Date().toISOString().substring(0, 7), // YYYY-MM
        usage: {
          generations: {
            model35: {
              used: usageStats.model35Used,
              remaining: remainingGenerations.model35,
              limit: limits.generations.model35
            },
            model5: {
              used: usageStats.model5Used,
              remaining: remainingGenerations.model5,
              limit: limits.generations.model5
            }
          },
          musicGenerations: {
            used: usageStats.musicGenerationsUsed,
            remaining: musicGenerationLimits.remaining,
            limit: limits.son1kverse.theGenerator.musicGenerations
          },
          storage: {
            used: usageStats.storageUsed,
            limit: limits.storageGB
          }
        },
        permissions: {
          canDownload: LimitsService.canDownloadTracks(userTier),
          requiresWatermark: LimitsService.requiresWatermark(userTier),
          hasQwen2Access: LimitsService.hasQwen2Access(userTier),
          hasPixelAssistant: LimitsService.hasPixelAssistant(userTier)
        }
      }, 200, 'Estadísticas de uso obtenidas');
    }
  );

  // === MÉTODOS PRIVADOS ===

  /**
   * Obtener datos de la pista (simulado)
   */
  private async getTrackData(trackId: string) {
    // En un entorno real, esto vendría de la base de datos
    return {
      id: trackId,
      title: 'Track Generado',
      artist: 'Usuario Son1kverse',
      duration: 180, // 3 minutos
      audioUrl: `https://storage.son1kverse.com/tracks/${trackId}.mp3`,
      coverImage: `https://storage.son1kverse.com/covers/${trackId}.jpg`,
      createdAt: new Date(),
      genre: 'Electronic',
      bpm: 128,
      key: 'C Major'
    };
  }

  /**
   * Generar URL de descarga (simulado)
   */
  private async generateDownloadUrl(trackData: any, userTier: SubscriptionTier): Promise<string> {
    // En un entorno real, esto generaría una URL firmada temporal
    const expiresAt = Math.floor(Date.now() / 1000) + 3600; // 1 hora
    const signature = this.generateSignature(trackData.id, expiresAt);
    
    return `https://download.son1kverse.com/track/${trackData.id}?expires=${expiresAt}&signature=${signature}`;
  }

  /**
   * Generar firma para URL de descarga (simulado)
   */
  private generateSignature(trackId: string, expiresAt: number): string {
    // En un entorno real, esto usaría HMAC o similar
    return Buffer.from(`${trackId}:${expiresAt}:secret`).toString('base64');
  }

  /**
   * Obtener estadísticas de uso del usuario (simulado)
   */
  private async getUserMonthlyUsage(userId: string) {
    // En un entorno real, esto vendría de la base de datos
    return {
      model35Used: 2,
      model5Used: 1,
      musicGenerationsUsed: 1,
      storageUsed: 0.5, // GB
      trackAnalysisUsed: 0,
      sanctuaryPostsUsed: 0
    };
  }
}

export const trackController = new TrackController();
