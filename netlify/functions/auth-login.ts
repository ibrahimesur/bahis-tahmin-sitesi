import { Handler } from '@netlify/functions';
import prisma from './utils/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
    const { email, password } = JSON.parse(event.body || '{}');

    // Gerekli alanları kontrol et
    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          message: 'E-posta ve şifre zorunludur' 
        }),
      };
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Kullanıcı bulunamadıysa veya şifre eşleşmiyorsa
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ 
          message: 'Geçersiz e-posta veya şifre' 
        }),
      };
    }

    // JWT secret kontrol et
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET ortam değişkeni tanımlanmamış');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          message: 'Sunucu yapılandırma hatası' 
        }),
      };
    }

    // JWT token oluştur
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email 
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    // Hassas bilgileri silip yanıt döndür
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Giriş başarılı',
        user: userWithoutPassword,
        token
      }),
    };
  } catch (error) {
    console.error('Kullanıcı girişi hatası:', error);
    
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