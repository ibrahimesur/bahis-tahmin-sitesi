import { PrismaClient, Prisma } from '@prisma/client';

// PrismaClient global olarak tanımlanmışsa yeniden oluşturma
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Netlify'da çalışırken veritabanı URL'sini doğrudan kullanmak yerine
// çevre değişkeninden almak daha güvenli
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL çevre değişkeni tanımlanmamış!');
  console.error('Bu hata veritabanı bağlantısını engelleyecektir.');
}

// Prisma istemcisini yapılandır
const prismaClientSingleton = () => {
  console.log('Prisma istemcisi oluşturuluyor...');
  console.log('DATABASE_URL tanımlı mı:', !!databaseUrl);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('Çalışma ortamı:', process.env.NETLIFY ? 'Netlify' : 'Lokal/Diğer');
  
  try {
    // Bağlantı seçeneklerini yapılandır
    const connectionOptions = {
      datasources: {
        db: {
          url: databaseUrl
        }
      },
      log: ['error', 'warn', 'query'] as Prisma.LogLevel[],
    };
    
    // Netlify ortamında ek yapılandırma
    if (process.env.NETLIFY) {
      console.log('Netlify ortamı için ek yapılandırma uygulanıyor');
    }
    
    const prismaClient = new PrismaClient(connectionOptions);
    
    console.log('Prisma istemcisi başarıyla oluşturuldu');
    
    // Bağlantıyı test et
    prismaClient.$connect()
      .then(() => {
        console.log('Veritabanına bağlantı başarılı');
        
        // Test sorgusu çalıştır
        return prismaClient.$queryRaw`SELECT 1 as test`
          .then((result) => {
            console.log('Test sorgusu başarılı:', result);
          })
          .catch((queryError) => {
            console.error('Test sorgusu hatası:', queryError);
          });
      })
      .catch(err => {
        console.error('Veritabanı bağlantı hatası:', err);
        // Bağlantı hatası durumunda yeniden deneme mekanizması
        console.log('Bağlantı yeniden deneniyor...');
        setTimeout(() => {
          prismaClient.$connect()
            .then(() => console.log('Veritabanına bağlantı başarılı (yeniden deneme)'))
            .catch(retryErr => {
              console.error('Veritabanı bağlantı hatası (yeniden deneme):', retryErr);
              console.log('Bağlantı bilgileri:');
              console.log('- DATABASE_URL tanımlı:', !!process.env.DATABASE_URL);
              console.log('- DATABASE_URL uzunluğu:', process.env.DATABASE_URL?.length);
              console.log('- NODE_ENV:', process.env.NODE_ENV);
              console.log('- Çalışma ortamı:', process.env.NETLIFY ? 'Netlify' : 'Lokal/Diğer');
            });
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