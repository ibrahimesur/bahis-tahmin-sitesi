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
  } catch (error) {
    console.error('Token doğrulama hatası:', error);
    return res.status(401).json({ message: 'Geçersiz veya süresi dolmuş token' });
  }

  const userId = decodedToken.userId;

  // Kullanıcının editör veya admin olup olmadığını kontrol et
  if (decodedToken.role !== 'editor' && decodedToken.role !== 'admin') {
    return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
  }

  try {
    // Kullanıcı bilgilerini getir
    const user = await prisma.user.findUnique({
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

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Başarı oranını hesapla
    const predictions = await prisma.prediction.findMany({
      where: {
        authorId: userId,
        status: {
          in: ['WON', 'LOST'] // Sadece sonuçlanmış tahminler
        }
      },
      select: {
        status: true
      }
    });

    const totalPredictions = predictions.length;
    const wonPredictions = predictions.filter(p => p.status === 'WON').length;
    const successRate = totalPredictions > 0 
      ? Math.round((wonPredictions / totalPredictions) * 100) 
      : 0;

    // İstatistikleri döndür
    return res.status(200).json({
      articles: user._count.articles,
      predictions: user._count.predictions,
      followers: user._count.followers,
      successRate
    });
  } catch (error) {
    console.error('Editör istatistikleri alınırken hata:', error);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
} 