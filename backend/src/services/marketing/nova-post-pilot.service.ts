import { config } from '@/config';
import { logger } from '@/utils/logger';
import { AppError, ServiceUnavailableError } from '@/utils/errors';

// 📱 NOVA POST PILOT - MARKETING MUSICAL AUTOMATIZADO 📱

export interface MarketingContentRequest {
  trackId: string;
  trackName: string;
  genre: string;
  mood: string;
  style: string;
  duration: number;
  artworkUrl?: string;
  targetPlatforms: ('instagram' | 'tiktok' | 'youtube' | 'twitter' | 'facebook')[];
  contentType: 'single' | 'album' | 'ep' | 'mixtape';
}

export interface SocialMediaPost {
  platform: string;
  content: string;
  hashtags: string[];
  imagePrompt?: string;
  videoPrompt?: string;
  optimalPostTime: string;
  engagementScore: number;
}

export interface MarketingCampaign {
  id: string;
  trackId: string;
  trackName: string;
  posts: SocialMediaPost[];
  schedule: Array<{
    platform: string;
    postTime: string;
    content: string;
    status: 'scheduled' | 'posted' | 'failed';
  }>;
  analytics: {
    estimatedReach: number;
    engagementRate: number;
    conversionRate: number;
  };
  createdAt: string;
}

export interface ContentTemplate {
  id: string;
  name: string;
  category: 'announcement' | 'behind_scenes' | 'teaser' | 'release' | 'collaboration';
  template: string;
  variables: string[];
  platforms: string[];
  engagementScore: number;
}

export class NovaPostPilotService {
  private readonly API_ENDPOINT: string;
  private readonly API_KEY: string;

  constructor() {
    this.API_ENDPOINT = config.marketing.novaEndpoint || 'https://api.novapost.ai/v1';
    this.API_KEY = config.marketing.novaApiKey || '';
  }

  // 🎯 GENERAR CONTENIDO DE MARKETING 🎯
  async generateMarketingContent(request: MarketingContentRequest): Promise<MarketingCampaign> {
    logger.info({ 
      trackName: request.trackName, 
      platforms: request.targetPlatforms 
    }, 'Generating marketing content with Nova Post Pilot');

    try {
      const response = await fetch(`${this.API_ENDPOINT}/campaigns/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          track_id: request.trackId,
          track_name: request.trackName,
          genre: request.genre,
          mood: request.mood,
          style: request.style,
          duration: request.duration,
          artwork_url: request.artworkUrl,
          target_platforms: request.targetPlatforms,
          content_type: request.contentType,
          strategy: 'viral',
          include_hashtags: true,
          include_optimal_times: true
        })
      });

      if (!response.ok) {
        throw new Error(`Nova Post Pilot API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      const campaign: MarketingCampaign = {
        id: result.campaign_id,
        trackId: request.trackId,
        trackName: request.trackName,
        posts: result.posts.map((post: any) => ({
          platform: post.platform,
          content: post.content,
          hashtags: post.hashtags,
          imagePrompt: post.image_prompt,
          videoPrompt: post.video_prompt,
          optimalPostTime: post.optimal_post_time,
          engagementScore: post.engagement_score
        })),
        schedule: result.schedule.map((item: any) => ({
          platform: item.platform,
          postTime: item.post_time,
          content: item.content,
          status: 'scheduled' as const
        })),
        analytics: {
          estimatedReach: result.analytics.estimated_reach,
          engagementRate: result.analytics.engagement_rate,
          conversionRate: result.analytics.conversion_rate
        },
        createdAt: new Date().toISOString()
      };

      logger.info({ 
        campaignId: campaign.id, 
        postsCount: campaign.posts.length 
      }, 'Marketing campaign generated successfully');

      return campaign;

    } catch (error) {
      logger.error({ error, request }, 'Failed to generate marketing content');
      throw new ServiceUnavailableError('Nova Post Pilot service is currently unavailable');
    }
  }

  // 📅 PROGRAMAR CONTENIDO 📅
  async scheduleContent(campaignId: string, posts: Array<{
    platform: string;
    content: string;
    scheduledTime: string;
  }>): Promise<{ success: boolean; scheduledPosts: number }> {
    logger.info({ campaignId, postsCount: posts.length }, 'Scheduling marketing content');

    try {
      const response = await fetch(`${this.API_ENDPOINT}/campaigns/${campaignId}/schedule`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          posts: posts.map(post => ({
            platform: post.platform,
            content: post.content,
            scheduled_time: post.scheduledTime
          }))
        })
      });

