/**
 * 🎵 CLIENT MANAGER - GESTIÓN DE LÍMITES DEL CLIENTE
 * 
 * Maneja los límites de generación a nivel del cliente
 */

interface ClientLimits {
  dailyGenerations: number;
  maxDailyGenerations: number;
  lastResetDate: string;
}

class ClientManager {
  private readonly STORAGE_KEY = 'son1kverse_client_limits';
  private readonly MAX_DAILY_GENERATIONS = 5; // Límite diario por defecto

  private getLimits(): ClientLimits {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error reading client limits:', error);
    }

    return {
      dailyGenerations: 0,
      maxDailyGenerations: this.MAX_DAILY_GENERATIONS,
      lastResetDate: new Date().toDateString(),
    };
  }

  private saveLimits(limits: ClientLimits): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(limits));
    } catch (error) {
      console.error('Error saving client limits:', error);
    }
  }

  private shouldResetDailyLimit(lastResetDate: string): boolean {
    const today = new Date().toDateString();
    return lastResetDate !== today;
  }

  canGenerate(): boolean {
    const limits = this.getLimits();
    
    // Resetear límite diario si es un nuevo día
    if (this.shouldResetDailyLimit(limits.lastResetDate)) {
      const resetLimits: ClientLimits = {
        dailyGenerations: 0,
        maxDailyGenerations: this.MAX_DAILY_GENERATIONS,
        lastResetDate: new Date().toDateString(),
      };
      this.saveLimits(resetLimits);
      return true;
    }

    return limits.dailyGenerations < limits.maxDailyGenerations;
  }

  recordGeneration(): void {
    const limits = this.getLimits();
    
    // Resetear límite diario si es un nuevo día
    if (this.shouldResetDailyLimit(limits.lastResetDate)) {
      limits.dailyGenerations = 0;
      limits.lastResetDate = new Date().toDateString();
    }

    limits.dailyGenerations += 1;
    this.saveLimits(limits);
  }

  getRemainingGenerations(): number {
    const limits = this.getLimits();
    
    // Resetear límite diario si es un nuevo día
    if (this.shouldResetDailyLimit(limits.lastResetDate)) {
      return limits.maxDailyGenerations;
    }

    return Math.max(0, limits.maxDailyGenerations - limits.dailyGenerations);
  }

  getDailyUsage(): { used: number; limit: number } {
    const limits = this.getLimits();
    
    // Resetear límite diario si es un nuevo día
    if (this.shouldResetDailyLimit(limits.lastResetDate)) {
      return { used: 0, limit: limits.maxDailyGenerations };
    }

    return {
      used: limits.dailyGenerations,
      limit: limits.maxDailyGenerations,
    };
  }

  resetLimits(): void {
    const resetLimits: ClientLimits = {
      dailyGenerations: 0,
      maxDailyGenerations: this.MAX_DAILY_GENERATIONS,
      lastResetDate: new Date().toDateString(),
    };
    this.saveLimits(resetLimits);
  }
}

export const clientManager = new ClientManager();

