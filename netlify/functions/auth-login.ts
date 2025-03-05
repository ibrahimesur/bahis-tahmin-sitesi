import { Handler } from '@netlify/functions';
import prisma from './utils/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const handler: Handler = async (event, context) => {
  console.log('auth-login function called');
  
  // CORS için header ayarları - tüm domainlere izin ver
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // OPTIONS isteği için CORS yanıtı
  if (event.httpMethod === 'OPTIONS') {
    console.log('OPTIONS isteği işleniyor');
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Sadece POST isteklerine işlem yap
  if (event.httpMethod !== 'POST') {
    console.log(`Desteklenmeyen HTTP metodu: ${event.httpMethod}`);
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  try {
    // İstek gövdesini ayrıştır
    const body = event.body || '{}';
    console.log('İstek gövdesi:', body);
    
    const { email, password } = JSON.parse(body);
    console.log('Giriş denemesi:', { email: email });

    // Gerekli alanları kontrol et
    if (!email || !password) {
      console.log('Eksik alanlar:', { email: !!email, password: !!password });
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          message: 'E-posta ve şifre zorunludur' 
        }),
      };
    }

    // Kullanıcıyı bul
    console.log('Kullanıcı aranıyor:', email);
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('Kullanıcı bulunamadı:', email);
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ 
          message: 'Geçersiz e-posta veya şifre' 
        }),
      };
    }

    // Şifre kontrolü
    console.log('Şifre doğrulanıyor');
    const passwordValid = await bcrypt.compare(password, user.password);
    
    if (!passwordValid) {
      console.log('Şifre geçersiz');
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
    console.log('JWT token oluşturuluyor');
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
    
    console.log('Giriş başarılı:', { userId: user.id });
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
        message: 'Sunucu hatası, lütfen daha sonra tekrar deneyin',
        error: process.env.NODE_ENV !== 'production' ? String(error) : undefined
      }),
    };
  }
};

export { handler }; 