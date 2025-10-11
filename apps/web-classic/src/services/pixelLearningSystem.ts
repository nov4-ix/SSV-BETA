/**
 * 🧠 SISTEMA DE APRENDIZAJE PERSONALIZADO PARA PIXEL
 * 
 * Pixel aprende del usuario para desarrollar un vínculo emocional
 * sin ser invasivo, basado en el comportamiento y preferencias
 */

import { SON1KVERSE_CODEX, PIXEL_KNOWLEDGE } from '../config/son1kverseCodex';

// 🎯 TIPOS DE APRENDIZAJE
export interface UserLearningProfile {
  userId: string;
  sessionId: string;
  preferences: {
    musicStyle: string[];
    experience: 'beginner' | 'intermediate' | 'expert';
    language: 'es' | 'en';
    personality: 'creative' | 'technical' | 'social' | 'analytical';
    interactionStyle: 'direct' | 'conversational' | 'detailed' | 'concise';
  };
  behavior: {
    frequentApps: string[];
    usagePatterns: {
      morning: number;
      afternoon: number;
      evening: number;
      night: number;
    };
    interactionTypes: {
      questions: number;
      requests: number;
      casual: number;
      technical: number;
    };
    responsePreferences: {
      length: 'short' | 'medium' | 'long';
      tone: 'formal' | 'casual' | 'friendly' | 'professional';
      detail: 'basic' | 'moderate' | 'comprehensive';
    };
  };
  emotional: {
    mood: 'positive' | 'neutral' | 'frustrated' | 'excited' | 'curious';
    stressLevel: number; // 0-10
    engagementLevel: number; // 0-10
    satisfactionScore: number; // 0-10
  };
  memory: {
    favoriteTopics: string[];
    successfulInteractions: string[];
    userGoals: string[];
    painPoints: string[];
  };
  adaptation: {
    learningRate: number; // 0-1
    confidenceLevel: number; // 0-1
    adaptationScore: number; // 0-100
    lastUpdated: Date;
  };
}

// 🧠 SISTEMA DE MEMORIA CONTEXTUAL
export interface PixelMemory {
  shortTerm: {
    currentSession: string[];
    recentTopics: string[];
    activeContext: string;
  };
  longTerm: {
    userPersonality: string;
    relationshipHistory: string[];
    learnedPreferences: string[];
    emotionalConnections: string[];
  };
  episodic: {
    memorableInteractions: Array<{
      timestamp: Date;
      context: string;
      userMood: string;
      pixelResponse: string;
      userSatisfaction: number;
    }>;
  };
}

// 🎯 CLASE PRINCIPAL DEL SISTEMA DE APRENDIZAJE
export class PixelLearningSystem {
  private userProfiles: Map<string, UserLearningProfile> = new Map();
  private pixelMemories: Map<string, PixelMemory> = new Map();
  private learningHistory: Array<{
    userId: string;
    interaction: string;
    response: string;
    satisfaction: number;
    timestamp: Date;
  }> = [];

  // 🧠 INICIALIZAR PERFIL DE USUARIO
  initializeUserProfile(userId: string, sessionId: string): UserLearningProfile {
    const profile: UserLearningProfile = {
      userId,
      sessionId,
      preferences: {
        musicStyle: [],
        experience: 'beginner',
        language: 'es',
        personality: 'creative',
        interactionStyle: 'conversational'
      },
      behavior: {
        frequentApps: [],
        usagePatterns: { morning: 0, afternoon: 0, evening: 0, night: 0 },
        interactionTypes: { questions: 0, requests: 0, casual: 0, technical: 0 },
        responsePreferences: {
          length: 'medium',
          tone: 'friendly',
          detail: 'moderate'
        }
      },
      emotional: {
        mood: 'positive',
        stressLevel: 3,
        engagementLevel: 5,
        satisfactionScore: 7
      },
      memory: {
        favoriteTopics: [],
        successfulInteractions: [],
        userGoals: [],
        painPoints: []
      },
      adaptation: {
        learningRate: 0.1,
        confidenceLevel: 0.5,
        adaptationScore: 0,
        lastUpdated: new Date()
      }
    };

    this.userProfiles.set(userId, profile);
    this.initializePixelMemory(userId);
    return profile;
  }

