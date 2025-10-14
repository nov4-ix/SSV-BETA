/**
 * 🎯 NETLIFY FUNCTION: OPTIMIZAR PROMPT
 * 
 * Función para optimizar prompts musicales usando Qwen 2
 */

import { Handler } from '@netlify/functions';

interface OptimizePromptRequest {
  originalPrompt: string;
  context: 'music' | 'general' | 'creative';
  targetAudience: 'beginner' | 'intermediate' | 'expert';
  optimization: 'quality' | 'speed' | 'balance';
}

interface OptimizePromptResponse {
  optimizedPrompt: string;
  confidence: number;
  suggestions: string[];
  metadata: {
    originalLength: number;
    optimizedLength: number;
    improvement: number;
  };
}

export const handler: Handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Parse request body
    const request: OptimizePromptRequest = JSON.parse(event.body || '{}');
    
    // Validate request
    if (!request.originalPrompt) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'originalPrompt is required' })
      };
    }

    // Call Qwen 2 API
    const optimizedPrompt = await callQwenAPI(request);
    
    // Calculate metrics
    const metadata = {
      originalLength: request.originalPrompt.length,
      optimizedLength: optimizedPrompt.length,
      improvement: ((optimizedPrompt.length - request.originalPrompt.length) / request.originalPrompt.length) * 100
    };

    // Generate suggestions
    const suggestions = await generateSuggestions(request.originalPrompt);

    const response: OptimizePromptResponse = {
      optimizedPrompt,
      confidence: calculateConfidence(request, optimizedPrompt),
      suggestions,
      metadata
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('Error optimizing prompt:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

// 🧠 LLAMAR A QWEN 2 API
async function callQwenAPI(request: OptimizePromptRequest): Promise<string> {
  const prompt = `Eres un experto en generación de música con IA. Optimiza el siguiente prompt para obtener mejores resultados:

Prompt original: "${request.originalPrompt}"
Contexto: ${request.context}
Audiencia: ${request.targetAudience}
Optimización: ${request.optimization}

Instrucciones:
1. Mejora la claridad y especificidad
2. Agrega detalles musicales relevantes si faltan
3. Mantén el estilo original
4. Optimiza para ${request.optimization}
5. Responde SOLO con el prompt optimizado

Prompt optimizado:`;

  const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.QWEN_API_KEY}`,
      'X-DashScope-SSE': 'enable'
    },
    body: JSON.stringify({
      model: 'qwen2-7b-instruct',
      input: {
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      },
      parameters: {
        max_tokens: 512,
        temperature: 0.7
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Qwen API error: ${response.status}`);
  }

  const data = await response.json();
  return data.output.text.trim();
}

// 💡 GENERAR SUGERENCIAS
async function generateSuggestions(originalPrompt: string): Promise<string[]> {
  const suggestions = [];
  
  // Análisis básico del prompt
  if (!/instrumento|guitarra|piano|batería/i.test(originalPrompt)) {
    suggestions.push('Considera agregar instrumentos específicos');
  }
  
  if (!/rápido|lento|tempo|BPM/i.test(originalPrompt)) {
    suggestions.push('Especifica el tempo deseado');
  }
  
  if (!/feliz|triste|energético|relajante/i.test(originalPrompt)) {
    suggestions.push('Describe el mood o atmósfera');
  }
  
  return suggestions;
}

// 📊 CALCULAR CONFIANZA
function calculateConfidence(request: OptimizePromptRequest, optimized: string): number {
  let confidence = 0.5; // Base
  
  // Bonus por longitud adecuada
  if (optimized.length > 20 && optimized.length < 200) {
    confidence += 0.2;
  }
  
  // Bonus por contexto musical
  if (request.context === 'music') {
    confidence += 0.1;
  }
  
  // Bonus por audiencia específica
  if (request.targetAudience !== 'beginner') {
    confidence += 0.1;
  }
  
  // Bonus por mejora significativa
  const improvement = (optimized.length - request.originalPrompt.length) / request.originalPrompt.length;
  if (Math.abs(improvement) > 0.1) {
    confidence += 0.1;
  }
  
  return Math.min(confidence, 1.0);
}
