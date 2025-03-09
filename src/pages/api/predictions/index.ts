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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // OPTIONS isteği için hızlı yanıt
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET isteği - Tahminleri listele
  if (req.method === 'GET') {
    try {
      const { authorId, status, limit = '10', page = '1' } = req.query;
      
      // Filtreleme koşullarını oluştur
      const where: any = {};
      
      if (authorId) {
        where.authorId = authorId;
      }
      
      if (status) {
        where.status = status;
      }
      
      // Sayfalama parametrelerini ayarla
      const pageNumber = parseInt(page as string, 10);
      const pageSize = parseInt(limit as string, 10);
      const skip = (pageNumber - 1) * pageSize;
      
      // Toplam tahmin sayısını al
      const totalCount = await prisma.prediction.count({ where });
      
      // Tahminleri getir
      const predictions = await prisma.prediction.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true,
              role: true
            }
          },
          match: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: pageSize
      });
      
      // Sayfalama bilgilerini ekle
      const totalPages = Math.ceil(totalCount / pageSize);
      
      return res.status(200).json({
        predictions,
        pagination: {
          total: totalCount,
          page: pageNumber,
          pageSize,
          totalPages
        }
      });
    } catch (error) {
      console.error('Tahminler listelenirken hata:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }
  
  // POST isteği - Yeni tahmin oluştur
  else if (req.method === 'POST') {
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
      const { title, content, matchId, prediction, odds } = req.body;
      console.log('Tahmin oluşturma isteği:', { title, matchId, prediction });
      
      // Zorunlu alanları kontrol et
      if (!title || !content || !matchId || !prediction) {
        return res.status(400).json({ message: 'Başlık, içerik, maç ve tahmin alanları zorunludur' });
      }
      
      // Maçın var olup olmadığını kontrol et
      const match = await prisma.match.findUnique({
        where: { id: matchId }
      });
      
      if (!match) {
        return res.status(404).json({ message: 'Seçilen maç bulunamadı' });
      }
      
      // Yeni tahmin oluştur
      const newPrediction = await prisma.prediction.create({
        data: {
          title,
          content,
          matchId,
          prediction,
          odds: parseFloat(odds.toString()) || 1.5,
          status: 'PENDING',
          authorId: userId
        }
      });
      
      console.log('Tahmin başarıyla oluşturuldu:', { id: newPrediction.id, title: newPrediction.title });
      return res.status(201).json(newPrediction);
    } catch (error) {
      console.error('Tahmin oluşturulurken hata:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }
  
  // Desteklenmeyen HTTP metodu
  else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
} 