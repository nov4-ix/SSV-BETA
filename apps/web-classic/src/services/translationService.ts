// src/services/translationService.ts
// Servicio de traducción automática basado en análisis de extensión Chrome

export interface TranslationRequest {
  text: string;
  from?: string;
  to?: string;
}

export interface TranslationResponse {
  translatedText: string;
  detectedLanguage?: string;
  confidence?: number;
}

export interface SunoPromptTranslation {
  title: string;
  style: string;
  lyrics: string;
  messages: {
    generating: string;
    success: string;
    titleLabel: string;
    styleLabel: string;
    lyricsLabel: string;
    instrumental: string;
    video: string;
  };
}

class TranslationService {
  private readonly GOOGLE_TRANSLATE_API_KEY = 'AIzaSyATBXajvzQLTDHEQbcpq0Ihe0vWDHmO520';
  private readonly TRANSLATE_URL = 'https://translate-pa.googleapis.com/v1/translateHtml';
  
  /**
   * Traduce texto usando Google Translate API
   * Basado en el análisis de la extensión Chrome
   */
  async translateText(request: TranslationRequest): Promise<TranslationResponse> {
    try {
      const { text, from = 'auto', to = 'en' } = request;
      
      // Construir payload similar a la extensión
      const payload = [
        [
          [
            "v3",
            text, // Texto a traducir
            "", // Estilo (vacío para texto simple)
            "", // Mensaje de generación
            "", // Mensaje de éxito
            "", // Título
            "", // Estilo con HTML
            "", // Letras
            "", // Instrumental
            ""  // Video
          ],
          from, // Idioma origen
          to    // Idioma destino
        ],
        "te_lib"
      ];

      const response = await fetch(this.TRANSLATE_URL, {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'accept-language': 'es-419,es;q=0.9',
          'content-type': 'application/json+protobuf',
          'origin': 'https://son1kvers3.com', // Usar nuestro dominio
          'priority': 'u=1, i',
          'sec-ch-ua': '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'cross-site',
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
          'x-browser-channel': 'stable',
          'x-browser-copyright': 'Copyright 2025 Google LLC. All rights reserved.',
          'x-browser-validation': 'qSH0RgPhYS+tEktJTy2ahvLDO9s=',
          'x-browser-year': '2025',
          'x-client-data': 'CK2PywE=',
          'x-goog-api-key': this.GOOGLE_TRANSLATE_API_KEY
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Translation failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Extraer texto traducido de la respuesta
      let translatedText = text; // Fallback al texto original
      
      if (data && data[0] && data[0][0] && Array.isArray(data[0][0])) {
        translatedText = data[0][0][1] || text;
      }

      return {
        translatedText,
        detectedLanguage: from === 'auto' ? 'es' : from,
        confidence: 0.9
      };

    } catch (error) {
      console.error('Translation error:', error);
      // Fallback: devolver texto original
      return {
        translatedText: request.text,
        detectedLanguage: 'es',
        confidence: 0.5
      };
    }
  }

  /**
   * Traduce prompts de Suno del español al inglés
   * Optimizado para generación musical
   */
  async translateSunoPrompt(spanishPrompt: string): Promise<string> {
    try {
      // Detectar si el prompt ya está en inglés
      const isEnglish = /^[a-zA-Z\s,.-]+$/.test(spanishPrompt);
      if (isEnglish) {
        return spanishPrompt;
      }

      // Traducir del español al inglés
      const result = await this.translateText({
        text: spanishPrompt,
        from: 'es',
        to: 'en'
      });

      return result.translatedText;

    } catch (error) {
      console.error('Suno prompt translation error:', error);
      return spanishPrompt; // Fallback al prompt original
    }
  }

  /**
   * Traduce interfaz completa de Suno
   * Basado en el análisis de la extensión
   */
  async translateSunoInterface(spanishContent: SunoPromptTranslation): Promise<SunoPromptTranslation> {
    try {
      const [title, style, lyrics, generating, success, titleLabel, styleLabel, lyricsLabel, instrumental, video] = await Promise.all([
        this.translateText({ text: spanishContent.title, from: 'es', to: 'en' }),
        this.translateText({ text: spanishContent.style, from: 'es', to: 'en' }),
        this.translateText({ text: spanishContent.lyrics, from: 'es', to: 'en' }),
        this.translateText({ text: spanishContent.messages.generating, from: 'es', to: 'en' }),
        this.translateText({ text: spanishContent.messages.success, from: 'es', to: 'en' }),
        this.translateText({ text: spanishContent.messages.titleLabel, from: 'es', to: 'en' }),
        this.translateText({ text: spanishContent.messages.styleLabel, from: 'es', to: 'en' }),
        this.translateText({ text: spanishContent.messages.lyricsLabel, from: 'es', to: 'en' }),
        this.translateText({ text: spanishContent.messages.instrumental, from: 'es', to: 'en' }),
        this.translateText({ text: spanishContent.messages.video, from: 'es', to: 'en' })
      ]);

      return {
        title: title.translatedText,
        style: style.translatedText,
        lyrics: lyrics.translatedText,
        messages: {
          generating: generating.translatedText,
          success: success.translatedText,
          titleLabel: titleLabel.translatedText,
          styleLabel: styleLabel.translatedText,
          lyricsLabel: lyricsLabel.translatedText,
          instrumental: instrumental.translatedText,
          video: video.translatedText
        }
      };

    } catch (error) {
      console.error('Suno interface translation error:', error);
      return spanishContent; // Fallback al contenido original
    }
  }

  /**
   * Detecta el idioma del texto
   */
  async detectLanguage(text: string): Promise<string> {
    try {
      // Detección simple basada en caracteres
      if (/^[a-zA-Z\s,.-]+$/.test(text)) {
        return 'en';
      }
      if (/^[a-zA-Záéíóúñü\s,.-]+$/i.test(text)) {
        return 'es';
      }
      return 'auto';
    } catch (error) {
      return 'auto';
    }
  }

  /**
   * Optimiza prompt para Suno
   * Aplica reglas específicas para generación musical
   */
  optimizePromptForSuno(prompt: string): string {
    let optimized = prompt;

    // Asegurar que esté en inglés
    if (!/^[a-zA-Z\s,.-]+$/.test(prompt)) {
      // Si no está en inglés, intentar traducir
      this.translateSunoPrompt(prompt).then(translated => {
        optimized = translated;
      });
    }

    // Optimizaciones específicas para Suno
    optimized = optimized
      .replace(/indie rock/gi, 'indie rock, alternative')
      .replace(/guitarra eléctrica/gi, 'electric guitar')
      .replace(/guitarra acústica/gi, 'acoustic guitar')
      .replace(/batería/gi, 'drums')
      .replace(/bajo/gi, 'bass')
      .replace(/vintage/gi, 'vintage sound')
      .replace(/analógico/gi, 'analog')
      .replace(/energético/gi, 'energetic')
      .replace(/melancólico/gi, 'melancholic')
      .replace(/romántico/gi, 'romantic');

    return optimized;
  }
}

// Instancia singleton
export const translationService = new TranslationService();

// Hook para React
export function useTranslation() {
  return {
    translateText: translationService.translateText.bind(translationService),
    translateSunoPrompt: translationService.translateSunoPrompt.bind(translationService),
    translateSunoInterface: translationService.translateSunoInterface.bind(translationService),
    detectLanguage: translationService.detectLanguage.bind(translationService),
    optimizePromptForSuno: translationService.optimizePromptForSuno.bind(translationService)
  };
}

export default translationService;
