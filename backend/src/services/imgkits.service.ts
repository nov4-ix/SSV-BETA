import axios from 'axios';

// ────────────────────────────────────────────────────────────────────────────────
// IMGKITS SERVICE - PROXY PARA SUNO AI
// ────────────────────────────────────────────────────────────────────────────────

interface ImgkitsAccount {
  id: string;
  email: string;
  password: string;
  userToken?: string;
  isActive: boolean;
  lastUsed: Date;
  usageCount: number;
  maxUsagePerDay: number;
}

interface SunoGenerationRequest {
  prompt: string;
  style?: string;
  title?: string;
  customMode?: boolean;
  instrumental?: boolean;
  lyrics?: string;
  gender?: string;
}

interface SunoGenerationResponse {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  audioUrl?: string;
  imageUrl?: string;
  error?: string;
}

class ImgkitsService {
  private accounts: ImgkitsAccount[] = [];
  private currentAccountIndex = 0;
  private readonly SUNO_GENERATE_URL = 'https://ai.imgkits.com/suno/generate';
  private readonly SUNO_POLLING_URL = 'https://usa.imgkits.com/node-api/suno';
  
  // Headers de la extensión Chrome (funcionan sin autenticación)
  private readonly EXTENSION_HEADERS = {
    'accept': 'application/json, text/plain, */*',
    'accept-language': 'es-419,es;q=0.9',
    'authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJQUFJpaEQ5S2xBZHhCNkxWWkxweEpuRjc3ZHJjRm1hUyIsImV4cCI6MTc2MDI3Mzk5Mn0.VawUyvM6Zqik2fdRSHchm60_gXs4VUcFpc5Mw00K9Ew',
    'channel': 'node-api',
    'content-type': 'application/json',
    'origin': 'chrome-extension://opejieigkdpkdjifkahjmmmpmnebfjbo',
    'sec-ch-ua': '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'cross-site',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'
  };

  constructor() {
    this.initializeAccounts();
  }

  // ────────────────────────────────────────────────────────────────────────────────
  // INICIALIZACIÓN DE CUENTAS
  // ────────────────────────────────────────────────────────────────────────────────
  
  private initializeAccounts() {
    // Cuentas de imgkits para el pool
    this.accounts = [
      {
        id: 'imgkits_1',
        email: 'son1kvers3.1@gmail.com',
        password: 'Son1kvers3!2024',
        isActive: true,
        lastUsed: new Date(),
        usageCount: 0,
        maxUsagePerDay: 50
      },
      {
        id: 'imgkits_2',
        email: 'son1kvers3.2@gmail.com',
        password: 'Son1kvers3!2024',
        isActive: true,
        lastUsed: new Date(),
        usageCount: 0,
        maxUsagePerDay: 50
      },
      {
        id: 'imgkits_3',
        email: 'son1kvers3.3@gmail.com',
        password: 'Son1kvers3!2024',
        isActive: true,
        lastUsed: new Date(),
        usageCount: 0,
        maxUsagePerDay: 50
      }
    ];

    console.log(`🎵 ImgkitsService initialized with ${this.accounts.length} accounts`);
  }

  // ────────────────────────────────────────────────────────────────────────────────
  // AUTENTICACIÓN CON IMGKITS
  // ────────────────────────────────────────────────────────────────────────────────
  
