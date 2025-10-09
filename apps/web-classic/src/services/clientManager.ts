/**
 * 🌐 GESTOR DE CLIENTES ÚNICOS POR NAVEGADOR
 * 
 * Sistema para crear un cliente único por navegador para evitar
 * sobrecargar la extensión de Suno y tener escalabilidad.
 * 
 * ⚠️ CRÍTICO: Un cliente por navegador = mejor distribución de carga
 */

export interface ClientInfo {
  id: string;
  browserId: string;
  userAgent: string;
  platform: string;
  language: string;
  timezone: string;
  screenResolution: string;
  createdAt: Date;
  lastActive: Date;
  isActive: boolean;
  generationCount: number;
  maxGenerations: number;
}

export interface ClientRegistration {
  success: boolean;
  clientId: string;
  message: string;
  limits?: {
    maxGenerations: number;
    resetTime: Date;
  };
}

class ClientManager {
  private static instance: ClientManager;
  private currentClient: ClientInfo | null = null;
  private readonly CLIENT_STORAGE_KEY = 'suno_client_info';
  private readonly CLIENT_ID_KEY = 'suno_client_id';
  private readonly MAX_GENERATIONS_PER_CLIENT = 10; // Límite por cliente
  private readonly CLIENT_LIFETIME_HOURS = 24;

  private constructor() {
    this.initializeClient();
  }

  static getInstance(): ClientManager {
    if (!ClientManager.instance) {
      ClientManager.instance = new ClientManager();
    }
    return ClientManager.instance;
  }

  /**
   * 🚀 INICIALIZAR CLIENTE
   */
  private async initializeClient(): Promise<void> {
    try {
      // Verificar si ya existe un cliente
      const existingClient = this.loadExistingClient();
      
      if (existingClient && this.isClientValid(existingClient)) {
        this.currentClient = existingClient;
        this.updateClientActivity();
        console.log('✅ Cliente existente cargado:', this.currentClient.id);
        return;
      }

      // Crear nuevo cliente
      await this.createNewClient();
      
    } catch (error) {
      console.error('❌ Error inicializando cliente:', error);
    }
  }

  /**
   * 🆕 CREAR NUEVO CLIENTE
   */
  private async createNewClient(): Promise<void> {
    try {
      const clientId = this.generateClientId();
      const browserId = this.generateBrowserId();

      this.currentClient = {
        id: clientId,
        browserId: browserId,
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screenResolution: `${screen.width}x${screen.height}`,
        createdAt: new Date(),
        lastActive: new Date(),
        isActive: true,
        generationCount: 0,
        maxGenerations: this.MAX_GENERATIONS_PER_CLIENT
      };

      // Guardar cliente localmente
      this.saveClientLocally();

      // Registrar cliente en el backend
      await this.registerClientWithBackend();

      console.log('✅ Nuevo cliente creado:', this.currentClient.id);

    } catch (error) {
      console.error('❌ Error creando cliente:', error);
      throw error;
    }
  }

