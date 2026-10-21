import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

let isDbConnected = false;

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$connect();
    isDbConnected = true;
    logger.info('✅ MySQL 8 connected successfully via Prisma');
    return true;
  } catch (error: any) {
    isDbConnected = false;
    logger.warn({ err: error.message }, '⚠️  MySQL connection failed. Utilizing VoltFix in-memory persistent store for seamless local execution.');
    return false;
  }
}

export function getIsDbConnected(): boolean {
  return isDbConnected;
}
