#!/usr/bin/env node

/**
 * 🏆 CREADOR DE CUENTAS ALVAE 🏆
 * 
 * Sistema para crear cuentas premium con símbolo ALVAE
 * - Administrador: nov4-ix@son1kvers3.com
 * - 15 Testers: pro.tester1-15@son1kvers3.com
 * 
 * Todas las cuentas tienen símbolo ALVAE al inicio del nickname
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// 🏆 CONFIGURACIÓN ALVAE 🏆
const ALVAE_CONFIG = {
  symbol: '◯⚡', // Símbolo ALVAE dorado con rayo
  color: '#FFD700', // Dorado
  permissions: ['all'], // Todos los permisos
  isBlindado: true, // Cuentas protegidas
};

// 🏆 CUENTAS A CREAR 🏆
const ACCOUNTS_TO_CREATE = [
  // Administrador absoluto
  {
    email: 'nov4-ix@son1kvers3.com',
    password: 'admin123',
    name: 'Nov4-ix',
    role: 'ALVAE_FOUNDER',
    tier: 'ALVAE_FOUNDER',
    nickname: '◯⚡ Nov4-ix',
    description: 'Creador y administrador absoluto de Son1kverse'
  },
  
  // 15 Testers Premium
  ...Array.from({ length: 15 }, (_, i) => ({
    email: `pro.tester${i + 1}@son1kvers3.com`,
    password: 'Premium!123',
    name: `Tester ${i + 1}`,
    role: 'ALVAE_TESTER',
    tier: 'ALVAE_TESTER',
    nickname: `◯⚡ Tester${i + 1}`,
    description: `Tester Premium ${i + 1} - Acceso completo a todas las funciones`
  }))
];

// 🏆 FUNCIÓN PRINCIPAL 🏆
async function createAlvaeAccounts() {
  console.log('🏆 INICIANDO CREACIÓN DE CUENTAS ALVAE 🏆\n');
  
  try {
    // Verificar conexión a la base de datos
    await prisma.$connect();
    console.log('✅ Conectado a la base de datos\n');
    
    let created = 0;
    let skipped = 0;
    
    for (const account of ACCOUNTS_TO_CREATE) {
      try {
        // Verificar si la cuenta ya existe
        const existingUser = await prisma.user.findUnique({
          where: { email: account.email }
        });
        
        if (existingUser) {
          console.log(`⏭️  Cuenta ya existe: ${account.email} (${account.nickname})`);
          skipped++;
          continue;
        }
        
        // Hash de la contraseña
        const passwordHash = await bcrypt.hash(account.password, 12);
        
        // Crear usuario
        const user = await prisma.user.create({
          data: {
            email: account.email,
            name: account.name,
            passwordHash,
            role: 'ADMIN', // Todas las cuentas ALVAE son admin
            subscriptionTier: account.tier === 'ALVAE_FOUNDER' ? 'ENTERPRISE' : 'PRO',
            generationsLimit: account.tier === 'ALVAE_FOUNDER' ? 10000 : 1000,
            isEmailVerified: true,
            isActive: true,
            // Campos adicionales para ALVAE
            avatarUrl: null,
            googleId: null,
            githubId: null,
            subscriptionStartDate: new Date(),
            subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año
            stripeCustomerId: null,
            stripeSubscriptionId: null,
            generationsUsedThisMonth: 0,
            storageUsedBytes: BigInt(0),
            storageLimit: BigInt(10737418240), // 10GB para ALVAE
            lastLoginAt: null,
          }
        });
        
        // Crear cuenta ALVAE específica
        const alvaeAccount = await prisma.alvaeAccount.create({
          data: {
            userId: user.id,
            role: account.role,
            tier: account.tier,
            alvaeSymbol: ALVAE_CONFIG.symbol,
            alvaeColor: ALVAE_CONFIG.color,
            permissions: ALVAE_CONFIG.permissions,
            isBlindado: ALVAE_CONFIG.isBlindado,
            stripeCustomerId: null,
          }
        });
        
        console.log(`✅ Creada: ${account.email} (${account.nickname})`);
        console.log(`   - Rol: ${account.role}`);
        console.log(`   - Tier: ${account.tier}`);
        console.log(`   - Símbolo: ${ALVAE_CONFIG.symbol}`);
        console.log(`   - ID Usuario: ${user.id}`);
        console.log(`   - ID ALVAE: ${alvaeAccount.id}\n`);
        
        created++;
        
      } catch (error) {
        console.error(`❌ Error creando ${account.email}:`, error.message);
      }
    }
    
    // Estadísticas finales
    console.log('🏆 RESUMEN DE CREACIÓN 🏆');
    console.log(`✅ Cuentas creadas: ${created}`);
    console.log(`⏭️  Cuentas omitidas: ${skipped}`);
    console.log(`📊 Total procesadas: ${ACCOUNTS_TO_CREATE.length}`);
    
    // Mostrar todas las cuentas ALVAE
    console.log('\n🏆 CUENTAS ALVAE EXISTENTES 🏆');
    const allAlvaeAccounts = await prisma.alvaeAccount.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });
    
    allAlvaeAccounts.forEach(account => {
      const nickname = `${account.alvaeSymbol} ${account.user.name}`;
      console.log(`   ${nickname} (${account.user.email}) - ${account.role}`);
    });
    
  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Desconectado de la base de datos');
  }
}

// 🏆 FUNCIÓN PARA VERIFICAR CUENTAS 🏆
async function verifyAlvaeAccounts() {
  console.log('🔍 VERIFICANDO CUENTAS ALVAE...\n');
  
  try {
    await prisma.$connect();
    
    const accounts = await prisma.alvaeAccount.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`📊 Total de cuentas ALVAE: ${accounts.length}\n`);
    
    accounts.forEach(account => {
      const nickname = `${account.alvaeSymbol} ${account.user.name}`;
      console.log(`🏆 ${nickname}`);
      console.log(`   Email: ${account.user.email}`);
      console.log(`   Rol: ${account.role}`);
      console.log(`   Tier: ${account.tier}`);
      console.log(`   Activo: ${account.user.isActive ? '✅' : '❌'}`);
      console.log(`   Blindado: ${account.isBlindado ? '✅' : '❌'}`);
      console.log(`   Creado: ${account.createdAt.toLocaleDateString()}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error verificando cuentas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 🏆 FUNCIÓN PARA LIMPIAR CUENTAS (SOLO PARA DESARROLLO) 🏆
async function cleanAlvaeAccounts() {
  console.log('🧹 LIMPIANDO CUENTAS ALVAE...\n');
  
  try {
    await prisma.$connect();
    
    // Eliminar cuentas ALVAE
    const deletedAlvae = await prisma.alvaeAccount.deleteMany({
      where: {
        user: {
          email: {
            in: ACCOUNTS_TO_CREATE.map(acc => acc.email)
          }
        }
      }
    });
    
    // Eliminar usuarios
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        email: {
          in: ACCOUNTS_TO_CREATE.map(acc => acc.email)
        }
      }
    });
    
    console.log(`✅ Eliminadas ${deletedAlvae.count} cuentas ALVAE`);
    console.log(`✅ Eliminados ${deletedUsers.count} usuarios`);
    
  } catch (error) {
    console.error('❌ Error limpiando cuentas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 🏆 EJECUTAR SEGÚN ARGUMENTOS 🏆
const command = process.argv[2];

switch (command) {
  case 'create':
    createAlvaeAccounts();
    break;
  case 'verify':
    verifyAlvaeAccounts();
    break;
  case 'clean':
    cleanAlvaeAccounts();
    break;
  default:
    console.log('🏆 SISTEMA DE CUENTAS ALVAE 🏆\n');
    console.log('Uso:');
    console.log('  node create-alvae-accounts.js create   - Crear cuentas ALVAE');
    console.log('  node create-alvae-accounts.js verify   - Verificar cuentas existentes');
    console.log('  node create-alvae-accounts.js clean    - Limpiar cuentas (desarrollo)');
    console.log('\n🏆 CUENTAS A CREAR:');
    ACCOUNTS_TO_CREATE.forEach(account => {
      console.log(`   ${account.nickname} (${account.email}) - ${account.role}`);
    });
}
