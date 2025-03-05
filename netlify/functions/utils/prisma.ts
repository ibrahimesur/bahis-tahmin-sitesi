import { PrismaClient } from '@prisma/client';

// Global tipini tanımlama
declare global {
  var prisma: PrismaClient | undefined;
}

// PrismaClient örneğini global olarak tanımla
// Bu sayede her serverless function çağrısında yeni bağlantı oluşturmak yerine
// mevcut bağlantıyı yeniden kullanabiliriz
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  // Production ortamında daha fazla log ve bağlantı yeniden deneme mekanizması ekle
  prisma = new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });
  
  // Bağlantıyı test et ve hata durumunda loglama yap
  prisma.$connect()
    .then(() => console.log('Veritabanına bağlantı başarılı (Netlify Functions)'))
    .catch(err => {
      console.error('Veritabanı bağlantı hatası (Netlify Functions):', err);
      console.log('DATABASE_URL tanımlı mı:', !!process.env.DATABASE_URL);
      console.log('NODE_ENV:', process.env.NODE_ENV);
    });
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['query', 'error', 'warn']
    });
  }
  prisma = global.prisma;
}

export default prisma; 