  /**
   * 📝 REGISTRAR CLIENTE EN BACKEND
   */
  private async registerClientWithBackend(): Promise<void> {
    if (!this.currentClient) {
      throw new Error('No hay cliente actual para registrar');
    }

    try {
      const response = await fetch('/api/v1/clients/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: this.currentClient.id,
          browserId: this.currentClient.browserId,
          userAgent: this.currentClient.userAgent,
          platform: this.currentClient.platform,
          language: this.currentClient.language,
          timezone: this.currentClient.timezone,
          screenResolution: this.currentClient.screenResolution,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error registrando cliente: ${response.statusText}`);
      }

      const result: ClientRegistration = await response.json();
      
      if (result.success) {
        console.log('✅ Cliente registrado en backend:', result.clientId);
        
        // Actualizar límites si vienen del backend
        if (result.limits) {
          this.currentClient.maxGenerations = result.limits.maxGenerations;
        }
      } else {
        throw new Error(result.message);
      }

    } catch (error) {
      console.error('❌ Error registrando cliente en backend:', error);
      // No lanzar error, el cliente puede funcionar sin registro en backend
    }
  }

  /**
   * 🆔 GENERAR ID ÚNICO DE CLIENTE
   */
  private generateClientId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    const browserId = this.generateBrowserId();
    
    return `client_${timestamp}_${random}_${browserId}`;
  }

  /**
   * 🌐 GENERAR ID ÚNICO DE NAVEGADOR
   */
  private generateBrowserId(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx!.textBaseline = 'top';
    ctx!.font = '14px Arial';
    ctx!.fillText('Browser fingerprint', 2, 2);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');

    // Crear hash simple del fingerprint
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a 32bit integer
    }

    return Math.abs(hash).toString(36);
  }

  /**
   * 💾 CARGAR CLIENTE EXISTENTE
   */
  private loadExistingClient(): ClientInfo | null {
    try {
      const stored = localStorage.getItem(this.CLIENT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          createdAt: new Date(parsed.createdAt),
          lastActive: new Date(parsed.lastActive)
        };
      }
    } catch (error) {
      console.warn('⚠️ Error cargando cliente existente:', error);
    }
    return null;
  }

  /**
   * 💾 GUARDAR CLIENTE LOCALMENTE
   */
  private saveClientLocally(): void {
    if (!this.currentClient) return;

    try {
      localStorage.setItem(this.CLIENT_STORAGE_KEY, JSON.stringify(this.currentClient));
      localStorage.setItem(this.CLIENT_ID_KEY, this.currentClient.id);
    } catch (error) {
      console.warn('⚠️ Error guardando cliente localmente:', error);
    }
  }

  /**
   * ✅ VERIFICAR SI EL CLIENTE ES VÁLIDO
   */
  private isClientValid(client: ClientInfo): boolean {
    // Verificar si el cliente no ha expirado
    const now = new Date();
    const clientAge = now.getTime() - client.createdAt.getTime();
    const maxAge = this.CLIENT_LIFETIME_HOURS * 60 * 60 * 1000;

    if (clientAge > maxAge) {
      console.log('🔄 Cliente expirado, creando nuevo');
      return false;
    }

    // Verificar si el cliente no ha alcanzado el límite de generaciones
    if (client.generationCount >= client.maxGenerations) {
      console.log('🔄 Cliente alcanzó límite de generaciones, creando nuevo');
      return false;
    }

    return true;
  }

  /**
   * 📊 ACTUALIZAR ACTIVIDAD DEL CLIENTE
   */
  private updateClientActivity(): void {
    if (!this.currentClient) return;

    this.currentClient.lastActive = new Date();
    this.saveClientLocally();
  }

  /**
   * 🎵 REGISTRAR GENERACIÓN
   */
  async registerGeneration(): Promise<boolean> {
    if (!this.currentClient) {
      console.error('❌ No hay cliente actual');
      return false;
    }

    // Verificar límites
    if (this.currentClient.generationCount >= this.currentClient.maxGenerations) {
      console.warn('⚠️ Cliente alcanzó límite de generaciones');
      return false;
    }

    // Incrementar contador
    this.currentClient.generationCount++;
    this.updateClientActivity();

    console.log(`🎵 Generación registrada. Usadas: ${this.currentClient.generationCount}/${this.currentClient.maxGenerations}`);

    return true;
  }

  /**
   * 📊 OBTENER INFORMACIÓN DEL CLIENTE ACTUAL
   */
  getCurrentClient(): ClientInfo | null {
    return this.currentClient;
  }

  /**
   * 🔄 REINICIAR CLIENTE
   */
  async resetClient(): Promise<void> {
    console.log('🔄 Reiniciando cliente...');
    
    // Limpiar almacenamiento local
    localStorage.removeItem(this.CLIENT_STORAGE_KEY);
    localStorage.removeItem(this.CLIENT_ID_KEY);
    
    // Crear nuevo cliente
    await this.createNewClient();
  }

  /**
   * 📈 OBTENER ESTADÍSTICAS DEL CLIENTE
   */
  getClientStats() {
    if (!this.currentClient) {
      return null;
    }

    return {
      id: this.currentClient.id,
      generationCount: this.currentClient.generationCount,
      maxGenerations: this.currentClient.maxGenerations,
      remainingGenerations: this.currentClient.maxGenerations - this.currentClient.generationCount,
      createdAt: this.currentClient.createdAt,
      lastActive: this.currentClient.lastActive,
      isActive: this.currentClient.isActive,
      browserId: this.currentClient.browserId
    };
  }

  /**
   * 🔍 VERIFICAR DISPONIBILIDAD
   */
  canGenerate(): boolean {
    if (!this.currentClient) {
      return false;
    }

    return this.currentClient.generationCount < this.currentClient.maxGenerations;
  }

  /**
   * 🏥 VERIFICAR SALUD DEL CLIENTE
   */
  getClientHealth() {
    if (!this.currentClient) {
      return { status: 'no_client', message: 'No hay cliente activo' };
    }

    const now = new Date();
    const timeSinceLastActive = now.getTime() - this.currentClient.lastActive.getTime();
    const timeSinceCreated = now.getTime() - this.currentClient.createdAt.getTime();

    if (timeSinceLastActive > 60 * 60 * 1000) { // 1 hora
      return { status: 'inactive', message: 'Cliente inactivo por más de 1 hora' };
    }

    if (timeSinceCreated > this.CLIENT_LIFETIME_HOURS * 60 * 60 * 1000) {
      return { status: 'expired', message: 'Cliente expirado' };
    }

    if (this.currentClient.generationCount >= this.currentClient.maxGenerations) {
      return { status: 'limit_reached', message: 'Límite de generaciones alcanzado' };
    }

    return { 
      status: 'healthy', 
      message: 'Cliente funcionando correctamente',
      remainingGenerations: this.currentClient.maxGenerations - this.currentClient.generationCount
    };
  }
}

// Exportar instancia singleton
export const clientManager = ClientManager.getInstance();

// ⚠️ ADVERTENCIA DE USO
console.warn('🌐 CLIENT MANAGER: Sistema de clientes únicos por navegador inicializado');
console.warn('📊 Cada navegador = 1 cliente = mejor distribución de carga');
