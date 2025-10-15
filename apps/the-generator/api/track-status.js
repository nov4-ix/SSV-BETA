/**
 * 🔍 TRACK STATUS API - VERCEL SERVERLESS FUNCTION
 * 
 * Verifica el estado de generación de música en Suno API
 */

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extraer trackId de query o body
    const trackId = req.method === 'GET' ? req.query.trackId : req.body.trackId;
    
    console.log('🔍 Track Status Request:', { trackId, method: req.method });

    if (!trackId || typeof trackId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'trackId es requerido'
      });
    }

    // 🚀 CONFIGURACIÓN DE SUNO CON INFORMACIÓN CORRECTA
    const SUNO_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ2MVY3bmZXM1hEZVo0SFNaY2ZKUW9uVnRsSnE3Mk1DaSIsImV4cCI6MTc2MDU4MTM1MX0.t-nR1DRS1hn-7D4_ZUifgQH3hNbvwQ0U8BicShPmIq8';
    
    // 🎯 INTENTAR MÚLTIPLES ENDPOINTS DE POLLING
    const pollingUrls = [
      `https://ai.imgkits.com/suno/status?task_id=${encodeURIComponent(trackId)}`,
      `https://ai.imgkits.com/suno/result?taskId=${encodeURIComponent(trackId)}`,
      `https://ai.imgkits.com/suno/tasks/${encodeURIComponent(trackId)}`,
      `https://usa.imgkits.com/node-api/suno/get_mj_status/${encodeURIComponent(trackId)}`
    ];

    const headers = {
      'Content-Type': 'application/json',
      'authorization': `Bearer ${SUNO_TOKEN}`,
      'channel': 'node-api',
      'origin': 'https://www.livepolls.app',
      'referer': 'https://www.livepolls.app/',
    };

    let lastError = null;
    
    for (const url of pollingUrls) {
      try {
        console.log('🔍 Trying polling URL:', url);
        
        const pollResponse = await fetch(url, {
          method: 'GET',
          headers,
        });

        console.log('📡 Poll Response Status:', pollResponse.status);

        if (pollResponse.ok) {
          const responseText = await pollResponse.text();
          console.log('📊 Poll Response Text:', responseText.substring(0, 200) + '...');
          
          if (responseText.trim()) {
            try {
              const pollData = JSON.parse(responseText);
              console.log('📊 Parsed Poll Data:', pollData);
              
              // Mapear diferentes formatos de respuesta de Suno
              let status = 'processing';
              let audioUrl = null;
              let progress = 30;
              
              if (pollData.running === false && pollData.audio_url) {
                status = 'completed';
                audioUrl = pollData.audio_url;
                progress = 100;
              } else if (pollData.status === 'completed' && pollData.audio_url) {
                status = 'completed';
                audioUrl = pollData.audio_url;
                progress = 100;
              } else if (pollData.state === 'completed' && pollData.url) {
                status = 'completed';
                audioUrl = pollData.url;
                progress = 100;
              } else if (pollData.status === 'failed' || pollData.state === 'failed') {
                status = 'failed';
                progress = 0;
              } else if (pollData.progress) {
                progress = Math.min(pollData.progress, 95);
              }

              return res.status(200).json({
                success: true,
                trackId,
                status,
                audioUrl,
                progress,
                message: status === 'completed' ? 'Generación completada' : 'Procesando...'
              });
              
            } catch (parseError) {
              console.error('❌ JSON Parse Error:', parseError);
              lastError = parseError;
              continue;
            }
          }
        }
        
        lastError = new Error(`HTTP ${pollResponse.status}`);
        
      } catch (fetchError) {
        console.error('❌ Fetch Error for URL:', url, fetchError.message);
        lastError = fetchError;
        continue;
      }
    }

    // Si todos los endpoints fallan, devolver processing para reintentar
    console.log('⚠️ All polling endpoints failed, returning processing status');
    
    return res.status(200).json({
      success: true,
      trackId,
      status: 'processing',
      audioUrl: null,
      progress: 30,
      message: 'Verificando estado...',
      error: lastError ? lastError.message : 'Todos los endpoints fallaron'
    });

  } catch (error) {
    console.error('❌ Error in track-status:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor: ' + error.message
    });
  }
}
