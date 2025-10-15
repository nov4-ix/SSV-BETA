/**
 * 🧪 ROOT TEST API - VERCEL SERVERLESS FUNCTION
 * 
 * Endpoint de prueba en el directorio raíz
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({
    success: true,
    message: 'Root API funcionando correctamente',
    timestamp: new Date().toISOString(),
    method: req.method,
    version: '2.0.0',
    path: req.url
  });
}
