#!/usr/bin/env node

// ────────────────────────────────────────────────────────────────────────────────
// TEST IMGKITS SERVICE
// ────────────────────────────────────────────────────────────────────────────────

const axios = require('axios');

const IMGKITS_BASE_URL = 'https://usa.imgkits.com/node-api/suno';
const IMGKITS_AUTH_URL = 'https://usa.imgkits.com/api/auth';

// Credenciales de prueba
const testAccount = {
  email: 'son1kvers3.1@gmail.com',
  password: 'Son1kvers3!2024'
};

async function testImgkitsAuthentication() {
  console.log('🔐 Testing imgkits authentication...');
  
  try {
    const response = await axios.post(`${IMGKITS_AUTH_URL}/login`, {
      email: testAccount.email,
      password: testAccount.password
    }, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });

    console.log('✅ Authentication successful!');
    console.log('Response:', response.data);
    
    return response.data.token;
  } catch (error) {
    console.error('❌ Authentication failed:', error.response?.data || error.message);
    return null;
  }
}

async function testSunoGeneration(token) {
  console.log('🎵 Testing Suno generation via imgkits...');
  
  try {
    const generationRequest = {
      prompt: 'upbeat electronic dance music, energetic, modern',
      style: 'electronic',
      title: 'Test Track',
      customMode: false,
      instrumental: true,
      lyrics: '',
      gender: ''
    };

    console.log('📤 Sending generation request:', generationRequest);

    const response = await axios.post(`${IMGKITS_BASE_URL}/generate`, generationRequest, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      timeout: 30000
    });

    console.log('✅ Generation request successful!');
    console.log('Response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('❌ Generation failed:', error.response?.data || error.message);
    return null;
  }
}

async function testStatusCheck(token, taskId) {
  console.log('🔍 Testing status check...');
  
  try {
    const response = await axios.get(`${IMGKITS_BASE_URL}/status/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    console.log('✅ Status check successful!');
    console.log('Response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('❌ Status check failed:', error.response?.data || error.message);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting imgkits service tests...\n');

  // Test 1: Authentication
  const token = await testImgkitsAuthentication();
  if (!token) {
    console.log('❌ Cannot proceed without authentication token');
    return;
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Generation
  const generationResult = await testSunoGeneration(token);
  if (!generationResult) {
    console.log('❌ Cannot proceed without generation task');
    return;
  }

  const taskId = generationResult.taskId || generationResult.id;
  if (!taskId) {
    console.log('❌ No task ID received from generation');
    return;
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: Status Check
  await testStatusCheck(token, taskId);

  console.log('\n' + '='.repeat(50) + '\n');
  console.log('🎉 All tests completed!');
}

// Ejecutar tests
runTests().catch(console.error);
