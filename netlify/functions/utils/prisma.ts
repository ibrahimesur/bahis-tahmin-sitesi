import { PrismaClient, Prisma } from '@prisma/client';

// Global tipini tanımlama
declare global {
  var prisma: PrismaClient | undefined;
}

// PrismaClient örneğini global olarak tanımla
// Bu sayede her serverless function çağrısında yeni bağlantı oluşturmak yerine
// mevcut bağlantıyı yeniden kullanabiliriz
let prisma: PrismaClient;

// Veritabanı bağlantı URL'sini kontrol et
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL çevre değişkeni tanımlanmamış! (Netlify Functions)');
}

if (process.env.NODE_ENV === 'production') {
  // Production ortamında daha fazla log ve bağlantı yeniden deneme mekanizması ekle
  prisma = new PrismaClient({
    log: ['error', 'warn'] as Prisma.LogLevel[],
    datasources: {
      db: {
        url: databaseUrl
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
      
      // Bağlantı hatası durumunda yeniden deneme
      setTimeout(() => {
        console.log('Veritabanı bağlantısı yeniden deneniyor...');
        prisma.$connect()
          .then(() => console.log('Veritabanına bağlantı başarılı (yeniden deneme)'))
          .catch(retryErr => console.error('Veritabanı bağlantı hatası (yeniden deneme):', retryErr));
      }, 2000);
    });
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['query', 'error', 'warn'] as Prisma.LogLevel[],
      datasources: {
        db: {
          url: databaseUrl
        }
      }
    });
  }
  prisma = global.prisma;
}

export default prisma; 