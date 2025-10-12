#!/usr/bin/env node

// ────────────────────────────────────────────────────────────────────────────────
// TEST IMGKITS DIRECT - BASADO EN LA EXTENSIÓN DE CHROME
// ────────────────────────────────────────────────────────────────────────────────

const axios = require('axios');

// URLs basadas en la extensión de Chrome
const SUNO_GENERATE_URL = 'https://ai.imgkits.com/suno/generate';
const SUNO_POLLING_URL = 'https://usa.imgkits.com/node-api/suno';

// Headers exactos de la extensión
const EXTENSION_HEADERS = {
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

async function testSunoGeneration() {
  console.log('🎵 Testing Suno generation with extension headers...');
  
  try {
    const generationRequest = {
      prompt: 'upbeat electronic dance music, energetic, modern',
      style: '',
      title: '',
      customMode: false,
      instrumental: true,
      lyrics: '',
      gender: ''
    };

    console.log('📤 Sending generation request to:', SUNO_GENERATE_URL);
    console.log('📤 Request body:', generationRequest);

    const response = await axios.post(SUNO_GENERATE_URL, generationRequest, {
      headers: EXTENSION_HEADERS,
      timeout: 30000
    });

    console.log('✅ Generation request successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('❌ Generation failed:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
    return null;
  }
}

async function testPollingStatus(taskId) {
  console.log('🔍 Testing polling status...');
  
  try {
    const pollingUrl = `${SUNO_POLLING_URL}/get_mj_status/${encodeURIComponent(taskId)}`;
    console.log('📤 Polling URL:', pollingUrl);

    const response = await axios.get(pollingUrl, {
      headers: EXTENSION_HEADERS,
      timeout: 10000
    });

    console.log('✅ Polling successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('❌ Polling failed:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting direct imgkits tests...\n');

  // Test 1: Generation
  const generationResult = await testSunoGeneration();
  if (!generationResult) {
    console.log('❌ Cannot proceed without generation result');
    return;
  }

  const taskId = generationResult.response?.data?.taskId || generationResult.task_id;
  if (!taskId) {
    console.log('❌ No task ID received from generation');
    console.log('Full result:', generationResult);
    return;
  }

  console.log('📋 Using task ID:', taskId);

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Polling
  await testPollingStatus(taskId);

  console.log('\n' + '='.repeat(50) + '\n');
  console.log('🎉 All tests completed!');
}

// Ejecutar tests
runTests().catch(console.error);
