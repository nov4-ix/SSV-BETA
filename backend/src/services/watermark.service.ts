import { SubscriptionTier } from '@prisma/client';
import { LimitsService } from '@/services/limits.service';

/**
 * 🎨 SERVICIO DE MARCAS DE AGUA SON1KVERSE
 * 
 * Servicio para aplicar marcas de agua a las pistas generadas
 * según el tier de suscripción del usuario
 */

export interface WatermarkConfig {
  text: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  backgroundColor?: string;
  padding?: number;
}

export interface TrackMetadata {
  title: string;
  artist: string;
  duration: number;
  genre?: string;
  bpm?: number;
  key?: string;
}

export class WatermarkService {
  private static readonly WATERMARK_CONFIGS: Record<SubscriptionTier, WatermarkConfig> = {
    FREE: {
      text: 'Creado con Son1kverse',
      position: 'bottom-right',
      opacity: 0.8,
      fontSize: 14,
      color: '#00FFE7',
      fontFamily: 'JetBrains Mono, monospace',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: 8
    },
    STARTER: {
      text: 'Son1kverse Starter',
      position: 'bottom-right',
      opacity: 0.6,
      fontSize: 12,
      color: '#B84DFF',
      fontFamily: 'JetBrains Mono, monospace',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      padding: 6
    },
    PRO: {
      text: '', // Sin marca de agua para PRO
      position: 'bottom-right',
      opacity: 0,
      fontSize: 0,
      color: '#000000',
      fontFamily: 'JetBrains Mono, monospace'
    },
    ENTERPRISE: {
      text: '', // Sin marca de agua para ENTERPRISE
      position: 'bottom-right',
      opacity: 0,
      fontSize: 0,
      color: '#000000',
      fontFamily: 'JetBrains Mono, monospace'
    }
  };

  /**
   * Obtener configuración de marca de agua para un tier
   */
  static getWatermarkConfig(tier: SubscriptionTier): WatermarkConfig {
    return this.WATERMARK_CONFIGS[tier];
  }

  /**
   * Verificar si se requiere marca de agua
   */
  static requiresWatermark(tier: SubscriptionTier): boolean {
    return LimitsService.requiresWatermark(tier);
  }

  /**
   * Aplicar marca de agua a una pista
   */
  static async applyWatermarkToTrack(
    audioUrl: string,
    tier: SubscriptionTier,
    metadata: TrackMetadata
  ): Promise<{
    originalUrl: string;
    watermarkedUrl?: string;
    watermarkConfig?: WatermarkConfig;
    requiresWatermark: boolean;
  }> {
    const requiresWatermark = this.requiresWatermark(tier);
    
    if (!requiresWatermark) {
      return {
        originalUrl: audioUrl,
        requiresWatermark: false
      };
    }

    const watermarkConfig = this.getWatermarkConfig(tier);
    
    // En un entorno real, aquí se aplicaría la marca de agua al audio
    // Por ahora, simulamos el proceso
    const watermarkedUrl = await this.processAudioWithWatermark(
      audioUrl,
      watermarkConfig,
      metadata
    );

    return {
      originalUrl: audioUrl,
      watermarkedUrl,
      watermarkConfig,
      requiresWatermark: true
    };
  }

  /**
   * Procesar audio con marca de agua (simulado)
   */
  private static async processAudioWithWatermark(
    audioUrl: string,
    config: WatermarkConfig,
    metadata: TrackMetadata
  ): Promise<string> {
    // En un entorno real, aquí se usaría FFmpeg o similar para:
    // 1. Cargar el archivo de audio
    // 2. Aplicar la marca de agua como overlay
    // 3. Generar un nuevo archivo con marca de agua
    // 4. Subir el archivo procesado a un CDN
    
    console.log(`🎨 Aplicando marca de agua: "${config.text}"`);
    console.log(`📊 Configuración:`, config);
    console.log(`🎵 Metadata:`, metadata);
    
    // Simular URL del archivo con marca de agua
    const watermarkedUrl = audioUrl.replace('.mp3', '_watermarked.mp3');
    
    return watermarkedUrl;
  }