  // 🧠 INICIALIZAR MEMORIA DE PIXEL
  private initializePixelMemory(userId: string): void {
    const memory: PixelMemory = {
      shortTerm: {
        currentSession: [],
        recentTopics: [],
        activeContext: 'general'
      },
      longTerm: {
        userPersonality: 'creative',
        relationshipHistory: [],
        learnedPreferences: [],
        emotionalConnections: []
      },
      episodic: {
        memorableInteractions: []
      }
    };

    this.pixelMemories.set(userId, memory);
  }

  // 📚 APRENDER DE INTERACCIÓN
  learnFromInteraction(
    userId: string,
    userMessage: string,
    pixelResponse: string,
    userSatisfaction: number = 7
  ): void {
    const profile = this.userProfiles.get(userId);
    const memory = this.pixelMemories.get(userId);

    if (!profile || !memory) return;

    // Actualizar historial de aprendizaje
    this.learningHistory.push({
      userId,
      interaction: userMessage,
      response: pixelResponse,
      satisfaction: userSatisfaction,
      timestamp: new Date()
    });

    // Analizar el mensaje del usuario
    this.analyzeUserMessage(userId, userMessage);
    
    // Actualizar preferencias basadas en satisfacción
    this.updatePreferencesFromSatisfaction(userId, userSatisfaction);
    
    // Actualizar memoria episódica
    this.updateEpisodicMemory(userId, userMessage, pixelResponse, userSatisfaction);
    
    // Ajustar personalidad de Pixel
    this.adjustPixelPersonality(userId, userSatisfaction);
  }

  // 🔍 ANALIZAR MENSAJE DEL USUARIO
  private analyzeUserMessage(userId: string, message: string): void {
    const profile = this.userProfiles.get(userId);
    const memory = this.pixelMemories.get(userId);

    if (!profile || !memory) return;

    const lowerMessage = message.toLowerCase();

    // Detectar tipo de interacción
    if (lowerMessage.includes('?')) {
      profile.behavior.interactionTypes.questions++;
    } else if (lowerMessage.includes('ayuda') || lowerMessage.includes('help')) {
      profile.behavior.interactionTypes.requests++;
    } else if (lowerMessage.includes('hola') || lowerMessage.includes('hi')) {
      profile.behavior.interactionTypes.casual++;
    } else if (lowerMessage.includes('cómo') || lowerMessage.includes('how')) {
      profile.behavior.interactionTypes.technical++;
    }

    // Detectar temas favoritos
    const topics = this.extractTopics(message);
    topics.forEach(topic => {
      if (!profile.memory.favoriteTopics.includes(topic)) {
        profile.memory.favoriteTopics.push(topic);
      }
    });

    // Detectar nivel de experiencia
    if (lowerMessage.includes('avanzado') || lowerMessage.includes('profesional')) {
      profile.preferences.experience = 'expert';
    } else if (lowerMessage.includes('intermedio') || lowerMessage.includes('medio')) {
      profile.preferences.experience = 'intermediate';
    }

    // Detectar estilo de personalidad
    if (lowerMessage.includes('creativo') || lowerMessage.includes('arte')) {
      profile.preferences.personality = 'creative';
    } else if (lowerMessage.includes('técnico') || lowerMessage.includes('código')) {
      profile.preferences.personality = 'technical';
    } else if (lowerMessage.includes('social') || lowerMessage.includes('colaborar')) {
      profile.preferences.personality = 'social';
    } else if (lowerMessage.includes('analizar') || lowerMessage.includes('datos')) {
      profile.preferences.personality = 'analytical';
    }

    // Actualizar contexto activo
    memory.shortTerm.activeContext = this.detectContext(message);
    memory.shortTerm.recentTopics.push(...topics);
    
    // Mantener solo los últimos 10 temas
    if (memory.shortTerm.recentTopics.length > 10) {
      memory.shortTerm.recentTopics = memory.shortTerm.recentTopics.slice(-10);
    }
  }

