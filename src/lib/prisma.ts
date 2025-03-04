import { PrismaClient } from '@prisma/client';

// PrismaClient global olarak tanımlanmışsa yeniden oluşturma
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Netlify'da çalışırken veritabanı URL'sini doğrudan kullanmak yerine
// çevre değişkeninden almak daha güvenli
const databaseUrl = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_csYWLdx4zgG9@ep-polished-shadow-a8x4j8y3-pooler.eastus2.azure.neon.tech/neondb?sslmode=require";

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl
      }
    },
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma; 