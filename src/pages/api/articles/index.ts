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

  // GET isteği - Makaleleri listele
  if (req.method === 'GET') {
    try {
      const { category, authorId, limit = '10', page = '1' } = req.query;
      
      // Filtreleme koşullarını oluştur
      const where: any = {};
      
      if (category) {
        where.category = category;
      }
      
      if (authorId) {
        where.authorId = authorId;
      }
      
      // Sayfalama parametrelerini ayarla
      const pageNumber = parseInt(page as string, 10);
      const pageSize = parseInt(limit as string, 10);
      const skip = (pageNumber - 1) * pageSize;
      
      // Toplam makale sayısını al
      const totalCount = await prisma.article.count({ where });
      
      // Makaleleri getir
      const articles = await prisma.article.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true,
              role: true
            }
          }
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
        articles,
        pagination: {
          total: totalCount,
          page: pageNumber,
          pageSize,
          totalPages
        }
      });
    } catch (error) {
      console.error('Makaleler listelenirken hata:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }
  
  // POST isteği - Yeni makale oluştur
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
      const { title, content, category, image } = req.body;
      console.log('Makale oluşturma isteği:', { title, category });
      
      // Zorunlu alanları kontrol et
      if (!title || !content) {
        return res.status(400).json({ message: 'Başlık ve içerik alanları zorunludur' });
      }
      
      try {
        // Yeni makale oluştur
        const article = await prisma.article.create({
          data: {
            title,
            content,
            category: category || 'genel',
            image: image || null,
            authorId: userId
          }
        });
        
        console.log('Makale başarıyla oluşturuldu:', { id: article.id, title: article.title });
        return res.status(201).json(article);
      } catch (dbError) {
        console.error('Veritabanı hatası:', dbError);
        return res.status(500).json({ 
          message: 'Makale oluşturulurken veritabanı hatası oluştu',
          error: process.env.NODE_ENV === 'development' ? String(dbError) : undefined
        });
      }
    } catch (error) {
      console.error('Makale oluşturulurken hata:', error);
      return res.status(500).json({ 
        message: 'Sunucu hatası',
        error: process.env.NODE_ENV === 'development' ? String(error) : undefined
      });
    }
  }
  
  // Desteklenmeyen HTTP metodu
  else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
} 