  /**
   * Generar marca de agua personalizada para compartir en redes sociales
   */
  static generateSocialWatermark(
    tier: SubscriptionTier,
    trackInfo: {
      title: string;
      artist: string;
      platform: 'instagram' | 'twitter' | 'tiktok' | 'youtube';
    }
  ): {
    text: string;
    hashtags: string[];
    watermarkText: string;
  } {
    const baseHashtags = ['#Son1kverse', '#AIMusic', '#MusicGeneration'];
    
    let watermarkText = '';
    let additionalHashtags: string[] = [];
    
    switch (tier) {
      case 'FREE':
        watermarkText = '🎵 Creado con Son1kverse';
        additionalHashtags = ['#FreeMusic', '#AICreated'];
        break;
      case 'STARTER':
        watermarkText = '🎵 Son1kverse Starter';
        additionalHashtags = ['#StarterMusic', '#AICreated'];
        break;
      case 'PRO':
        watermarkText = '🎵 Son1kverse Pro';
        additionalHashtags = ['#ProMusic', '#PremiumAI'];
        break;
      case 'ENTERPRISE':
        watermarkText = '🎵 Son1kverse Enterprise';
        additionalHashtags = ['#EnterpriseMusic', '#ProfessionalAI'];
        break;
    }

    // Personalizar según la plataforma
    const platformHashtags = {
      instagram: ['#Music', '#Creative'],
      twitter: ['#MusicTech', '#Innovation'],
      tiktok: ['#MusicTok', '#Viral'],
      youtube: ['#MusicProduction', '#Tutorial']
    };

    const allHashtags = [
      ...baseHashtags,
      ...additionalHashtags,
      ...platformHashtags[trackInfo.platform]
    ];

    return {
      text: `${trackInfo.title} by ${trackInfo.artist}\n\n${watermarkText}`,
      hashtags: allHashtags,
      watermarkText
    };
  }

  /**
   * Crear overlay visual para redes sociales
   */
  static createSocialOverlay(
    tier: SubscriptionTier,
    trackInfo: {
      title: string;
      artist: string;
      coverImage?: string;
    }
  ): {
    overlayConfig: {
      backgroundColor: string;
      textColor: string;
      logoUrl: string;
      position: string;
    };
    socialText: string;
  } {
    const tierColors = {
      FREE: { bg: '#1a1a1a', text: '#00FFE7' },
      STARTER: { bg: '#2a1a3a', text: '#B84DFF' },
      PRO: { bg: '#1a2a3a', text: '#9A9AFF' },
      ENTERPRISE: { bg: '#2a3a1a', text: '#FFD700' }
    };

    const colors = tierColors[tier];

    return {
      overlayConfig: {
        backgroundColor: colors.bg,
        textColor: colors.text,
        logoUrl: 'https://son1kverse.com/logo.png',
        position: 'bottom-right'
      },
      socialText: `${trackInfo.title} by ${trackInfo.artist} - Creado con Son1kverse`
    };
  }

  /**
   * Verificar si una URL tiene marca de agua
   */
  static hasWatermark(audioUrl: string): boolean {
    return audioUrl.includes('_watermarked') || audioUrl.includes('watermark');
  }

  /**
   * Obtener URL original sin marca de agua (solo para usuarios PRO+)
   */
  static getOriginalUrl(
    watermarkedUrl: string,
    userTier: SubscriptionTier
  ): string | null {
    if (LimitsService.canDownloadTracks(userTier)) {
      return watermarkedUrl.replace('_watermarked', '').replace('watermark', '');
    }
    
    return null; // Usuario FREE no puede acceder a URL original
  }

  /**
   * Generar código de compartir para redes sociales
   */
  static generateShareCode(
    tier: SubscriptionTier,
    trackData: {
      id: string;
      title: string;
      artist: string;
      audioUrl: string;
      coverImage?: string;
    }
  ): {
    instagram: string;
    twitter: string;
    tiktok: string;
    youtube: string;
    directLink: string;
  } {
    const baseUrl = 'https://son1kverse.com/track';
    const trackUrl = `${baseUrl}/${trackData.id}`;
    
    const socialWatermark = this.generateSocialWatermark(tier, {
      title: trackData.title,
      artist: trackData.artist,
      platform: 'instagram' // Base para todas las plataformas
    });

    return {
      instagram: `🎵 ${trackData.title} by ${trackData.artist}\n\n${socialWatermark.watermarkText}\n\n${socialWatermark.hashtags.join(' ')}\n\nEscucha aquí: ${trackUrl}`,
      
      twitter: `🎵 ${trackData.title} by ${trackData.artist} - Creado con Son1kverse\n\n${socialWatermark.hashtags.join(' ')}\n\n${trackUrl}`,
      
      tiktok: `🎵 ${trackData.title} by ${trackData.artist}\n\n${socialWatermark.watermarkText}\n\n#MusicTok #Viral\n\n${trackUrl}`,
      
      youtube: `🎵 ${trackData.title} by ${trackData.artist}\n\nCreado con Son1kverse - Plataforma de música con IA\n\n${socialWatermark.hashtags.join(' ')}\n\n${trackUrl}`,
      
      directLink: trackUrl
    };
  }
}
