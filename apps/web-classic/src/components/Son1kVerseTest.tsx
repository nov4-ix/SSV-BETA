// src/components/Son1kVerseTest.tsx

import React, { useState } from 'react';
import { useSon1kVerseService } from '../hooks/useSon1kVerseService';

export const Son1kVerseTest: React.FC = () => {
  const {
    loading,
    error,
    result,
    music,
    pixel,
    lyrics,
    prompts,
    sanctuary,
    nova,
    analysis,
    checkAllServices,
    clearError,
    clearResult
  } = useSon1kVerseService();

  const [testResults, setTestResults] = useState<any>(null);

  const runAllTests = async () => {
    try {
      const services = await checkAllServices();
      setTestResults(services);
    } catch (err) {
      console.error('Error running tests:', err);
    }
  };

  const testMusicGeneration = async () => {
    try {
      await music.generate({
        prompt: 'Una canción de rock energética',
        style: 'rock',
        title: 'Test Song'
      });
    } catch (err) {
      console.error('Error testing music generation:', err);
    }
  };

  const testPixelAssistant = async () => {
    try {
      await pixel.interact({
        message: 'Hola Pixel, ¿cómo estás?',
        context: 'test'
      });
    } catch (err) {
      console.error('Error testing Pixel assistant:', err);
    }
  };

  const testLyricsGeneration = async () => {
    try {
      await lyrics.generate({
        prompt: 'Una canción sobre la resistencia',
        style: 'rock',
        genre: 'alternative',
        mood: 'rebellious'
      });
    } catch (err) {
      console.error('Error testing lyrics generation:', err);
    }
  };

  const testTranslation = async () => {
    try {
      await lyrics.translate('Una canción sobre la resistencia');
    } catch (err) {
      console.error('Error testing translation:', err);
    }
  };

  const testSanctuary = async () => {
    try {
      await sanctuary.sendMessage('Hola desde el test de Son1kVerse');
    } catch (err) {
      console.error('Error testing Sanctuary:', err);
    }
  };

  const testNovaPostPilot = async () => {
    try {
      await nova.generateContent('Una nueva canción de rock');
    } catch (err) {
      console.error('Error testing Nova Post Pilot:', err);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">
        🌌 Son1kVerse Backend Test
      </h1>

      {/* Estado General */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Estado General</h2>
        <div className="flex gap-4">
          <span className={`px-3 py-1 rounded ${loading ? 'bg-yellow-200' : 'bg-green-200'}`}>
            {loading ? '⏳ Cargando...' : '✅ Listo'}
          </span>
          {error && (
            <span className="px-3 py-1 rounded bg-red-200">
              ❌ Error: {error}
            </span>
          )}
        </div>
      </div>

      {/* Botones de Prueba */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={runAllTests}
          className="p-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          disabled={loading}
        >
          🔍 Verificar Todos los Servicios
        </button>

        <button
          onClick={testMusicGeneration}
          className="p-3 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          disabled={loading}
        >
          🎵 Generar Música
        </button>

        <button
          onClick={testPixelAssistant}
          className="p-3 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
          disabled={loading}
        >
          🤖 Pixel Assistant
        </button>

        <button
          onClick={testLyricsGeneration}
          className="p-3 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
          disabled={loading}
        >
          🎼 Generar Letras
        </button>

        <button
          onClick={testTranslation}
          className="p-3 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:opacity-50"
          disabled={loading}
        >
          🌐 Traducir
        </button>

        <button
          onClick={testSanctuary}
          className="p-3 bg-pink-500 text-white rounded hover:bg-pink-600 disabled:opacity-50"
          disabled={loading}
        >
          🛡️ Sanctuary Chat
        </button>

        <button
          onClick={testNovaPostPilot}
          className="p-3 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
          disabled={loading}
        >
          🚀 Nova Post Pilot
        </button>

        <button
          onClick={clearError}
          className="p-3 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          🧹 Limpiar Error
        </button>

        <button
          onClick={clearResult}
          className="p-3 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          🧹 Limpiar Resultado
        </button>
      </div>

      {/* Resultados de Pruebas */}
      {testResults && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Estado de Servicios</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.entries(testResults).map(([service, status]) => (
              <div key={service} className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${status ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="capitalize">{service}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resultado */}
      {result && (
        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Resultado</h3>
          <pre className="bg-white p-3 rounded text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {/* Información de Endpoints */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Endpoints de Netlify Functions</h3>
        <div className="text-sm space-y-1">
          <div>🎵 Suno: https://son1k.netlify.app/.netlify/functions/suno-generate</div>
          <div>🤖 Pixel: https://son1k.netlify.app/.netlify/functions/pixel-assistant</div>
          <div>🎼 Letras: https://son1k.netlify.app/.netlify/functions/qwen-lyrics</div>
          <div>🌐 Traducción: https://son1k.netlify.app/.netlify/functions/qwen-translate</div>
          <div>🛡️ Sanctuary: https://son1k.netlify.app/.netlify/functions/sanctuary-chat</div>
          <div>🚀 Nova: https://son1k.netlify.app/.netlify/functions/nova-post-pilot</div>
        </div>
      </div>
    </div>
  );
};
