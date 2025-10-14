// src/services/browserClientManager.ts

// Configuración de API
const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

interface BrowserClient {
  id: string;
  token: string;
  lastUsed: number;
  isActive: boolean;
  requests: number;
  failures: number;
}

class BrowserClientManager {
  private clients: Map<string, BrowserClient> = new Map();
  private readonly MAX_CLIENTS = 5;
  private readonly TOKEN_REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutos
  private readonly FAILURE_THRESHOLD = 3;

  constructor() {
    this.initializeClients();
    this.startTokenRefresh();
  }

  private async initializeClients() {
    console.log('🔧 Inicializando clientes por navegador...');
    
    // Crear múltiples clientes con tokens diferentes
    for (let i = 0; i < this.MAX_CLIENTS; i++) {
      try {
        const token = await this.generateNewToken();
        const clientId = `client_${i}_${Date.now()}`;
        
        this.clients.set(clientId, {
          id: clientId,
          token,
          lastUsed: Date.now(),
          isActive: true,
          requests: 0,
          failures: 0
        });
        
        console.log(`✅ Cliente ${i + 1} inicializado`);
      } catch (error) {
        console.error(`❌ Error inicializando cliente ${i + 1}:`, error);
      }
    }
  }

  private async generateNewToken(): Promise<string> {
    // Simular obtención de token (en producción sería real)
    const tokens = [
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJNQVo0R082WHlSUm1odDdSWmtuMUZwSk1ua3VLM0hSeSIsImV4cCI6MTc2MDI5OTc1M30.AikRZXWRwb2pyQ8JlpjX3gTMfrIAoBTAl4pXXIbNnDE',
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ5ekxZdk94NlFWSEEwQTlaY0xWajlBajJscWZBWU9ZVCIsImV4cCI6MTc2MDI5ODc4MH0.XrOQfalMemutWFQxRaSycwzZPX6593xdIPKi60aFDvc',
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJQUFJpaEQ5S2xBZHhCNkxWWkxweEpuRjc3ZHJjRm1hUyIsImV4cCI6MTc2MDI3Mzk5Mn0.VawUyvM6Zqik2fdRSHchm60_gXs4VUcFpc5Mw00K9Ew'
    ];
    
    return tokens[Math.floor(Math.random() * tokens.length)];
  }

  private startTokenRefresh() {
    setInterval(() => {
      this.refreshExpiredTokens();
    }, this.TOKEN_REFRESH_INTERVAL);
  }

  private async refreshExpiredTokens() {
    console.log('🔄 Refrescando tokens expirados...');
    
    for (const [clientId, client] of this.clients) {
      if (Date.now() - client.lastUsed > this.TOKEN_REFRESH_INTERVAL) {
        try {
          const newToken = await this.generateNewToken();
          client.token = newToken;
          client.failures = 0;
          console.log(`✅ Token refrescado para ${clientId}`);
        } catch (error) {
          console.error(`❌ Error refrescando token para ${clientId}:`, error);
        }
      }
    }
  }

  getBestClient(): BrowserClient | null {
    const activeClients = Array.from(this.clients.values())
      .filter(client => client.isActive && client.failures < this.FAILURE_THRESHOLD)
      .sort((a, b) => {
        // Priorizar clientes con menos requests y menos failures
        const scoreA = a.requests + (a.failures * 2);
        const scoreB = b.requests + (b.failures * 2);
        return scoreA - scoreB;
      });

    return activeClients[0] || null;
  }

  markClientSuccess(clientId: string) {
    const client = this.clients.get(clientId);
    if (client) {
      client.requests++;
      client.lastUsed = Date.now();
      client.failures = Math.max(0, client.failures - 1); // Reducir failures gradualmente
    }
  }

  markClientFailure(clientId: string) {
    const client = this.clients.get(clientId);
    if (client) {
      client.failures++;
      client.lastUsed = Date.now();
      
      // Desactivar cliente si tiene muchos failures
      if (client.failures >= this.FAILURE_THRESHOLD) {
        client.isActive = false;
        console.log(`⚠️ Cliente ${clientId} desactivado por demasiados fallos`);
        
        // Intentar reactivar después de un tiempo
        setTimeout(() => {
          client.isActive = true;
          client.failures = 0;
          console.log(`🔄 Cliente ${clientId} reactivado`);
        }, 5 * 60 * 1000); // 5 minutos
      }
    }
  }

  async generateMusic(params: any): Promise<any> {
    const client = this.getBestClient();
    
    if (!client) {
      throw new Error('No hay clientes disponibles');
    }

    console.log(`🎵 Generando música con cliente ${client.id}...`);

    try {
      const response = await fetch(`${API_BASE_URL}/suno-generate-and-wait`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-ID': client.id,
          'X-Client-Token': client.token
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Generation failed');
      }

      this.markClientSuccess(client.id);
      console.log(`✅ Música generada exitosamente con cliente ${client.id}`);
      
      return result;

    } catch (error) {
      this.markClientFailure(client.id);
      console.error(`❌ Error con cliente ${client.id}:`, error);
      throw error;
    }
  }

  getStats() {
    const clients = Array.from(this.clients.values());
    return {
      total: clients.length,
      active: clients.filter(c => c.isActive).length,
      inactive: clients.filter(c => !c.isActive).length,
      totalRequests: clients.reduce((sum, c) => sum + c.requests, 0),
      totalFailures: clients.reduce((sum, c) => sum + c.failures, 0),
      clients: clients.map(c => ({
        id: c.id,
        isActive: c.isActive,
        requests: c.requests,
        failures: c.failures,
        lastUsed: new Date(c.lastUsed).toISOString()
      }))
    };
  }

  // Método para debugging
  debugClients() {
    console.log('🔍 Estado de clientes:', this.getStats());
  }
}

export const browserClientManager = new BrowserClientManager();