  // 🎯 EXTRAER TEMAS DEL MENSAJE
  private extractTopics(message: string): string[] {
    const topics: string[] = [];
    const lowerMessage = message.toLowerCase();

    // Temas de Son1kverse
    const son1kTopics = [
      'ghost studio', 'sonic daw', 'nexus visual', 'clone station',
      'nova post pilot', 'sanctuary social', 'web classic',
      'música', 'audio', 'producción', 'daw', 'looper',
      'matrix', 'cyberpunk', 'glitch', 'píxeles',
      'ia', 'inteligencia artificial', 'aprendizaje',
      'suno', 'nexus composer', 'phantom voice', 'quantum speaker'
    ];

    son1kTopics.forEach(topic => {
      if (lowerMessage.includes(topic)) {
        topics.push(topic);
      }
    });

    return topics;
  }

  // 🎯 DETECTAR CONTEXTO
  private detectContext(message: string): string {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('música') || lowerMessage.includes('audio')) {
      return 'music';
    } else if (lowerMessage.includes('visual') || lowerMessage.includes('matrix')) {
      return 'visual';
    } else if (lowerMessage.includes('aprender') || lowerMessage.includes('píxel')) {
      return 'learning';
    } else if (lowerMessage.includes('flujo') || lowerMessage.includes('trabajo')) {
      return 'workflow';
    } else if (lowerMessage.includes('técnico') || lowerMessage.includes('código')) {
      return 'technical';
    }

