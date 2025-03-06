import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

if (typeof window === 'undefined') {
  // Server-side only
  if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient();
  } else {
    // Ensure we don't create multiple instances in development
    if (!(global as any).prisma) {
      (global as any).prisma = new PrismaClient();
    }
    prisma = (global as any).prisma;
  }
} else {
  // Browser-side - use API endpoints instead
  prisma = {} as PrismaClient;
}

export { prisma }; 