      if (!response.ok) {
        throw new Error(`Nova Post Pilot API error: ${response.status}`);
      }

      const result = await response.json();

      logger.info({ 
        campaignId, 
        scheduledPosts: result.scheduled_posts 
      }, 'Content scheduled successfully');

      return {
        success: true,
        scheduledPosts: result.scheduled_posts
      };

    } catch (error) {
      logger.error({ error, campaignId }, 'Failed to schedule content');
      throw new ServiceUnavailableError('Failed to schedule marketing content');
    }
  }

  // 📊 OBTENER ANALYTICS 📊
  async getCampaignAnalytics(campaignId: string): Promise<{
    reach: number;
    engagement: number;
    clicks: number;
    conversions: number;
    topPerformingPost: SocialMediaPost;
    platformBreakdown: Array<{
      platform: string;
      reach: number;
      engagement: number;
    }>;
  }> {
    try {
      const response = await fetch(`${this.API_ENDPOINT}/campaigns/${campaignId}/analytics`, {
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Nova Post Pilot API error: ${response.status}`);
      }

      const result = await response.json();

      return {
        reach: result.total_reach,
        engagement: result.total_engagement,
        clicks: result.total_clicks,
        conversions: result.total_conversions,
        topPerformingPost: result.top_performing_post,
        platformBreakdown: result.platform_breakdown
      };

    } catch (error) {
      logger.error({ error, campaignId }, 'Failed to get campaign analytics');
      throw new ServiceUnavailableError('Failed to get campaign analytics');
    }
  }

  // 🎨 GENERAR TEMPLATES DE CONTENIDO 🎨
  async generateContentTemplates(genre: string, mood: string): Promise<ContentTemplate[]> {
    logger.info({ genre, mood }, 'Generating content templates');

    try {
      const response = await fetch(`${this.API_ENDPOINT}/templates/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          genre,
          mood,
          include_variables: true,
          optimize_for_engagement: true
        })
      });

      if (!response.ok) {
        throw new Error(`Nova Post Pilot API error: ${response.status}`);
      }

      const result = await response.json();

      return result.templates.map((template: any) => ({
        id: template.id,
        name: template.name,
        category: template.category,
        template: template.template,
        variables: template.variables,
        platforms: template.platforms,
        engagementScore: template.engagement_score
      }));

    } catch (error) {
      logger.error({ error, genre, mood }, 'Failed to generate content templates');
      throw new ServiceUnavailableError('Failed to generate content templates');
    }
  }

  // 🔄 AUTOMATIZAR CAMPAÑA COMPLETA 🔄
  async automateCampaign(trackData: {
    trackId: string;
    trackName: string;
    genre: string;
    mood: string;
    style: string;
    duration: number;
    artworkUrl?: string;
  }): Promise<MarketingCampaign> {
    logger.info({ trackName: trackData.trackName }, 'Starting automated marketing campaign');

    try {
      // 1. Generar contenido
      const campaign = await this.generateMarketingContent({
        ...trackData,
        targetPlatforms: ['instagram', 'tiktok', 'youtube', 'twitter'],
        contentType: 'single'
      });

      // 2. Programar contenido automáticamente
      const scheduleData = campaign.posts.map(post => ({
        platform: post.platform,
        content: post.content,
        scheduledTime: post.optimalPostTime
      }));

      await this.scheduleContent(campaign.id, scheduleData);

      logger.info({ 
        campaignId: campaign.id, 
        trackName: trackData.trackName 
      }, 'Automated campaign completed');

      return campaign;

    } catch (error) {
      logger.error({ error, trackData }, 'Failed to automate campaign');
      throw new ServiceUnavailableError('Failed to automate marketing campaign');
    }
  }

  // 📈 OPTIMIZAR CONTENIDO BASADO EN ANALYTICS 📈
  async optimizeContent(campaignId: string): Promise<{
    optimizedPosts: SocialMediaPost[];
    recommendations: string[];
    expectedImprovement: number;
  }> {
    try {
      const response = await fetch(`${this.API_ENDPOINT}/campaigns/${campaignId}/optimize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Nova Post Pilot API error: ${response.status}`);
      }

      const result = await response.json();

      return {
        optimizedPosts: result.optimized_posts,
        recommendations: result.recommendations,
        expectedImprovement: result.expected_improvement
      };

    } catch (error) {
      logger.error({ error, campaignId }, 'Failed to optimize content');
      throw new ServiceUnavailableError('Failed to optimize marketing content');
    }
  }

  // 🎯 GENERAR HASHTAGS INTELIGENTES 🎯
  async generateHashtags(trackName: string, genre: string, mood: string): Promise<{
    trending: string[];
    niche: string[];
    branded: string[];
    engagement: string[];
  }> {
    try {
      const response = await fetch(`${this.API_ENDPOINT}/hashtags/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          track_name: trackName,
          genre,
          mood,
          include_trending: true,
          include_niche: true,
          include_branded: true,
          max_hashtags: 30
        })
      });

      if (!response.ok) {
        throw new Error(`Nova Post Pilot API error: ${response.status}`);
      }

      const result = await response.json();

      return {
        trending: result.trending_hashtags,
        niche: result.niche_hashtags,
        branded: result.branded_hashtags,
        engagement: result.engagement_hashtags
      };

    } catch (error) {
      logger.error({ error, trackName }, 'Failed to generate hashtags');
      throw new ServiceUnavailableError('Failed to generate hashtags');
    }
  }
}

// 🎵 SERVICIO INTEGRADO DE MARKETING MUSICAL 🎵
export class IntegratedMarketingService {
  private novaService: NovaPostPilotService;

  constructor() {
    this.novaService = new NovaPostPilotService();
  }

  // Procesar track completo: IA + Marketing
  async processTrackWithMarketing(trackData: {
    trackId: string;
    trackName: string;
    audioUrl: string;
    genre: string;
    mood: string;
    style: string;
    duration: number;
    enhancedAudioUrl?: string;
    artworkUrl?: string;
  }) {
    logger.info({ trackName: trackData.trackName }, 'Starting integrated track processing with marketing');

    try {
      // 1. Generar hashtags inteligentes
      const hashtags = await this.novaService.generateHashtags(
        trackData.trackName,
        trackData.genre,
        trackData.mood
      );

      // 2. Generar templates de contenido
      const templates = await this.novaService.generateContentTemplates(
        trackData.genre,
        trackData.mood
      );

      // 3. Crear campaña de marketing
      const campaign = await this.novaService.automateCampaign({
        trackId: trackData.trackId,
        trackName: trackData.trackName,
        genre: trackData.genre,
        mood: trackData.mood,
        style: trackData.style,
        duration: trackData.duration,
        artworkUrl: trackData.artworkUrl
      });

      logger.info({ 
        trackName: trackData.trackName, 
        campaignId: campaign.id 
      }, 'Integrated track processing with marketing completed');

      return {
        campaign,
        hashtags,
        templates,
        success: true
      };

    } catch (error) {
      logger.error({ error, trackData }, 'Failed to process track with marketing');
      throw new ServiceUnavailableError('Failed to process track with marketing');
    }
  }

  // Obtener estado del servicio
  async getServiceStatus() {
    return {
      nova: { 
        available: !!config.marketing.novaApiKey, 
        endpoint: config.marketing.novaEndpoint 
      }
    };
  }
}

// Exportar instancias
export const novaPostPilotService = new NovaPostPilotService();
export const integratedMarketingService = new IntegratedMarketingService();
