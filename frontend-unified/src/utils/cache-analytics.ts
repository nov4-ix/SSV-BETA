import React, { useState, useEffect, useCallback, useMemo } from 'react';

// 📊 SISTEMA DE CACHÉ INTELIGENTE - MIGRADO DE SSV-BETA 📊

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items
  strategy?: 'lru' | 'fifo' | 'lfu'; // Cache eviction strategy
}

interface CacheItem<T> {
  value: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

export class IntelligentCache<T = any> {
  private cache = new Map<string, CacheItem<T>>();
  private options: Required<CacheOptions>;

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl || 300000, // 5 minutes default
      maxSize: options.maxSize || 1000,
      strategy: options.strategy || 'lru',
    };
  }

  set(key: string, value: T): void {
    const now = Date.now();
    
    // Si el cache está lleno, eliminar un elemento
    if (this.cache.size >= this.options.maxSize) {
      this.evict();
    }

    this.cache.set(key, {
      value,
      timestamp: now,
      accessCount: 0,
      lastAccessed: now,
    });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;

    const now = Date.now();
    
    // Verificar TTL
    if (now - item.timestamp > this.options.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Actualizar estadísticas de acceso
    item.accessCount++;
    item.lastAccessed = now;

    return item.value;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  private evict(): void {
    switch (this.options.strategy) {
      case 'lru':
        this.evictLRU();
        break;
      case 'fifo':
        this.evictFIFO();
        break;
      case 'lfu':
        this.evictLFU();
        break;
    }
  }

  private evictLRU(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  private evictFIFO(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  private evictLFU(): void {
    let leastUsedKey = '';
    let leastUsedCount = Infinity;

    for (const [key, item] of this.cache.entries()) {
      if (item.accessCount < leastUsedCount) {
        leastUsedCount = item.accessCount;
        leastUsedKey = key;
      }
    }

    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
    }
  }

  // Estadísticas del cache
  getStats() {
    const now = Date.now();
    let totalAccesses = 0;
    let expiredItems = 0;

    for (const item of this.cache.values()) {
      totalAccesses += item.accessCount;
      if (now - item.timestamp > this.options.ttl) {
        expiredItems++;
      }
    }

    return {
      size: this.cache.size,
      maxSize: this.options.maxSize,
      hitRate: totalAccesses > 0 ? (totalAccesses - expiredItems) / totalAccesses : 0,
      expiredItems,
      strategy: this.options.strategy,
    };
  }
}

// 📈 SISTEMA DE ANALYTICS AVANZADO - MIGRADO DE SSV-BETA 📈

interface AnalyticsEvent {
  name: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
  timestamp: number;
}

interface AnalyticsSession {
  sessionId: string;
  startTime: number;
  endTime?: number;
  events: AnalyticsEvent[];
  pageViews: string[];
  interactions: Record<string, number>;
}

export class AnalyticsManager {
  private events: AnalyticsEvent[] = [];
  private session: AnalyticsSession;
  private cache: IntelligentCache<AnalyticsEvent[]>;

  constructor() {
    this.session = {
      sessionId: this.generateSessionId(),
      startTime: Date.now(),
      events: [],
      pageViews: [],
      interactions: {},
    };
    
    this.cache = new IntelligentCache({
      ttl: 300000, // 5 minutes
      maxSize: 1000,
      strategy: 'lru',
    });
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  track(
    name: string,
    category: string,
    action: string,
    label?: string,
    value?: number,
    properties?: Record<string, any>
  ): void {
    const event: AnalyticsEvent = {
      name,
      category,
      action,
      label,
      value,
      properties,
      timestamp: Date.now(),
    };

    this.events.push(event);
    this.session.events.push(event);

    // Cachear eventos recientes
    const cacheKey = `events_${category}_${action}`;
    const cachedEvents = this.cache.get(cacheKey) || [];
    cachedEvents.push(event);
    this.cache.set(cacheKey, cachedEvents);

    // Log para desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', event);
    }
  }

  trackPageView(page: string, title?: string): void {
    this.session.pageViews.push(page);
    this.track('page_view', 'navigation', 'view', title || page);
  }

  trackInteraction(element: string, action: string, properties?: Record<string, any>): void {
    const interactionKey = `${element}_${action}`;
    this.session.interactions[interactionKey] = (this.session.interactions[interactionKey] || 0) + 1;
    
    this.track('interaction', 'user_interaction', action, element, undefined, properties);
  }

  trackError(error: Error, context?: Record<string, any>): void {
    this.track('error', 'error', 'occurred', error.message, undefined, {
      stack: error.stack,
      context,
    });
  }

  trackConversion(goal: string, value?: number, properties?: Record<string, any>): void {
    this.track('conversion', 'conversion', 'achieved', goal, value, properties);
  }

  // Obtener estadísticas
  getStats() {
    const now = Date.now();
    const sessionDuration = now - this.session.startTime;
    
    return {
      session: {
        id: this.session.sessionId,
        duration: sessionDuration,
        pageViews: this.session.pageViews.length,
        interactions: Object.keys(this.session.interactions).length,
      },
      events: {
        total: this.events.length,
        recent: this.events.filter(e => now - e.timestamp < 300000).length, // Últimos 5 minutos
      },
      cache: this.cache.getStats(),
    };
  }

  // Flush events (enviar a servidor)
  flush(): void {
    if (this.events.length === 0) return;

    // Aquí enviarías los eventos al servidor
    console.log('Flushing analytics events:', this.events);
    
    // Limpiar eventos después del flush
    this.events = [];
  }

  destroy(): void {
    this.session.endTime = Date.now();
    this.flush();
  }
}

// 🎣 HOOKS DE REACT PARA CACHÉ Y ANALYTICS 🎣

export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: CacheOptions
): { data: T | null; loading: boolean; error: Error | null; refetch: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const cache = useMemo(() => new IntelligentCache<T>(options), [options]);

  const fetchData = useCallback(async () => {
    // Check cache first
    const cachedData = cache.get(key);
    if (cachedData !== null) {
      setData(cachedData);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      cache.set(key, result);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, cache]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    cache.delete(key);
    fetchData();
  }, [key, fetchData, cache]);

  return { data, loading, error, refetch };
}

export function useAnalytics() {
  const analyticsManager = useMemo(() => new AnalyticsManager(), []);

  const track = useCallback((
    name: string,
    category: string,
    action: string,
    label?: string,
    value?: number,
    properties?: Record<string, any>
  ) => {
    analyticsManager.track(name, category, action, label, value, properties);
  }, [analyticsManager]);

  const trackPageView = useCallback((page: string, title?: string) => {
    analyticsManager.trackPageView(page, title);
  }, [analyticsManager]);

  const trackInteraction = useCallback((
    element: string,
    action: string,
    properties?: Record<string, any>
  ) => {
    analyticsManager.trackInteraction(element, action, properties);
  }, [analyticsManager]);

  const trackError = useCallback((error: Error, context?: Record<string, any>) => {
    analyticsManager.trackError(error, context);
  }, [analyticsManager]);

  const trackConversion = useCallback((
    goal: string,
    value?: number,
    properties?: Record<string, any>
  ) => {
    analyticsManager.trackConversion(goal, value, properties);
  }, [analyticsManager]);

  useEffect(() => {
    return () => {
      analyticsManager.destroy();
    };
  }, [analyticsManager]);

  return {
    track,
    trackPageView,
    trackInteraction,
    trackError,
    trackConversion,
    analyticsManager
  };
}

// Exportar instancias globales
export const globalCacheManager = new IntelligentCache();
export const globalAnalyticsManager = new AnalyticsManager();
