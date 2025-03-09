import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS için header ayarları
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // OPTIONS isteği için CORS yanıtı
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Sadece GET isteklerine izin ver
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Token doğrulama
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Yetkilendirme başarısız: Token bulunamadı' });
  }

  const token = authHeader.split(' ')[1];
  let decodedToken;

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET ortam değişkeni tanımlanmamış');
    }
    
    decodedToken = jwt.verify(token, jwtSecret) as { userId: string };
  } catch (error) {
    return res.status(401).json({ message: 'Yetkilendirme başarısız: Geçersiz token' });
  }

  try {
    // İstek yapan kullanıcının admin olup olmadığını kontrol et
    const adminUser = await prisma.user.findUnique({
      where: { id: decodedToken.userId }
    });

    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ message: 'Bu işlem için admin yetkisi gerekiyor' });
    }

    // E-posta adresini al
    const email = req.query.email as string;
    
    if (!email) {
      return res.status(400).json({ message: 'E-posta adresi belirtilmedi' });
    }

    // Kullanıcıları ara
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

    return res.status(200).json({ users });
  } catch (error) {
    console.error('Kullanıcı arama hatası:', error);
    return res.status(500).json({
      message: 'Sunucu hatası',
      error: process.env.NODE_ENV !== 'production' ? String(error) : undefined
    });
  }
} 