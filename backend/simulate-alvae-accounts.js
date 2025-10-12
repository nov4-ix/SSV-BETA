#!/usr/bin/env node

/**
 * 🏆 SIMULADOR DE CUENTAS ALVAE 🏆
 * 
 * Sistema para simular cuentas premium con símbolo ALVAE
 * - Administrador: nov4-ix@son1kvers3.com
 * - 15 Testers: pro.tester1-15@son1kvers3.com
 * 
 * Todas las cuentas tienen símbolo ALVAE al inicio del nickname
 */

// 🏆 CONFIGURACIÓN ALVAE 🏆
const ALVAE_CONFIG = {
  symbol: '◯⚡', // Símbolo ALVAE dorado con rayo
  color: '#FFD700', // Dorado
  permissions: ['all'], // Todos los permisos
  isBlindado: true, // Cuentas protegidas
};

// 🏆 CUENTAS ALVAE 🏆
const ALVAE_ACCOUNTS = [
  // Administrador absoluto
  {
    email: 'nov4-ix@son1kvers3.com',
    password: 'admin123',
    name: 'Nov4-ix',
    role: 'ALVAE_FOUNDER',
    tier: 'ALVAE_FOUNDER',
    nickname: '◯⚡ Nov4-ix',
    description: 'Creador y administrador absoluto de Son1kverse',
    generationsLimit: 10000,
    storageLimit: '10GB',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  
  // 15 Testers Premium
  ...Array.from({ length: 15 }, (_, i) => ({
    email: `pro.tester${i + 1}@son1kvers3.com`,
    password: 'Premium!123',
    name: `Tester ${i + 1}`,
    role: 'ALVAE_TESTER',
    tier: 'ALVAE_TESTER',
    nickname: `◯⚡ Tester${i + 1}`,
    description: `Tester Premium ${i + 1} - Acceso completo a todas las funciones`,
    generationsLimit: 1000,
    storageLimit: '5GB',
    isActive: true,
    createdAt: new Date().toISOString()
  }))
];

// 🏆 FUNCIÓN PARA MOSTRAR CUENTAS 🏆
function showAlvaeAccounts() {
  console.log('🏆 CUENTAS ALVAE DISPONIBLES 🏆\n');
  
  ALVAE_ACCOUNTS.forEach((account, index) => {
    console.log(`${index + 1}. ${account.nickname}`);
    console.log(`   Email: ${account.email}`);
    console.log(`   Contraseña: ${account.password}`);
    console.log(`   Rol: ${account.role}`);
    console.log(`   Tier: ${account.tier}`);
    console.log(`   Límite generaciones: ${account.generationsLimit}`);
    console.log(`   Almacenamiento: ${account.storageLimit}`);
    console.log(`   Activo: ${account.isActive ? '✅' : '❌'}`);
    console.log(`   Creado: ${new Date(account.createdAt).toLocaleDateString()}`);
    console.log('');
  });
}

// 🏆 FUNCIÓN PARA VERIFICAR CREDENCIALES 🏆
function verifyCredentials(email, password) {
  const account = ALVAE_ACCOUNTS.find(acc => acc.email === email);
  
  if (!account) {
    return { valid: false, message: 'Email no encontrado' };
  }
  
  if (account.password !== password) {
    return { valid: false, message: 'Contraseña incorrecta' };
  }
  
  if (!account.isActive) {
    return { valid: false, message: 'Cuenta inactiva' };
  }
  
  return {
    valid: true,
    account: {
      email: account.email,
      username: account.name,
      tier: account.tier,
      alvaeSymbol: ALVAE_CONFIG.symbol,
      role: account.role,
      generationsLimit: account.generationsLimit,
      storageLimit: account.storageLimit
    }
  };
}

// 🏆 FUNCIÓN PARA MOSTRAR ESTADÍSTICAS 🏆
function showStats() {
  console.log('📊 ESTADÍSTICAS ALVAE 📊\n');
  
  const stats = {
    total: ALVAE_ACCOUNTS.length,
    founders: ALVAE_ACCOUNTS.filter(acc => acc.role === 'ALVAE_FOUNDER').length,
    testers: ALVAE_ACCOUNTS.filter(acc => acc.role === 'ALVAE_TESTER').length,
    active: ALVAE_ACCOUNTS.filter(acc => acc.isActive).length,
    totalGenerations: ALVAE_ACCOUNTS.reduce((sum, acc) => sum + acc.generationsLimit, 0),
    totalStorage: ALVAE_ACCOUNTS.reduce((sum, acc) => {
      const gb = parseInt(acc.storageLimit);
      return sum + gb;
    }, 0)
  };
  
  console.log(`Total de cuentas: ${stats.total}`);
  console.log(`Fundadores: ${stats.founders}`);
  console.log(`Testers: ${stats.testers}`);
  console.log(`Activas: ${stats.active}`);
  console.log(`Generaciones totales: ${stats.totalGenerations.toLocaleString()}`);
  console.log(`Almacenamiento total: ${stats.totalStorage}GB`);
}

// 🏆 FUNCIÓN PARA MOSTRAR INSTRUCCIONES 🏆
function showInstructions() {
  console.log('🏆 INSTRUCCIONES DE USO 🏆\n');
  
  console.log('1. ADMINISTRADOR ABSOLUTO:');
  console.log('   Email: nov4-ix@son1kvers3.com');
  console.log('   Contraseña: admin123');
  console.log('   Nickname: ◯⚡ Nov4-ix');
  console.log('   Rol: ALVAE_FOUNDER');
  console.log('   Acceso: Total e ilimitado\n');
  
  console.log('2. TESTERS PREMIUM:');
  console.log('   Email: pro.tester1@son1kvers3.com hasta pro.tester15@son1kvers3.com');
  console.log('   Contraseña: Premium!123');
  console.log('   Nickname: ◯⚡ Tester1 hasta ◯⚡ Tester15');
  console.log('   Rol: ALVAE_TESTER');
  console.log('   Acceso: Premium completo\n');
  
  console.log('3. CARACTERÍSTICAS ALVAE:');
  console.log('   ✅ Símbolo ALVAE (◯⚡) al inicio del nickname');
  console.log('   ✅ Acceso premium a todas las funciones');
  console.log('   ✅ Generaciones ilimitadas según tier');
  console.log('   ✅ Almacenamiento extendido');
  console.log('   ✅ Soporte prioritario');
  console.log('   ✅ Funciones beta tempranas\n');
  
  console.log('4. ACTIVACIÓN:');
  console.log('   - Las cuentas se activan al primer login');
  console.log('   - Pueden cambiar contraseña y nickname');
  console.log('   - Mantienen el símbolo ALVAE siempre');
  console.log('   - Acceso inmediato a funciones premium\n');
}

// 🏆 EJECUTAR SEGÚN ARGUMENTOS 🏆
const command = process.argv[2];

switch (command) {
  case 'show':
    showAlvaeAccounts();
    break;
  case 'stats':
    showStats();
    break;
  case 'verify':
    const email = process.argv[3];
    const password = process.argv[4];
    if (!email || !password) {
      console.log('❌ Uso: node simulate-alvae-accounts.js verify <email> <password>');
      break;
    }
    const result = verifyCredentials(email, password);
    if (result.valid) {
      console.log('✅ Credenciales válidas');
      console.log('📋 Datos de la cuenta:');
      console.log(JSON.stringify(result.account, null, 2));
    } else {
      console.log(`❌ ${result.message}`);
    }
    break;
  case 'instructions':
    showInstructions();
    break;
  default:
    console.log('🏆 SIMULADOR DE CUENTAS ALVAE 🏆\n');
    console.log('Comandos disponibles:');
    console.log('  node simulate-alvae-accounts.js show         - Mostrar todas las cuentas');
    console.log('  node simulate-alvae-accounts.js stats       - Mostrar estadísticas');
    console.log('  node simulate-alvae-accounts.js verify <email> <password> - Verificar credenciales');
    console.log('  node simulate-alvae-accounts.js instructions - Mostrar instrucciones de uso');
    console.log('\n🏆 CUENTAS ALVAE DISPONIBLES:');
    console.log(`   Total: ${ALVAE_ACCOUNTS.length}`);
    console.log(`   Fundadores: ${ALVAE_ACCOUNTS.filter(acc => acc.role === 'ALVAE_FOUNDER').length}`);
    console.log(`   Testers: ${ALVAE_ACCOUNTS.filter(acc => acc.role === 'ALVAE_TESTER').length}`);
}
