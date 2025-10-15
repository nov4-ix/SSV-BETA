/**
 * 🎵 GENERATE MUSIC API - VERCEL SERVERLESS FUNCTION
 * 
 * Genera música usando Suno API con la información correcta
 */

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;
    
    console.log('🎵 Generate Music Request:', {
      prompt: body.prompt?.substring(0, 100) + '...',
      lyrics: body.lyrics ? 'Present' : 'Missing',
      voice: body.voice,
      instrumental: body.instrumental
    });

    // Validar datos de entrada
    if (!body.prompt || typeof body.prompt !== 'string' || body.prompt.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: 'El prompt debe tener al menos 10 caracteres'
      });
    }

    // 🚀 CONFIGURACIÓN DE SUNO CON INFORMACIÓN CORRECTA
    const SUNO_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ2MVY3bmZXM1hEZVo0SFNaY2ZKUW9uVnRsSnE3Mk1DaSIsImV4cCI6MTc2MDU4MTM1MX0.t-nR1DRS1hn-7D4_ZUifgQH3hNbvwQ0U8BicShPmIq8';
    const SUNO_BASE_URL = 'https://ai.imgkits.com/suno';
    
    // Normalizar datos
    const normalizedInstrumental = Boolean(body.instrumental);
    const normalizedVoice = body.voice || 'male';
    const normalizedLyrics = body.lyrics || '';

    // 🎵 PREPARAR PAYLOAD CORRECTO PARA SUNO
    const sunoPayload = {
      prompt: body.prompt.trim(),
      style: body.style || 'pop',
      title: body.title || 'Generated Track',
      customMode: false,
      instrumental: normalizedInstrumental,
      lyrics: normalizedLyrics,
      gender: normalizedVoice
    };

    console.log('🎼 Suno Payload:', sunoPayload);

    // 🎼 GENERAR MÚSICA CON SUNO API REAL
    const sunoResponse = await fetch(`${SUNO_BASE_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authorization': `Bearer ${SUNO_TOKEN}`,
        'channel': 'node-api',
        'origin': 'https://www.livepolls.app',
        'referer': 'https://www.livepolls.app/',
      },
      body: JSON.stringify(sunoPayload),
    });

    console.log('📡 Suno Response Status:', sunoResponse.status);

    if (!sunoResponse.ok) {
      const errorText = await sunoResponse.text();
      console.error('❌ Suno API Error:', sunoResponse.status, errorText);
      
      return res.status(500).json({
        success: false,
        error: `Error de Suno API: ${sunoResponse.status} - ${errorText}`
      });
    }

    const sunoData = await sunoResponse.json();
    console.log('📊 Suno Response Data:', sunoData);
    
    // Verificar respuesta de Suno
    if (!sunoData.response || sunoData.response.code !== 200) {
      return res.status(500).json({
        success: false,
        error: `Suno API error: ${sunoData.response?.message || 'Unknown error'}`
      });
    }

    if (!sunoData.response.data || !sunoData.response.data.taskId) {
      return res.status(500).json({
        success: false,
        error: 'No se recibió taskId de Suno'
      });
    }

    console.log('✅ Suno Generation Started:', sunoData.response.data.taskId);

    // 🎯 RETORNAR TASK ID PARA POLLING
    return res.status(200).json({
      success: true,
      trackId: sunoData.response.data.taskId,
      message: 'Generación iniciada correctamente'
    });

  } catch (error) {
    console.error('❌ Error in generate-music:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor: ' + error.message
    });
  }
}
