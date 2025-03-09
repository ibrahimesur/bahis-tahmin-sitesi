import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('API: /api/admin/users - İstek alındı', {
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
    console.log('API: /api/admin/users - OPTIONS isteği yanıtlandı');
    res.status(200).end();
    return;
  }

  // Sadece GET isteklerine izin ver
  if (req.method !== 'GET') {
    console.log(`API: /api/admin/users - Desteklenmeyen metod: ${req.method}`);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Token doğrulama
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('API: /api/admin/users - Token bulunamadı');
    return res.status(401).json({ message: 'Yetkilendirme başarısız: Token bulunamadı' });
  }

  const token = authHeader.split(' ')[1];
  console.log('API: /api/admin/users - Token alındı', { tokenLength: token.length });
  
  let decodedToken;

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('API: /api/admin/users - JWT_SECRET bulunamadı');
      throw new Error('JWT_SECRET ortam değişkeni tanımlanmamış');
    }
    
    console.log('API: /api/admin/users - Token doğrulanıyor');
    decodedToken = jwt.verify(token, jwtSecret) as { userId: string };
    console.log('API: /api/admin/users - Token doğrulandı', { userId: decodedToken.userId });
  } catch (error) {
    console.error('API: /api/admin/users - Token doğrulama hatası', error);
    return res.status(401).json({ message: 'Yetkilendirme başarısız: Geçersiz token' });
  }

  try {
    // İstek yapan kullanıcının admin olup olmadığını kontrol et
    console.log('API: /api/admin/users - Admin kontrolü yapılıyor', { userId: decodedToken.userId });
    const adminUser = await prisma.user.findUnique({
      where: { id: decodedToken.userId }
    });

    if (!adminUser) {
      console.error('API: /api/admin/users - Kullanıcı bulunamadı');
      return res.status(403).json({ message: 'Kullanıcı bulunamadı' });
    }

    if (adminUser.role !== 'admin') {
      console.error('API: /api/admin/users - Yetkisiz erişim', { role: adminUser.role });
      return res.status(403).json({ message: 'Bu işlem için admin yetkisi gerekiyor' });
    }

    // Tüm kullanıcıları getir
    console.log('API: /api/admin/users - Kullanıcılar getiriliyor');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        membershipType: true,
        createdAt: true,
        updatedAt: true,
        avatar: true,
        bio: true,
        successRate: true,
        // Şifre gibi hassas bilgileri dahil etme
        password: false
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('API: /api/admin/users - Kullanıcılar bulundu', { count: users.length });
    return res.status(200).json({ users });
  } catch (error) {
    console.error('API: /api/admin/users - Sunucu hatası:', error);
    return res.status(500).json({
      message: 'Sunucu hatası',
      error: process.env.NODE_ENV !== 'production' ? String(error) : undefined
    });
  }
} 