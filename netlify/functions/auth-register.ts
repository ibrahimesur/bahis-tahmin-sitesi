import { Handler } from '@netlify/functions';
import prisma from './utils/prisma';
import bcrypt from 'bcryptjs';

const handler: Handler = async (event, context) => {
  // CORS için header ayarları
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // OPTIONS isteği için CORS yanıtı
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Sadece POST isteklerine işlem yap
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  try {
    // İstek gövdesini ayrıştır
    const { username, email, password } = JSON.parse(event.body || '{}');

    // Gerekli alanları kontrol et
    if (!username || !email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          message: 'Kullanıcı adı, e-posta ve şifre zorunludur' 
        }),
      };
    }

    // Email kontrolü: Zaten kayıtlı mı?
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          message: 'Bu e-posta adresi zaten kullanılmaktadır' 
        }),
      };
    }

    // Şifreyi hash'le
    const hashedPassword = await bcrypt.hash(password, 10);

    // Yeni kullanıcı oluştur
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    // Hassas bilgileri silip yanıt döndür
    const { password: _, ...userWithoutPassword } = newUser;
    
    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ 
        message: 'Kullanıcı başarıyla oluşturuldu', 
        user: userWithoutPassword 
      }),
    };
  } catch (error) {
    console.error('Kullanıcı kaydı hatası:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        message: 'Sunucu hatası, lütfen daha sonra tekrar deneyin' 
      }),
    };
  }
};

export { handler }; 