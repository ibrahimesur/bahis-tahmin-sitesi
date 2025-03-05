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
  console.log('NODE_ENV:', process.env.NODE_ENV);
  
  try {
    const prismaClient = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl
        }
      },
      log: ['error', 'warn'],
    });
    
    console.log('Prisma istemcisi başarıyla oluşturuldu');
    
    // Bağlantıyı test et
    prismaClient.$connect()
      .then(() => console.log('Veritabanına bağlantı başarılı'))
      .catch(err => {
        console.error('Veritabanı bağlantı hatası:', err);
        // Bağlantı hatası durumunda yeniden deneme mekanizması
        console.log('Bağlantı yeniden deneniyor...');
        setTimeout(() => {
          prismaClient.$connect()
            .then(() => console.log('Veritabanına bağlantı başarılı (yeniden deneme)'))
            .catch(retryErr => console.error('Veritabanı bağlantı hatası (yeniden deneme):', retryErr));
        }, 2000);
      });
      
    return prismaClient;
  } catch (error) {
    console.error('Prisma istemcisi oluşturulurken hata:', error);
    throw error;
  }
};

// Geliştirme ortamında global nesne üzerinde sakla
// Üretim ortamında her istekte yeni bir istemci oluştur
export const prisma = globalForPrisma.prisma || prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma; 