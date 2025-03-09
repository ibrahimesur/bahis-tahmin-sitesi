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

// Hataları yakalamak için yardımcı fonksiyon
const errorHandler = (res: NextApiResponse, error: any, statusCode: number = 500, message: string = 'Sunucu hatası') => {
  console.error(message, error);
  
  // Yanıtı JSON olarak döndür
  res.status(statusCode).json({
    success: false,
    message: message,
    error: process.env.NODE_ENV === 'development' ? String(error) : undefined
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS başlıkları
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  // OPTIONS isteği için hızlı yanıt
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ success: true });
  }

  // Sadece GET isteklerini işle
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false,
      message: 'Method Not Allowed' 
    });
  }

  // Token doğrulama
  const authHeader = req.headers.authorization;
  
  // Geliştirme ortamında token kontrolünü esnek yap
  const isDevelopment = process.env.NODE_ENV === 'development';
  if (isDevelopment) {
    console.log('Geliştirme ortamında token kontrolü esnek yapılıyor');
    
    // Token yoksa veya geçersizse bile devam et
    let userId = 'test-user-id';
    let userRole = 'editor';
    
    // Token varsa doğrulamaya çalış
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as JwtPayload;
        userId = decodedToken.userId;
        userRole = decodedToken.role.toLowerCase();
        console.log('Geliştirme ortamında token doğrulandı:', { userId, userRole });
      } catch (error) {
        console.warn('Geliştirme ortamında token doğrulama hatası, varsayılan değerler kullanılıyor:', error);
      }
    } else {
      console.warn('Geliştirme ortamında token bulunamadı, varsayılan değerler kullanılıyor');
    }
    
    try {
      // Test kullanıcısı için istatistikleri getir
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { id: userId },
            { role: { in: ['editor', 'admin'] } }
          ]
        }
      });
      
      if (!user) {
        console.warn('Geliştirme ortamında kullanıcı bulunamadı, test verileri döndürülüyor');
        return res.status(200).json({
          success: true,
          articles: 5,
          predictions: 10,
          followers: 20,
          successRate: 75
        });
      }
      
      // Kullanıcının makalelerini say
      const articlesCount = await prisma.article.count({
        where: { authorId: user.id }
      });
      
      // Kullanıcının tahminlerini say
      const predictionsCount = await prisma.prediction.count({
        where: { authorId: user.id }
      });
      
      // Kullanıcının takipçilerini say
      const followersCount = await prisma.follows.count({
        where: { followingId: user.id }
      });
      
      // Başarılı tahminlerin oranını hesapla
      const successfulPredictions = await prisma.prediction.count({
        where: { 
          authorId: user.id,
          status: { in: ['kazandı', 'kazandi', 'KAZANDI', 'Kazandı'] }
        }
      });
      
      const successRate = predictionsCount > 0 
        ? Math.round((successfulPredictions / predictionsCount) * 100) 
        : 0;
      
      return res.status(200).json({
        success: true,
        articles: articlesCount,
        predictions: predictionsCount,
        followers: followersCount,
        successRate
      });
    } catch (error) {
      return errorHandler(res, error, 500, 'İstatistikler alınırken hata oluştu');
    }
  }
  
  // Üretim ortamında normal token kontrolü yap
  if (!isDevelopment && (!authHeader || !authHeader.startsWith('Bearer '))) {
    return res.status(401).json({ 
      success: false,
      message: 'Yetkilendirme başarısız' 
    });
  }

  // Token varsa doğrula
  if (authHeader && authHeader.startsWith('Bearer ')) {
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
      return res.status(401).json({ 
        success: false,
        message: 'Geçersiz veya süresi dolmuş token',
        error: process.env.NODE_ENV === 'development' ? String(error) : undefined
      });
    }

    const userId = decodedToken.userId;

    // Kullanıcının editör veya admin olup olmadığını kontrol et
    const userRole = decodedToken.role.toLowerCase();
    if (userRole !== 'editor' && userRole !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Bu işlem için yetkiniz yok' 
      });
    }

    try {
      // Kullanıcının varlığını kontrol et
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: 'Kullanıcı bulunamadı' 
        });
      }

      // Kullanıcının makalelerini say
      const articlesCount = await prisma.article.count({
        where: { authorId: userId }
      });
      
      // Kullanıcının tahminlerini say
      const predictionsCount = await prisma.prediction.count({
        where: { authorId: userId }
      });
      
      // Kullanıcının takipçilerini say
      const followersCount = await prisma.follows.count({
        where: { followingId: userId }
      });
      
      // Başarılı tahminlerin oranını hesapla
      const successfulPredictions = await prisma.prediction.count({
        where: { 
          authorId: userId,
          status: { in: ['kazandı', 'kazandi', 'KAZANDI', 'Kazandı'] }
        }
      });
      
      const successRate = predictionsCount > 0 
        ? Math.round((successfulPredictions / predictionsCount) * 100) 
        : 0;
      
      return res.status(200).json({
        success: true,
        articles: articlesCount,
        predictions: predictionsCount,
        followers: followersCount,
        successRate
      });
    } catch (error) {
      return errorHandler(res, error, 500, 'İstatistikler alınırken hata oluştu');
    }
  } else if (!isDevelopment) {
    // Üretim ortamında token yoksa hata döndür
    return res.status(401).json({ 
      success: false,
      message: 'Yetkilendirme başarısız' 
    });
  } else {
    // Geliştirme ortamında token yoksa test verileri döndür
    return res.status(200).json({
      success: true,
      articles: 5,
      predictions: 10,
      followers: 20,
      successRate: 75
    });
  }
} 