import { config } from '@/config';
import { logger } from '@/utils/logger';
import { AppError, ServiceUnavailableError } from '@/utils/errors';

// 📱 NOVA POST PILOT - ANÁLISIS DE ALGORITMOS + QWEN IA + MARKETING INTELIGENTE 📱

export interface UserProfile {
  userId: string;
  username: string;
  contentType: 'music' | 'lifestyle' | 'tech' | 'fitness' | 'food' | 'travel' | 'fashion' | 'education' | 'entertainment';
  currentPlatforms: ('instagram' | 'tiktok' | 'youtube' | 'facebook' | 'twitter' | 'linkedin')[];
  followerCount: number;
  engagementRate: number;
  targetAudience?: {
    ageRange: string;
    interests: string[];
    demographics: string[];
    behaviorPatterns: string[];
  };
  brandVoice: 'professional' | 'casual' | 'humorous' | 'inspirational' | 'educational' | 'trendy';
  goals: ('growth' | 'engagement' | 'sales' | 'brand_awareness' | 'community_building')[];
}

export interface AlgorithmAnalysis {
  platform: string;
  algorithmInsights: {
    bestPostingTimes: string[];
    optimalContentLength: string;
    engagementTriggers: string[];
    shadowbanTriggers: string[];
    trendingTopics: string[];
    hashtagStrategy: string;
    contentMix: {
      educational: number;
      entertaining: number;
      promotional: number;
      personal: number;
    };
  };
  recommendations: string[];
  score: number; // 1-100
}

export interface ViralHook {
  id: string;
  title: string;
  description: string;
  category: 'trending' | 'evergreen' | 'seasonal' | 'viral';
  platforms: string[];
  expectedReach: number;
  engagementScore: number;
  template: {
    hook: string;
    body: string;
    callToAction: string;
    hashtags: string[];
    optimalPostingTime: string;
  };
  trendData: {
    currentMomentum: number;
    peakTime: string;
    relatedTrends: string[];
    competitorAnalysis: string[];
  };
}

export interface SEOAnalysis {
  keywords: {
    primary: string[];
    secondary: string[];
    longTail: string[];
    trending: string[];
  };
  hashtags: {
    highVolume: string[];
    mediumVolume: string[];
    niche: string[];
    branded: string[];
    trending: string[];
  };
  contentOptimization: {
    titleSuggestions: string[];
    descriptionTemplates: string[];
    callToActionVariations: string[];
  };
  competitorInsights: {
    topPerformers: Array<{
      username: string;
      engagementRate: number;
      contentStrategy: string;
    }>;
    marketGaps: string[];
    opportunities: string[];
  };
}

export interface ContentCalendar {
  id: string;
  userId: string;
  week: string;
  posts: Array<{
    id: string;
    platform: string;
    scheduledTime: string;
    content: string;
    hashtags: string[];
    mediaType: 'image' | 'video' | 'carousel' | 'story' | 'reel';
    status: 'scheduled' | 'published' | 'failed';
    expectedEngagement: number;
    viralHookId?: string;
  }>;
  performance: {
    totalReach: number;
    expectedEngagement: number;
    conversionRate: number;
  };
}

export interface QwenAnalysis {
  marketAnalysis: {
    targetAudience: {
      demographics: string[];
      psychographics: string[];
      painPoints: string[];
      interests: string[];
    };
    competitorLandscape: {
      topCompetitors: string[];
      marketShare: Record<string, number>;
      contentGaps: string[];
    };
    trendAnalysis: {
      currentTrends: string[];
      emergingTrends: string[];
      decliningTrends: string[];
    };
  };
  contentStrategy: {
    recommendedContentMix: Record<string, number>;
    optimalPostingSchedule: Record<string, string[]>;
    engagementStrategy: string[];
    growthStrategy: string[];
  };
  personalizedRecommendations: string[];
}

export class NovaPostPilotService {
  private readonly API_ENDPOINT: string;
  private readonly QWEN_API_KEY: string;
  private readonly PLATFORM_APIS: Record<string, string>;

  constructor() {
    this.API_ENDPOINT = config.marketing.novaEndpoint || 'https://api.novapost.ai/v1';
    this.QWEN_API_KEY = config.marketing.qwenApiKey || '';
    this.PLATFORM_APIS = {
      instagram: config.marketing.instagramApiKey || '',
      tiktok: config.marketing.tiktokApiKey || '',
      youtube: config.marketing.youtubeApiKey || '',
      facebook: config.marketing.facebookApiKey || '',
      twitter: config.marketing.twitterApiKey || '',
      linkedin: config.marketing.linkedinApiKey || '',
    };
  }

