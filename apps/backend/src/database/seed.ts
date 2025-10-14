/**
 * 🌱 DATABASE SEED - Datos iniciales de la base de datos
 */

import { PrismaClient, UserRole, UserTier } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

async function main() {
  logger.info('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@son1kvers3.com' },
    update: {},
    create: {
      email: 'admin@son1kvers3.com',
      name: 'Admin User',
      password: adminPassword,
      role: UserRole.ADMIN,
      tier: UserTier.ENTERPRISE,
      alvaeSymbol: true,
      emailVerified: true,
      isActive: true,
    },
  });

  logger.info(`✅ Admin user created: ${admin.email}`);

  // Create tester users
  const tester1Password = await bcrypt.hash('tester123', 12);
  const tester1 = await prisma.user.upsert({
    where: { email: 'tester1@son1kvers3.com' },
    update: {},
    create: {
      email: 'tester1@son1kvers3.com',
      name: 'Tester One',
      password: tester1Password,
      role: UserRole.TESTER,
      tier: UserTier.PRO,
      alvaeSymbol: true,
      emailVerified: true,
      isActive: true,
    },
  });

  const tester2Password = await bcrypt.hash('tester123', 12);
  const tester2 = await prisma.user.upsert({
    where: { email: 'tester2@son1kvers3.com' },
    update: {},
    create: {
      email: 'tester2@son1kvers3.com',
      name: 'Tester Two',
      password: tester2Password,
      role: UserRole.TESTER,
      tier: UserTier.PRO,
      alvaeSymbol: true,
      emailVerified: true,
      isActive: true,
    },
  });

  const tester3Password = await bcrypt.hash('tester123', 12);
  const tester3 = await prisma.user.upsert({
    where: { email: 'tester3@son1kvers3.com' },
    update: {},
    create: {
      email: 'tester3@son1kvers3.com',
      name: 'Tester Three',
      password: tester3Password,
      role: UserRole.TESTER,
      tier: UserTier.PRO,
      alvaeSymbol: true,
      emailVerified: true,
      isActive: true,
    },
  });

  logger.info(`✅ Tester users created: ${tester1.email}, ${tester2.email}, ${tester3.email}`);

  // Create demo users
  const demoUsers = [
    {
      email: 'demo@son1kvers3.com',
      name: 'Demo User',
      tier: UserTier.FREE,
    },
    {
      email: 'pro@son1kvers3.com',
      name: 'Pro User',
      tier: UserTier.PRO,
    },
    {
      email: 'premium@son1kvers3.com',
      name: 'Premium User',
      tier: UserTier.PREMIUM,
    },
  ];

  for (const userData of demoUsers) {
    const password = await bcrypt.hash('demo123', 12);
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        name: userData.name,
        password,
        role: UserRole.USER,
        tier: userData.tier,
        emailVerified: true,
        isActive: true,
      },
    });

    logger.info(`✅ Demo user created: ${user.email}`);
  }

  // Create admin user record
  await prisma.adminUser.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      permissions: [
        'admin:panel',
        'admin:users',
        'admin:config',
        'chat:moderate',
        'nexus:activate',
      ],
      level: 'SUPER_ADMIN',
    },
  });

  logger.info(`✅ Admin user record created`);

  // Create sample chat rooms
  const chatRooms = [
    {
      name: 'General',
      description: 'General discussion room',
      ownerId: admin.id,
      type: 'PUBLIC',
    },
    {
      name: 'Music Producers',
      description: 'Room for music producers to collaborate',
      ownerId: tester1.id,
      type: 'PUBLIC',
    },
    {
      name: 'Nexus Mode',
      description: 'Exclusive room for Nexus mode users',
      ownerId: admin.id,
      type: 'PRIVATE',
    },
  ];

  for (const roomData of chatRooms) {
    const room = await prisma.chatRoom.create({
      data: roomData,
    });

    logger.info(`✅ Chat room created: ${room.name}`);
  }

  // Create sample generations
  const sampleGenerations = [
    {
      userId: tester1.id,
      prompt: 'A epic orchestral piece with cinematic elements',
      style: 'orchestral',
      title: 'Epic Cinematic',
      model: 'chirp-v3',
      status: 'COMPLETED',
      audioUrl: 'https://example.com/audio1.mp3',
      imageUrl: 'https://example.com/image1.jpg',
    },
    {
      userId: tester2.id,
      prompt: 'A relaxing ambient track with nature sounds',
      style: 'ambient',
      title: 'Nature Ambient',
      model: 'chirp-v3',
      status: 'COMPLETED',
      audioUrl: 'https://example.com/audio2.mp3',
      imageUrl: 'https://example.com/image2.jpg',
    },
    {
      userId: tester3.id,
      prompt: 'A energetic electronic dance track',
      style: 'electronic',
      title: 'Dance Energy',
      model: 'chirp-v3',
      status: 'PROCESSING',
    },
  ];

  for (const genData of sampleGenerations) {
    const generation = await prisma.generation.create({
      data: genData,
    });

    logger.info(`✅ Sample generation created: ${generation.title}`);
  }

  // Create sample projects
  const sampleProjects = [
    {
      userId: tester1.id,
      name: 'My First Project',
      description: 'A beginner project to learn the DAW',
      tracks: [
        {
          id: 'track1',
          name: 'Main Track',
          type: 'audio',
          url: 'https://example.com/track1.mp3',
        },
      ],
      settings: {
        bpm: 120,
        key: 'C',
        timeSignature: '4/4',
      },
    },
    {
      userId: tester2.id,
      name: 'Ambient Journey',
      description: 'An ambient music project',
      tracks: [
        {
          id: 'track1',
          name: 'Ambient Pad',
          type: 'audio',
          url: 'https://example.com/ambient1.mp3',
        },
        {
          id: 'track2',
          name: 'Nature Sounds',
          type: 'audio',
          url: 'https://example.com/nature1.mp3',
        },
      ],
      settings: {
        bpm: 80,
        key: 'Am',
        timeSignature: '4/4',
      },
    },
  ];

  for (const projectData of sampleProjects) {
    const project = await prisma.project.create({
      data: projectData,
    });

    logger.info(`✅ Sample project created: ${project.name}`);
  }

  // Create usage stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const usageStats = [
    {
      userId: tester1.id,
      date: today,
      generationsUsed: 5,
      projectsCreated: 2,
      chatMessages: 10,
      storageUsed: 50000000, // 50MB
    },
    {
      userId: tester2.id,
      date: today,
      generationsUsed: 3,
      projectsCreated: 1,
      chatMessages: 5,
      storageUsed: 30000000, // 30MB
    },
    {
      userId: tester3.id,
      date: today,
      generationsUsed: 2,
      projectsCreated: 1,
      chatMessages: 3,
      storageUsed: 20000000, // 20MB
    },
  ];

  for (const statData of usageStats) {
    await prisma.usageStats.create({
      data: statData,
    });
  }

  logger.info(`✅ Usage stats created`);

  logger.info('🎉 Database seed completed successfully!');
  logger.info('');
  logger.info('📋 Created users:');
  logger.info(`   Admin: admin@son1kvers3.com (password: admin123)`);
  logger.info(`   Tester 1: tester1@son1kvers3.com (password: tester123)`);
  logger.info(`   Tester 2: tester2@son1kvers3.com (password: tester123)`);
  logger.info(`   Tester 3: tester3@son1kvers3.com (password: tester123)`);
  logger.info(`   Demo: demo@son1kvers3.com (password: demo123)`);
  logger.info(`   Pro: pro@son1kvers3.com (password: demo123)`);
  logger.info(`   Premium: premium@son1kvers3.com (password: demo123)`);
  logger.info('');
  logger.info('🔑 All testers have ALVAE symbol and can activate Nexus mode!');
}

main()
  .catch((e) => {
    logger.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