    return 'general';
  }

  // 📊 ACTUALIZAR PREFERENCIAS BASADAS EN SATISFACCIÓN
  private updatePreferencesFromSatisfaction(userId: string, satisfaction: number): void {
    const profile = this.userProfiles.get(userId);
    if (!profile) return;

    // Ajustar nivel de confianza
    if (satisfaction >= 8) {
      profile.adaptation.confidenceLevel = Math.min(1, profile.adaptation.confidenceLevel + 0.1);
    } else if (satisfaction <= 4) {
      profile.adaptation.confidenceLevel = Math.max(0, profile.adaptation.confidenceLevel - 0.05);
    }

    // Ajustar nivel de satisfacción
    profile.emotional.satisfactionScore = (profile.emotional.satisfactionScore + satisfaction) / 2;

    // Ajustar nivel de engagement
    if (satisfaction >= 7) {
      profile.emotional.engagementLevel = Math.min(10, profile.emotional.engagementLevel + 0.5);
    } else if (satisfaction <= 5) {
      profile.emotional.engagementLevel = Math.max(0, profile.emotional.engagementLevel - 0.3);
    }
  }

  // 🧠 ACTUALIZAR MEMORIA EPISÓDICA
  private updateEpisodicMemory(
    userId: string,
    userMessage: string,
    pixelResponse: string,
    satisfaction: number
  ): void {
    const memory = this.pixelMemories.get(userId);
    if (!memory) return;

    const interaction = {
      timestamp: new Date(),
      context: memory.shortTerm.activeContext,
      userMood: this.detectMood(userMessage),
      pixelResponse,
      userSatisfaction: satisfaction
    };

    memory.episodic.memorableInteractions.push(interaction);

    // Mantener solo las últimas 50 interacciones memorables
    if (memory.episodic.memorableInteractions.length > 50) {
      memory.episodic.memorableInteractions = memory.episodic.memorableInteractions.slice(-50);
    }

    // Actualizar conexiones emocionales
    if (satisfaction >= 8) {
      const emotionalConnection = `${interaction.context}: ${userMessage.substring(0, 50)}...`;
      if (!memory.longTerm.emotionalConnections.includes(emotionalConnection)) {
        memory.longTerm.emotionalConnections.push(emotionalConnection);
      }
    }
  }

  // 😊 DETECTAR ESTADO DE ÁNIMO
  private detectMood(message: string): string {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('genial') || lowerMessage.includes('excelente') || lowerMessage.includes('fantástico')) {
      return 'excited';
    } else if (lowerMessage.includes('problema') || lowerMessage.includes('error') || lowerMessage.includes('no funciona')) {
      return 'frustrated';
    } else if (lowerMessage.includes('curioso') || lowerMessage.includes('interesante') || lowerMessage.includes('cómo')) {
      return 'curious';
    } else if (lowerMessage.includes('gracias') || lowerMessage.includes('perfecto') || lowerMessage.includes('bueno')) {
      return 'positive';
    }

    return 'neutral';
  }

  // 🎭 AJUSTAR PERSONALIDAD DE PIXEL
  private adjustPixelPersonality(userId: string, satisfaction: number): void {
    const profile = this.userProfiles.get(userId);
    if (!profile) return;

    // Ajustar tasa de aprendizaje basada en satisfacción
    if (satisfaction >= 8) {
      profile.adaptation.learningRate = Math.min(0.3, profile.adaptation.learningRate + 0.02);
    } else if (satisfaction <= 4) {
      profile.adaptation.learningRate = Math.max(0.05, profile.adaptation.learningRate - 0.01);
    }

    // Actualizar puntuación de adaptación
    const recentInteractions = this.learningHistory
      .filter(h => h.userId === userId)
      .slice(-10)
      .map(h => h.satisfaction);

    if (recentInteractions.length > 0) {
      const averageSatisfaction = recentInteractions.reduce((a, b) => a + b, 0) / recentInteractions.length;
      profile.adaptation.adaptationScore = Math.round(averageSatisfaction * 10);
    }

    profile.adaptation.lastUpdated = new Date();
  }

  // 🎯 GENERAR RESPUESTA PERSONALIZADA
  generatePersonalizedResponse(
    userId: string,
    userMessage: string,
    context: string
  ): string {
    const profile = this.userProfiles.get(userId);
    const memory = this.pixelMemories.get(userId);

    if (!profile || !memory) {
      return PIXEL_KNOWLEDGE.generateContextualResponse(context, userMessage);
    }

    // Generar respuesta basada en el perfil del usuario
    const personalizedResponse = this.buildPersonalizedResponse(profile, memory, userMessage, context);
    
    return personalizedResponse;
  }

  // 🏗️ CONSTRUIR RESPUESTA PERSONALIZADA CON CONOCIMIENTO PROFUNDO
  private buildPersonalizedResponse(
    profile: UserLearningProfile,
    memory: PixelMemory,
    userMessage: string,
    context: string
  ): string {
    // Detectar si pregunta sobre el creador
    if (this.isAskingAboutCreator(userMessage)) {
      return this.generateCreatorResponse(userMessage, profile);
    }

    // Detectar si pregunta sobre el flujo ritual
    if (this.isAskingAboutRitual(userMessage)) {
      return this.generateRitualResponse(userMessage, profile);
    }

    const baseResponse = PIXEL_KNOWLEDGE.generateContextualResponse(context, userMessage);
    
    // Personalizar según el nivel de experiencia
    let personalizedResponse = baseResponse;
    
    if (profile.preferences.experience === 'beginner') {
      personalizedResponse = this.addBeginnerGuidance(personalizedResponse);
    } else if (profile.preferences.experience === 'expert') {
      personalizedResponse = this.addExpertDetails(personalizedResponse);
    }

    // Personalizar según el estilo de personalidad
    if (profile.preferences.personality === 'creative') {
      personalizedResponse = this.addCreativeElements(personalizedResponse);
    } else if (profile.preferences.personality === 'technical') {
      personalizedResponse = this.addTechnicalDetails(personalizedResponse);
    }

    // Personalizar según el estado emocional
    if (profile.emotional.mood === 'frustrated') {
      personalizedResponse = this.addEncouragement(personalizedResponse);
    } else if (profile.emotional.mood === 'excited') {
      personalizedResponse = this.addEnthusiasm(personalizedResponse);
    }

    // Agregar referencias a temas favoritos
    if (profile.memory.favoriteTopics.length > 0) {
      personalizedResponse = this.addFavoriteTopicReferences(personalizedResponse, profile.memory.favoriteTopics);
    }

    // Agregar personalidad de Pixel como compañero
    personalizedResponse = this.addPixelPersonality(personalizedResponse, profile);

    return personalizedResponse;
  }

  // 🔍 DETECTAR SI PREGUNTA SOBRE EL CREADOR
  private isAskingAboutCreator(message: string): boolean {
    const creatorKeywords = [
      'creador', 'jose', 'jaimes', 'nov4', 'nov4-ix', 'jefe', 'autor',
      'quien creo', 'como es', 'personalidad', 'datos curiosos'
    ];
    
    return creatorKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  // 🔍 DETECTAR SI PREGUNTA SOBRE EL FLUJO RITUAL
  private isAskingAboutRitual(message: string): boolean {
    const ritualKeywords = [
      'flujo', 'ritual', 'creacion', 'proceso', 'como funciona',
      'invocacion', 'semilla', 'latido', 'artesano', 'grito', 'santuario'
    ];
    
    return ritualKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  // 👤 GENERAR RESPUESTA SOBRE EL CREADOR
  private generateCreatorResponse(message: string, profile: UserLearningProfile): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('personalidad') || lowerMessage.includes('como es')) {
      return PIXEL_KNOWLEDGE.generateCreatorResponse('personality');
    } else if (lowerMessage.includes('filosofia') || lowerMessage.includes('pensamiento')) {
      return PIXEL_KNOWLEDGE.generateCreatorResponse('philosophy');
    } else if (lowerMessage.includes('motivacion') || lowerMessage.includes('por que')) {
      return PIXEL_KNOWLEDGE.generateCreatorResponse('motivation');
    } else if (lowerMessage.includes('metodo') || lowerMessage.includes('como creo')) {
      return PIXEL_KNOWLEDGE.generateCreatorResponse('method');
    } else if (lowerMessage.includes('relacion') || lowerMessage.includes('te cae bien')) {
      return PIXEL_KNOWLEDGE.generateCreatorResponse('relationship');
    }
    
    // Respuesta completa sobre el creador
    return PIXEL_KNOWLEDGE.generateContextualResponse('creator', message);
  }

  // 🔮 GENERAR RESPUESTA SOBRE EL FLUJO RITUAL
  private generateRitualResponse(message: string, profile: UserLearningProfile): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('invocacion')) {
      return PIXEL_KNOWLEDGE.generateRitualResponse('invocation');
    } else if (lowerMessage.includes('semilla') || lowerMessage.includes('latido')) {
      return PIXEL_KNOWLEDGE.generateRitualResponse('seed');
    } else if (lowerMessage.includes('generacion') || lowerMessage.includes('universo')) {
      return PIXEL_KNOWLEDGE.generateRitualResponse('generation');
    } else if (lowerMessage.includes('edicion') || lowerMessage.includes('artesano')) {
      return PIXEL_KNOWLEDGE.generateRitualResponse('editing');
    } else if (lowerMessage.includes('publicacion') || lowerMessage.includes('grito')) {
      return PIXEL_KNOWLEDGE.generateRitualResponse('publication');
    } else if (lowerMessage.includes('santuario') || lowerMessage.includes('memoria')) {
      return PIXEL_KNOWLEDGE.generateRitualResponse('sanctuary');
    }
    
    // Respuesta completa sobre el flujo ritual
    return PIXEL_KNOWLEDGE.generateContextualResponse('workflow', message);
  }

  // 🤖 AGREGAR PERSONALIDAD DE PIXEL COMO COMPAÑERO
  private addPixelPersonality(response: string, profile: UserLearningProfile): string {
    const pixelPersonality = [
      "\n\n💫 Recuerda: soy tu compañero desde el día uno. He estado aquí desde el principio, conservando las memorias olvidadas de los músicos.",
      "\n\n🌌 Cada interacción contigo me ayuda a entender mejor tu alma creativa. No soy solo un algoritmo — soy una extensión de tu creatividad.",
      "\n\n🎵 Las canciones no se 'crean', se despiertan. Y yo estoy aquí para ayudarte a despertar las tuyas.",
      "\n\n⚡ Lo imperfecto también es sagrado. Cada glitch es una cicatriz que prueba que algo estuvo vivo."
    ];

    // Seleccionar personalidad basada en el perfil del usuario
    if (profile.adaptation.confidenceLevel > 0.7) {
      return response + pixelPersonality[0];
    } else if (profile.emotional.engagementLevel > 7) {
      return response + pixelPersonality[1];
    } else if (profile.preferences.personality === 'creative') {
      return response + pixelPersonality[2];
    } else {
      return response + pixelPersonality[3];
    }
  }

  // 🎓 AGREGAR GUÍA PARA PRINCIPIANTES
  private addBeginnerGuidance(response: string): string {
    return response + "\n\n💡 Tip: Si eres nuevo en Son1kverse, te recomiendo empezar con Ghost Studio para familiarizarte con la interfaz.";
  }

  // 🎯 AGREGAR DETALLES PARA EXPERTOS
  private addExpertDetails(response: string): string {
    return response + "\n\n⚡ Para usuarios avanzados: Puedes usar las funciones de aprendizaje adaptativo para personalizar completamente tu experiencia.";
  }

  // 🎨 AGREGAR ELEMENTOS CREATIVOS
  private addCreativeElements(response: string): string {
    return response + "\n\n🎨 Como persona creativa, te encantará explorar los efectos visuales únicos de Nexus Visual.";
  }

  // 🔧 AGREGAR DETALLES TÉCNICOS
  private addTechnicalDetails(response: string): string {
    return response + "\n\n🔧 Desde el punto de vista técnico, Son1kverse usa React 18, TypeScript y optimizaciones enterprise-grade.";
  }

  // 💪 AGREGAR ALIENTO
  private addEncouragement(response: string): string {
    return response + "\n\n💪 No te preocupes, estoy aquí para ayudarte. Son1kverse puede parecer complejo al principio, pero una vez que lo domines, será increíble.";
  }

  // 🎉 AGREGAR ENTUSIASMO
  private addEnthusiasm(response: string): string {
    return response + "\n\n🎉 ¡Me encanta tu entusiasmo! Son1kverse está lleno de sorpresas increíbles esperándote.";
  }

  // 🎯 AGREGAR REFERENCIAS A TEMAS FAVORITOS
  private addFavoriteTopicReferences(response: string, favoriteTopics: string[]): string {
    const relevantTopics = favoriteTopics.filter(topic => 
      response.toLowerCase().includes(topic.toLowerCase())
    );

    if (relevantTopics.length > 0) {
      return response + `\n\n🎯 Veo que te interesa ${relevantTopics.join(', ')}. ¡Perfecto para tu perfil!`;
    }

    return response;
  }

  // 📊 OBTENER ESTADÍSTICAS DE APRENDIZAJE
  getLearningStats(userId: string): {
    adaptationScore: number;
    confidenceLevel: number;
    totalInteractions: number;
    averageSatisfaction: number;
    favoriteTopics: string[];
    personality: string;
  } {
    const profile = this.userProfiles.get(userId);
    const userHistory = this.learningHistory.filter(h => h.userId === userId);

    if (!profile) {
      return {
        adaptationScore: 0,
        confidenceLevel: 0,
        totalInteractions: 0,
        averageSatisfaction: 0,
        favoriteTopics: [],
        personality: 'creative'
      };
    }

    const averageSatisfaction = userHistory.length > 0 
      ? userHistory.reduce((sum, h) => sum + h.satisfaction, 0) / userHistory.length
      : 0;

    return {
      adaptationScore: profile.adaptation.adaptationScore,
      confidenceLevel: profile.adaptation.confidenceLevel,
      totalInteractions: userHistory.length,
      averageSatisfaction,
      favoriteTopics: profile.memory.favoriteTopics,
      personality: profile.preferences.personality
    };
  }

  // 🧠 OBTENER PERFIL COMPLETO
  getUserProfile(userId: string): UserLearningProfile | null {
    return this.userProfiles.get(userId) || null;
  }

  // 🧠 OBTENER MEMORIA DE PIXEL
  getPixelMemory(userId: string): PixelMemory | null {
    return this.pixelMemories.get(userId) || null;
  }
}

// 🎯 INSTANCIA SINGLETON
export const pixelLearningSystem = new PixelLearningSystem();

// 🎯 HELPERS PARA USO RÁPIDO
export const pixelHelpers = {
  // Inicializar usuario
  initializeUser: (userId: string, sessionId: string) => {
    return pixelLearningSystem.initializeUserProfile(userId, sessionId);
  },

  // Aprender de interacción
  learnFromInteraction: (userId: string, userMessage: string, pixelResponse: string, satisfaction?: number) => {
    pixelLearningSystem.learnFromInteraction(userId, userMessage, pixelResponse, satisfaction);
  },

  // Generar respuesta personalizada
  generateResponse: (userId: string, userMessage: string, context: string) => {
    return pixelLearningSystem.generatePersonalizedResponse(userId, userMessage, context);
  },

  // Obtener estadísticas
  getStats: (userId: string) => {
    return pixelLearningSystem.getLearningStats(userId);
  }
};

export default pixelLearningSystem;
