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
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default prisma; 