  // 🧠 ANÁLISIS PROFUNDO CON QWEN IA 🧠
  async analyzeUserProfile(userProfile: UserProfile): Promise<QwenAnalysis> {
    logger.info({ userId: userProfile.userId, contentType: userProfile.contentType }, 'Starting Qwen IA analysis');

    try {
      const response = await fetch(`${this.API_ENDPOINT}/qwen/analyze-profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.QWEN_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_profile: userProfile,
          analysis_depth: 'comprehensive',
          include_competitor_analysis: true,
          include_trend_analysis: true,
          include_market_research: true
        })
      });

      if (!response.ok) {
        throw new Error(`Qwen API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      const analysis: QwenAnalysis = {
        marketAnalysis: {
          targetAudience: {
            demographics: result.market_analysis.target_audience.demographics,
            psychographics: result.market_analysis.target_audience.psychographics,
            painPoints: result.market_analysis.target_audience.pain_points,
            interests: result.market_analysis.target_audience.interests
          },
          competitorLandscape: {
            topCompetitors: result.market_analysis.competitor_landscape.top_competitors,
            marketShare: result.market_analysis.competitor_landscape.market_share,
            contentGaps: result.market_analysis.competitor_landscape.content_gaps
          },
          trendAnalysis: {
            currentTrends: result.market_analysis.trend_analysis.current_trends,
            emergingTrends: result.market_analysis.trend_analysis.emerging_trends,
            decliningTrends: result.market_analysis.trend_analysis.declining_trends
          }
        },
        contentStrategy: {
          recommendedContentMix: result.content_strategy.recommended_content_mix,
          optimalPostingSchedule: result.content_strategy.optimal_posting_schedule,
          engagementStrategy: result.content_strategy.engagement_strategy,
          growthStrategy: result.content_strategy.growth_strategy
        },
        personalizedRecommendations: result.personalized_recommendations
      };

      logger.info({ userId: userProfile.userId }, 'Qwen IA analysis completed successfully');

      return analysis;

    } catch (error) {
      logger.error({ error, userProfile }, 'Failed to analyze user profile with Qwen IA');
      throw new ServiceUnavailableError('Qwen IA analysis service is currently unavailable');
    }
  }

  // 📊 ANÁLISIS DE ALGORITMOS POR PLATAFORMA 📊
  async analyzePlatformAlgorithms(platforms: string[], userProfile: UserProfile): Promise<AlgorithmAnalysis[]> {
    logger.info({ platforms, userId: userProfile.userId }, 'Analyzing platform algorithms');

    try {
      const response = await fetch(`${this.API_ENDPOINT}/algorithms/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.QWEN_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platforms,
          user_profile: userProfile,
          analysis_type: 'comprehensive',
          include_trending_data: true,
          include_competitor_analysis: true
        })
      });

      if (!response.ok) {
        throw new Error(`Algorithm analysis API error: ${response.status}`);
      }

      const result = await response.json();

      const analyses: AlgorithmAnalysis[] = result.analyses.map((analysis: any) => ({
        platform: analysis.platform,
        algorithmInsights: {
          bestPostingTimes: analysis.algorithm_insights.best_posting_times,
          optimalContentLength: analysis.algorithm_insights.optimal_content_length,
          engagementTriggers: analysis.algorithm_insights.engagement_triggers,
          shadowbanTriggers: analysis.algorithm_insights.shadowban_triggers,
          trendingTopics: analysis.algorithm_insights.trending_topics,
          hashtagStrategy: analysis.algorithm_insights.hashtag_strategy,
          contentMix: analysis.algorithm_insights.content_mix
        },
        recommendations: analysis.recommendations,
        score: analysis.score
      }));

      logger.info({ platforms, analysesCount: analyses.length }, 'Platform algorithm analysis completed');

      return analyses;

    } catch (error) {
      logger.error({ error, platforms }, 'Failed to analyze platform algorithms');
      throw new ServiceUnavailableError('Algorithm analysis service is currently unavailable');
    }
  }

  // 🎯 GENERAR GANCHOS VIRALES SEMANALES 🎯
  async generateViralHooks(userProfile: UserProfile, week: string): Promise<ViralHook[]> {
    logger.info({ userId: userProfile.userId, week }, 'Generating viral hooks for the week');

    try {
      const response = await fetch(`${this.API_ENDPOINT}/hooks/generate-weekly`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.QWEN_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_profile: userProfile,
          week,
          hook_count: 3,
          include_trending_data: true,
          include_competitor_analysis: true,
          personalize_for_user: true
        })
      });

      if (!response.ok) {
        throw new Error(`Viral hooks API error: ${response.status}`);
      }

      const result = await response.json();

      const hooks: ViralHook[] = result.hooks.map((hook: any) => ({
        id: hook.id,
        title: hook.title,
        description: hook.description,
        category: hook.category,
        platforms: hook.platforms,
        expectedReach: hook.expected_reach,
        engagementScore: hook.engagement_score,
        template: {
          hook: hook.template.hook,
          body: hook.template.body,
          callToAction: hook.template.call_to_action,
          hashtags: hook.template.hashtags,
          optimalPostingTime: hook.template.optimal_posting_time
        },
        trendData: {
          currentMomentum: hook.trend_data.current_momentum,
          peakTime: hook.trend_data.peak_time,
          relatedTrends: hook.trend_data.related_trends,
          competitorAnalysis: hook.trend_data.competitor_analysis
        }
      }));

      logger.info({ userId: userProfile.userId, hooksCount: hooks.length }, 'Viral hooks generated successfully');

      return hooks;

    } catch (error) {
      logger.error({ error, userProfile }, 'Failed to generate viral hooks');
      throw new ServiceUnavailableError('Viral hooks generation service is currently unavailable');
    }
  }

  // 🔍 ANÁLISIS SEO AVANZADO 🔍
  async performSEOAnalysis(userProfile: UserProfile, contentTopic: string): Promise<SEOAnalysis> {
    logger.info({ userId: userProfile.userId, contentTopic }, 'Performing SEO analysis');

    try {
      const response = await fetch(`${this.API_ENDPOINT}/seo/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.QWEN_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_profile: userProfile,
          content_topic: contentTopic,
          analysis_depth: 'comprehensive',
          include_competitor_analysis: true,
          include_trending_keywords: true,
          include_market_gaps: true
        })
      });

