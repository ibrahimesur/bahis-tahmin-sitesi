import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('API: /api/admin/users/search - İstek alındı', {
    method: req.method,
    query: req.query,
    headers: {
      authorization: req.headers.authorization ? 'Bearer ***' : 'Yok',
      'content-type': req.headers['content-type']
    }
  });

  // CORS için header ayarları
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // OPTIONS isteği için CORS yanıtı
  if (req.method === 'OPTIONS') {
    console.log('API: /api/admin/users/search - OPTIONS isteği yanıtlandı');
    res.status(200).end();
    return;
  }

  // Sadece GET isteklerine izin ver
  if (req.method !== 'GET') {
    console.log(`API: /api/admin/users/search - Desteklenmeyen metod: ${req.method}`);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Token doğrulama
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('API: /api/admin/users/search - Token bulunamadı');
    return res.status(401).json({ message: 'Yetkilendirme başarısız: Token bulunamadı' });
  }

  const token = authHeader.split(' ')[1];
  console.log('API: /api/admin/users/search - Token alındı', { tokenLength: token.length });
  
  let decodedToken;

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('API: /api/admin/users/search - JWT_SECRET bulunamadı');
      throw new Error('JWT_SECRET ortam değişkeni tanımlanmamış');
    }
    
    console.log('API: /api/admin/users/search - Token doğrulanıyor');
    decodedToken = jwt.verify(token, jwtSecret) as { userId: string };
    console.log('API: /api/admin/users/search - Token doğrulandı', { userId: decodedToken.userId });
  } catch (error) {
    console.error('API: /api/admin/users/search - Token doğrulama hatası', error);
    return res.status(401).json({ message: 'Yetkilendirme başarısız: Geçersiz token' });
  }

  try {
    // İstek yapan kullanıcının admin olup olmadığını kontrol et
    console.log('API: /api/admin/users/search - Admin kontrolü yapılıyor', { userId: decodedToken.userId });
    const adminUser = await prisma.user.findUnique({
      where: { id: decodedToken.userId }
    });

    if (!adminUser) {
      console.error('API: /api/admin/users/search - Kullanıcı bulunamadı');
      return res.status(403).json({ message: 'Kullanıcı bulunamadı' });
    }

    if (adminUser.role !== 'admin') {
      console.error('API: /api/admin/users/search - Yetkisiz erişim', { role: adminUser.role });
      return res.status(403).json({ message: 'Bu işlem için admin yetkisi gerekiyor' });
    }

    // E-posta adresini al
    const email = req.query.email as string;
    
    if (!email) {
      console.error('API: /api/admin/users/search - E-posta adresi belirtilmedi');
      return res.status(400).json({ message: 'E-posta adresi belirtilmedi' });
    }

    // Kullanıcıları ara
    console.log('API: /api/admin/users/search - Kullanıcılar aranıyor', { email });
    const users = await prisma.user.findMany({
      where: {
        email: {
          contains: email,
          mode: 'insensitive' // Büyük/küçük harf duyarsız arama
        }
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Şifre gibi hassas bilgileri dahil etme
        password: false
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10 // En fazla 10 sonuç göster
    });

    console.log('API: /api/admin/users/search - Kullanıcılar bulundu', { count: users.length });
    return res.status(200).json({ users });
  } catch (error) {
    console.error('API: /api/admin/users/search - Sunucu hatası:', error);
    return res.status(500).json({
      message: 'Sunucu hatası',
      error: process.env.NODE_ENV !== 'production' ? String(error) : undefined
    });
  }
} 