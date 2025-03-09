import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import jwt from 'jsonwebtoken';

// JWT token için tip tanımı
interface JwtPayload {
  userId: string;
  role: string;
  iat?: number;
  exp?: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS başlıkları
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  // OPTIONS isteği için hızlı yanıt
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Sadece GET isteklerini işle
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Token doğrulama
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Yetkilendirme başarısız' });
  }

  const token = authHeader.split(' ')[1];
  let decodedToken: JwtPayload;

  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as JwtPayload;
    console.log('Token doğrulandı:', { 
      userId: decodedToken.userId, 
      role: decodedToken.role 
    });
  } catch (error) {
    console.error('Token doğrulama hatası:', error);
    return res.status(401).json({ message: 'Geçersiz veya süresi dolmuş token' });
  }

  const userId = decodedToken.userId;

  // Kullanıcının editör veya admin olup olmadığını kontrol et
  // Büyük/küçük harf duyarsız kontrol
  const userRole = decodedToken.role.toLowerCase();
  console.log('Kullanıcı rolü kontrolü:', { role: userRole });
  
  if (userRole !== 'editor' && userRole !== 'admin') {
    console.error('Yetkisiz erişim:', { userId, role: userRole });
    return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
  }

  try {
    console.log('Editör istatistikleri alınıyor:', { userId });
    
    // Kullanıcı bilgilerini getir
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          role: true,
          _count: {
            select: {
              articles: true,
              predictions: true,
              followers: true
            }
          }
        }
      });
    } catch (dbError) {
      console.error('Kullanıcı bilgileri alınırken veritabanı hatası:', dbError);
      return res.status(500).json({ 
        message: 'Kullanıcı bilgileri alınırken veritabanı hatası oluştu',
        error: process.env.NODE_ENV === 'development' ? String(dbError) : undefined
      });
    }

    if (!user) {
      console.error('Kullanıcı bulunamadı:', { userId });
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Başarı oranını hesapla
    let predictions = [];
    try {
      predictions = await prisma.prediction.findMany({
        where: {
          authorId: userId,
          status: {
            in: ['WON', 'LOST', 'won', 'lost'] // Büyük/küçük harf duyarsız kontrol için
          }
        },
        select: {
          status: true
        }
      });
    } catch (dbError) {
      console.error('Tahminler alınırken veritabanı hatası:', dbError);
      return res.status(500).json({ 
        message: 'Tahminler alınırken veritabanı hatası oluştu',
        error: process.env.NODE_ENV === 'development' ? String(dbError) : undefined
      });
    }

    const totalPredictions = predictions.length;
    const wonPredictions = predictions.filter(p => 
      p.status.toUpperCase() === 'WON'
    ).length;
    const successRate = totalPredictions > 0 
      ? Math.round((wonPredictions / totalPredictions) * 100) 
      : 0;

    console.log('Başarı oranı hesaplandı:', { 
      totalPredictions, 
      wonPredictions, 
      successRate 
    });

    // İstatistikleri döndür
    const stats = {
      articles: user._count.articles || 0,
      predictions: user._count.predictions || 0,
      followers: user._count.followers || 0,
      successRate
    };
    
    console.log('Editör istatistikleri:', stats);
    return res.status(200).json(stats);
  } catch (error) {
    console.error('Editör istatistikleri alınırken hata:', error);
    return res.status(500).json({ 
      message: 'Sunucu hatası',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
} 