      if (!response.ok) {
        throw new Error(`SEO analysis API error: ${response.status}`);
      }

      const result = await response.json();

      const seoAnalysis: SEOAnalysis = {
        keywords: {
          primary: result.keywords.primary,
          secondary: result.keywords.secondary,
          longTail: result.keywords.long_tail,
          trending: result.keywords.trending
        },
        hashtags: {
          highVolume: result.hashtags.high_volume,
          mediumVolume: result.hashtags.medium_volume,
          niche: result.hashtags.niche,
          branded: result.hashtags.branded,
          trending: result.hashtags.trending
        },
        contentOptimization: {
          titleSuggestions: result.content_optimization.title_suggestions,
          descriptionTemplates: result.content_optimization.description_templates,
          callToActionVariations: result.content_optimization.call_to_action_variations
        },
        competitorInsights: {
          topPerformers: result.competitor_insights.top_performers.map((performer: any) => ({
            username: performer.username,
            engagementRate: performer.engagement_rate,
            contentStrategy: performer.content_strategy
          })),
          marketGaps: result.competitor_insights.market_gaps,
          opportunities: result.competitor_insights.opportunities
        }
      };

      logger.info({ userId: userProfile.userId }, 'SEO analysis completed successfully');

      return seoAnalysis;

    } catch (error) {
      logger.error({ error, userProfile }, 'Failed to perform SEO analysis');
      throw new ServiceUnavailableError('SEO analysis service is currently unavailable');
    }
  }

  // 📅 CREAR CALENDARIO DE CONTENIDO INTELIGENTE 📅
  async createContentCalendar(userProfile: UserProfile, viralHooks: ViralHook[], week: string): Promise<ContentCalendar> {
    logger.info({ userId: userProfile.userId, week }, 'Creating intelligent content calendar');

    try {
      const response = await fetch(`${this.API_ENDPOINT}/calendar/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.QWEN_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_profile: userProfile,
          viral_hooks: viralHooks,
          week,
          optimize_for_engagement: true,
          include_optimal_timing: true,
          auto_schedule: true
        })
      });

      if (!response.ok) {
        throw new Error(`Content calendar API error: ${response.status}`);
      }

      const result = await response.json();

      const calendar: ContentCalendar = {
        id: result.calendar_id,
        userId: userProfile.userId,
        week,
        posts: result.posts.map((post: any) => ({
          id: post.id,
          platform: post.platform,
          scheduledTime: post.scheduled_time,
          content: post.content,
          hashtags: post.hashtags,
          mediaType: post.media_type,
          status: 'scheduled' as const,
          expectedEngagement: post.expected_engagement,
          viralHookId: post.viral_hook_id
        })),
        performance: {
          totalReach: result.performance.total_reach,
          expectedEngagement: result.performance.expected_engagement,
          conversionRate: result.performance.conversion_rate
        }
      };

      logger.info({ userId: userProfile.userId, postsCount: calendar.posts.length }, 'Content calendar created successfully');

      return calendar;

    } catch (error) {
      logger.error({ error, userProfile }, 'Failed to create content calendar');
      throw new ServiceUnavailableError('Content calendar creation service is currently unavailable');
    }
  }

  // 🚀 PUBLICACIÓN AUTOMÁTICA CON PERMISOS 🚀
  async publishScheduledContent(calendarId: string, userPermissions: Record<string, boolean>): Promise<{
    published: number;
    failed: number;
    scheduled: number;
  }> {
    logger.info({ calendarId }, 'Publishing scheduled content with user permissions');

    try {
      const response = await fetch(`${this.API_ENDPOINT}/calendar/${calendarId}/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.QWEN_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_permissions: userPermissions,
          respect_optimal_timing: true,
          include_engagement_optimization: true
        })
      });

      if (!response.ok) {
        throw new Error(`Publishing API error: ${response.status}`);
      }

      const result = await response.json();

      logger.info({ 
        calendarId, 
        published: result.published, 
        failed: result.failed 
      }, 'Content publishing completed');

      return {
        published: result.published,
        failed: result.failed,
        scheduled: result.scheduled
      };

    } catch (error) {
      logger.error({ error, calendarId }, 'Failed to publish scheduled content');
      throw new ServiceUnavailableError('Content publishing service is currently unavailable');
    }
  }

  // 📈 ANÁLISIS DE RENDIMIENTO EN TIEMPO REAL 📈
  async getPerformanceAnalytics(calendarId: string): Promise<{
    totalReach: number;
    totalEngagement: number;
    topPerformingPosts: Array<{
      id: string;
      platform: string;
      engagement: number;
      reach: number;
    }>;
    platformBreakdown: Record<string, {
      reach: number;
      engagement: number;
      conversion: number;
    }>;
    recommendations: string[];
  }> {
    try {
      const response = await fetch(`${this.API_ENDPOINT}/analytics/${calendarId}`, {
        headers: {
          'Authorization': `Bearer ${this.QWEN_API_KEY}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Analytics API error: ${response.status}`);
      }

      const result = await response.json();

      return {
        totalReach: result.total_reach,
        totalEngagement: result.total_engagement,
        topPerformingPosts: result.top_performing_posts,
        platformBreakdown: result.platform_breakdown,
        recommendations: result.recommendations
      };

    } catch (error) {
      logger.error({ error, calendarId }, 'Failed to get performance analytics');
      throw new ServiceUnavailableError('Analytics service is currently unavailable');
    }
  }

  // 🎯 FLUJO COMPLETO DE NOVA POST PILOT 🎯
  async executeCompleteFlow(userProfile: UserProfile, week: string): Promise<{
    qwenAnalysis: QwenAnalysis;
    algorithmAnalyses: AlgorithmAnalysis[];
    viralHooks: ViralHook[];
    seoAnalysis: SEOAnalysis;
    contentCalendar: ContentCalendar;
  }> {
    logger.info({ userId: userProfile.userId, week }, 'Executing complete Nova Post Pilot flow');

    try {
      // 1. Análisis profundo con Qwen IA
      const qwenAnalysis = await this.analyzeUserProfile(userProfile);

      // 2. Análisis de algoritmos por plataforma
      const algorithmAnalyses = await this.analyzePlatformAlgorithms(userProfile.currentPlatforms, userProfile);

      // 3. Generar ganchos virales semanales
      const viralHooks = await this.generateViralHooks(userProfile, week);

      // 4. Análisis SEO para el contenido principal
      const seoAnalysis = await this.performSEOAnalysis(userProfile, userProfile.contentType);

      // 5. Crear calendario de contenido inteligente
      const contentCalendar = await this.createContentCalendar(userProfile, viralHooks, week);

      logger.info({ 
        userId: userProfile.userId, 
        hooksCount: viralHooks.length,
        postsCount: contentCalendar.posts.length 
      }, 'Complete Nova Post Pilot flow executed successfully');

      return {
        qwenAnalysis,
        algorithmAnalyses,
        viralHooks,
        seoAnalysis,
        contentCalendar
      };

    } catch (error) {
      logger.error({ error, userProfile }, 'Failed to execute complete Nova Post Pilot flow');
      throw new ServiceUnavailableError('Complete flow execution failed');
    }
  }
}

// Exportar instancia
export const novaPostPilotService = new NovaPostPilotService();