  private async authenticateAccount(account: ImgkitsAccount): Promise<string | null> {
    try {
      console.log(`🔐 Authenticating imgkits account: ${account.email}`);
      
      const response = await axios.post(`${this.IMGKITS_AUTH_URL}/login`, {
        email: account.email,
        password: account.password
      }, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      });

      if (response.data && response.data.token) {
        account.userToken = response.data.token;
        console.log(`✅ Authentication successful for ${account.email}`);
        return response.data.token;
      }

      throw new Error('No token received');
    } catch (error: any) {
      console.error(`❌ Authentication failed for ${account.email}:`, error.message);
      return null;
    }
  }

  // ────────────────────────────────────────────────────────────────────────────────
  // OBTENER CUENTA DISPONIBLE
  // ────────────────────────────────────────────────────────────────────────────────
  
  private async getAvailableAccount(): Promise<ImgkitsAccount | null> {
    // Buscar cuenta activa con token válido
    for (let i = 0; i < this.accounts.length; i++) {
      const account = this.accounts[i];
      
      if (!account.isActive) continue;
      if (account.usageCount >= account.maxUsagePerDay) continue;
      
      // Si no tiene token, autenticar
      if (!account.userToken) {
        const token = await this.authenticateAccount(account);
        if (token) {
          return account;
        }
      } else {
        return account;
      }
    }

    // Si no hay cuentas disponibles, rotar y autenticar
    this.currentAccountIndex = (this.currentAccountIndex + 1) % this.accounts.length;
    const account = this.accounts[this.currentAccountIndex];
    
    if (account.isActive) {
      const token = await this.authenticateAccount(account);
      if (token) {
        return account;
      }
    }

    console.error('❌ No available imgkits accounts');
    return null;
  }

  // ────────────────────────────────────────────────────────────────────────────────
  // GENERACIÓN DE MÚSICA CON SUNO VÍA IMGKITS
  // ────────────────────────────────────────────────────────────────────────────────
  
  async generateMusic(request: SunoGenerationRequest): Promise<SunoGenerationResponse> {
    try {
      console.log('🎵 Starting music generation via imgkits...');
      
      // Obtener cuenta disponible
      const account = await this.getAvailableAccount();
      if (!account || !account.userToken) {
        throw new Error('No available imgkits accounts');
      }

      // Preparar request para imgkits
      const imgkitsRequest = {
        prompt: request.prompt,
        style: request.style || '',
        title: request.title || '',
        customMode: request.customMode || false,
        instrumental: request.instrumental || false,
        lyrics: request.lyrics || '',
        gender: request.gender || ''
      };

      console.log('📤 Sending request to imgkits:', imgkitsRequest);

      // Hacer request a imgkits
      const response = await axios.post(`${this.IMGKITS_BASE_URL}/generate`, imgkitsRequest, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${account.userToken}`,
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        },
        timeout: 30000
      });

      // Actualizar estadísticas de la cuenta
      account.usageCount++;
      account.lastUsed = new Date();

      console.log('✅ Music generation request sent successfully');

      return {
        taskId: response.data.taskId || response.data.id || `task_${Date.now()}`,
        status: 'pending'
      };

    } catch (error: any) {
      console.error('❌ Music generation failed:', error.message);
      return {
        taskId: `error_${Date.now()}`,
        status: 'failed',
        error: error.message
      };
    }
  }

  // ────────────────────────────────────────────────────────────────────────────────
  // VERIFICAR ESTADO DE GENERACIÓN
  // ────────────────────────────────────────────────────────────────────────────────
  
  async checkGenerationStatus(taskId: string): Promise<SunoGenerationResponse> {
    try {
      // Obtener cuenta disponible
      const account = await this.getAvailableAccount();
      if (!account || !account.userToken) {
        throw new Error('No available imgkits accounts');
      }

      // Verificar estado en imgkits
      const response = await axios.get(`${this.IMGKITS_BASE_URL}/status/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${account.userToken}`,
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        },
        timeout: 10000
      });

      const data = response.data;

      if (data.status === 'completed' && data.audioUrl) {
        return {
          taskId,
          status: 'completed',
          audioUrl: data.audioUrl,
          imageUrl: data.imageUrl
        };
      } else if (data.status === 'failed') {
        return {
          taskId,
          status: 'failed',
          error: data.error || 'Generation failed'
        };
      } else {
        return {
          taskId,
          status: 'processing'
        };
      }

    } catch (error: any) {
      console.error('❌ Status check failed:', error.message);
      return {
        taskId,
        status: 'failed',
        error: error.message
      };
    }
  }

  // ────────────────────────────────────────────────────────────────────────────────
  // ESTADÍSTICAS DEL SERVICIO
  // ────────────────────────────────────────────────────────────────────────────────
  
  getServiceStats() {
    const activeAccounts = this.accounts.filter(acc => acc.isActive);
    const totalUsage = this.accounts.reduce((sum, acc) => sum + acc.usageCount, 0);
    
    return {
      totalAccounts: this.accounts.length,
      activeAccounts: activeAccounts.length,
      totalUsageToday: totalUsage,
      accounts: this.accounts.map(acc => ({
        id: acc.id,
        email: acc.email,
        isActive: acc.isActive,
        usageCount: acc.usageCount,
        maxUsagePerDay: acc.maxUsagePerDay,
        lastUsed: acc.lastUsed,
        hasToken: !!acc.userToken
      }))
    };
  }

  // ────────────────────────────────────────────────────────────────────────────────
  // REINICIAR CUENTAS (RESET DIARIO)
  // ────────────────────────────────────────────────────────────────────────────────
  
  resetDailyUsage() {
    this.accounts.forEach(account => {
      account.usageCount = 0;
      account.userToken = undefined; // Forzar re-autenticación
    });
    console.log('🔄 Daily usage reset for all imgkits accounts');
  }
}

// Instancia singleton
export const imgkitsService = new ImgkitsService();

// ────────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ────────────────────────────────────────────────────────────────────────────────

export type { SunoGenerationRequest, SunoGenerationResponse, ImgkitsAccount };
export { ImgkitsService };
