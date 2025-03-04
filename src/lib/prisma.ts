import { PrismaClient } from '@prisma/client';

// PrismaClient global olarak tanımlanmışsa yeniden oluşturma
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Netlify'da çalışırken veritabanı URL'sini doğrudan kullanmak yerine
// çevre değişkeninden almak daha güvenli
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL çevre değişkeni tanımlanmamış!');
}

// Prisma istemcisini yapılandır
const prismaClientSingleton = () => {
  console.log('Prisma istemcisi oluşturuluyor...');
  console.log('DATABASE_URL tanımlı mı:', !!databaseUrl);
  
  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl
      }
    },
    log: ['query', 'error', 'warn'],
  });
};

// Geliştirme ortamında global nesne üzerinde sakla
// Üretim ortamında her istekte yeni bir istemci oluştur
export const prisma = globalForPrisma.prisma || prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma; 