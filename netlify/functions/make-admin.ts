import { Handler } from '@netlify/functions';
import prisma from './utils/prisma';

const handler: Handler = async (event, context) => {
  // CORS için header ayarları
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // OPTIONS isteği için CORS yanıtı
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Sadece GET isteklerine izin ver
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  // Güvenlik için gizli bir anahtar kontrol et
  // Bu anahtarı .env dosyasında tanımlamalısınız: ADMIN_SECRET_KEY=gizli_anahtar
  const secretKey = event.queryStringParameters?.secretKey;
  const adminSecretKey = process.env.ADMIN_SECRET_KEY || 'gizli_anahtar_tanimlanmamis';
  
  if (secretKey !== adminSecretKey) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ 
        message: 'Yetkisiz erişim. Doğru gizli anahtarı sağlamanız gerekiyor.' 
      }),
    };
  }

  // E-posta adresini al
  const email = event.queryStringParameters?.email;
  
  if (!email) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ 
        message: 'E-posta adresi belirtilmedi. ?email=kullanici@example.com şeklinde belirtmelisiniz.' 
      }),
    };
  }

  try {
    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ 
          message: `${email} e-posta adresine sahip kullanıcı bulunamadı.` 
        }),
      };
    }

    // Kullanıcı zaten admin mi kontrol et
    if (user.role === 'admin') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          message: `${email} kullanıcısı zaten admin rolüne sahip.`,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
          }
        }),
      };
    }

    // Kullanıcıyı admin yap
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: 'admin' },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        message: `${email} kullanıcısı başarıyla admin yapıldı.`,
        user: updatedUser
      }),
    };
  } catch (error) {
    console.error('Admin yapma hatası:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        message: 'Sunucu hatası, lütfen daha sonra tekrar deneyin',
        error: process.env.NODE_ENV !== 'production' ? String(error) : undefined
      }),
    };
  }
};

export { handler }; 