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
  // CORS başlıklarını her durumda ekle
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  // OPTIONS isteği için hızlı yanıt
  if (req.method === 'OPTIONS') {
    res.status(200).json({ success: true });
    return;
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
      
      try {
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
          success: true,
          articles,
          pagination: {
            total: totalCount,
            page: pageNumber,
            pageSize,
            totalPages
          }
        });
      } catch (dbError) {
        return errorHandler(res, dbError, 500, 'Makaleler listelenirken veritabanı hatası oluştu');
      }
    } catch (error) {
      return errorHandler(res, error, 500, 'Makaleler listelenirken hata oluştu');
    }
  }
  
  // POST isteği - Yeni makale oluştur
  else if (req.method === 'POST') {
    try {
      // Token doğrulama
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
          success: false,
          message: 'Yetkilendirme başarısız'
        });
      }

      const token = authHeader.split(' ')[1];
      let decodedToken: JwtPayload;

      try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as JwtPayload;
        console.log('Token doğrulandı:', { 
          userId: decodedToken.userId, 
          role: decodedToken.role 
        });
      } catch (jwtError) {
        console.error('Token doğrulama hatası:', jwtError);
        return res.status(401).json({ 
          success: false,
          message: 'Geçersiz veya süresi dolmuş token',
          error: process.env.NODE_ENV === 'development' ? String(jwtError) : undefined
        });
      }

      const userId = decodedToken.userId;

      // Kullanıcının editör veya admin olup olmadığını kontrol et
      // Büyük/küçük harf duyarsız kontrol
      const userRole = decodedToken.role.toLowerCase();
      console.log('Kullanıcı rolü kontrolü:', { role: userRole });
      
      if (userRole !== 'editor' && userRole !== 'admin') {
        console.error('Yetkisiz erişim:', { userId, role: userRole });
        return res.status(403).json({ 
          success: false,
          message: 'Bu işlem için yetkiniz yok'
        });
      }

      // İstek gövdesini kontrol et
      const { title, content, category, image } = req.body;
      console.log('Makale oluşturma isteği:', { 
        title, 
        category, 
        contentLength: content?.length,
        body: req.body 
      });
      
      // Zorunlu alanları kontrol et
      if (!title || !content) {
        return res.status(400).json({ 
          success: false,
          message: 'Başlık ve içerik alanları zorunludur'
        });
      }
      
      try {
        // Kullanıcının varlığını kontrol et
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, role: true }
        });
        
        if (!user) {
          console.error('Kullanıcı bulunamadı:', { userId });
          return res.status(404).json({ 
            success: false,
            message: 'Kullanıcı bulunamadı'
          });
        }
        
        console.log('Kullanıcı doğrulandı:', { id: user.id, role: user.role });
        
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
        return res.status(201).json({
          success: true,
          id: article.id,
          title: article.title,
          message: 'Makale başarıyla oluşturuldu'
        });
      } catch (dbError) {
        console.error('Veritabanı hatası:', dbError);
        return res.status(500).json({ 
          success: false,
          message: 'Makale oluşturulurken veritabanı hatası oluştu',
          error: process.env.NODE_ENV === 'development' ? String(dbError) : undefined
        });
      }
    } catch (error) {
      console.error('Genel hata:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Makale oluşturulurken hata oluştu',
        error: process.env.NODE_ENV === 'development' ? String(error) : undefined
      });
    }
  }
  
  // Desteklenmeyen HTTP metodu
  else {
    return res.status(405).json({ 
      success: false,
      message: 'Method Not Allowed'
    });
  }
} 