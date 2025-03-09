import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS için header ayarları
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // OPTIONS isteği için CORS yanıtı
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
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

  // Kullanıcıyı bul ve rolünü kontrol et
  try {
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    if (user.role !== 'editor' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    // GET isteği - Editörün yazılarını getir
    if (req.method === 'GET') {
      const articles = await prisma.article.findMany({
        where: { authorId: user.id },
        orderBy: { createdAt: 'desc' }
      });

      return res.status(200).json({ articles });
    }

    // POST isteği - Yeni yazı ekle
    if (req.method === 'POST') {
      const { title, content, category, image } = req.body;

      if (!title || !content || !category) {
        return res.status(400).json({ message: 'Başlık, içerik ve kategori zorunludur' });
      }

      const article = await prisma.article.create({
        data: {
          title,
          content,
          category,
          image: image || null,
          authorId: user.id
        }
      });

      return res.status(201).json({ message: 'Yazı başarıyla eklendi', article });
    }

    // Desteklenmeyen HTTP metodu
    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    console.error('API hatası:', error);
    return res.status(500).json({ 
      message: 'Sunucu hatası',
      error: process.env.NODE_ENV !== 'production' ? String(error) : undefined
    });
  }
} 