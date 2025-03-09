import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS için header ayarları
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
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

  // Yazı ID'sini al
  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Geçersiz yazı ID' });
  }

  try {
    // Kullanıcıyı bul ve rolünü kontrol et
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Yazıyı bul
    const article = await prisma.article.findUnique({
      where: { id }
    });

    if (!article) {
      return res.status(404).json({ message: 'Yazı bulunamadı' });
    }

    // Yetki kontrolü: Sadece yazının sahibi veya admin düzenleyebilir/silebilir
    if (article.authorId !== user.id && user.role !== 'admin') {
      return res.status(403).json({ message: 'Bu yazı üzerinde işlem yapma yetkiniz yok' });
    }

    // GET isteği - Yazı detaylarını getir
    if (req.method === 'GET') {
      return res.status(200).json({ article });
    }

    // PUT isteği - Yazıyı güncelle
    if (req.method === 'PUT') {
      const { title, content, category, image } = req.body;

      if (!title || !content || !category) {
        return res.status(400).json({ message: 'Başlık, içerik ve kategori zorunludur' });
      }

      const updatedArticle = await prisma.article.update({
        where: { id },
        data: {
          title,
          content,
          category,
          image: image || null,
          updatedAt: new Date()
        }
      });

      return res.status(200).json({ 
        message: 'Yazı başarıyla güncellendi', 
        article: updatedArticle 
      });
    }

    // DELETE isteği - Yazıyı sil
    if (req.method === 'DELETE') {
      await prisma.article.delete({
        where: { id }
      });

      return res.status(200).json({ message: 'Yazı başarıyla silindi' });
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