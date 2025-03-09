import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

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

  try {
    const { id } = req.query;
    console.log('Editör detayı isteniyor:', { id });

    if (!id || typeof id !== 'string') {
      console.error('Geçersiz editör ID:', id);
      return res.status(400).json({ message: 'Geçersiz editör ID' });
    }

    // Editör bilgilerini getir
    console.log('Veritabanından editör bilgileri alınıyor:', { id });
    const editor = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        avatar: true,
        bio: true,
        role: true,
        _count: {
          select: {
            followers: true,
            predictions: true,
            articles: true,
          }
        },
        predictions: {
          select: {
            status: true,
          }
        }
      }
    });

    console.log('Veritabanı sorgusu sonucu:', { 
      found: !!editor, 
      role: editor?.role,
      username: editor?.username
    });

    if (!editor) {
      console.error('Editör bulunamadı:', { id });
      return res.status(404).json({ message: 'Editör bulunamadı' });
    }

    // Rol kontrolü - büyük/küçük harf duyarsız kontrol
    if (editor.role.toUpperCase() !== 'EDITOR') {
      console.error('Kullanıcı bir editör değil:', { id, role: editor.role });
      return res.status(404).json({ message: 'Kullanıcı bir editör değil' });
    }

    // Başarı oranını hesapla
    const totalPredictions = editor.predictions.length;
    const wonPredictions = editor.predictions.filter(p => p.status.toUpperCase() === 'WON').length;
    const successRate = totalPredictions > 0 
      ? Math.round((wonPredictions / totalPredictions) * 100) 
      : 0;

    console.log('Başarı oranı hesaplandı:', { 
      totalPredictions, 
      wonPredictions, 
      successRate 
    });

    // İçerik sayısını hesapla (tahminler + makaleler)
    const contentCount = editor._count.predictions + editor._count.articles;

    // Yanıt formatını hazırla
    const formattedEditor = {
      id: editor.id,
      name: editor.username,
      image: editor.avatar,
      bio: editor.bio,
      successRate,
      followers: editor._count.followers,
      contentCount
    };

    console.log('Editör bilgileri başarıyla alındı:', { 
      id, 
      name: editor.username,
      followers: editor._count.followers,
      contentCount
    });

    return res.status(200).json(formattedEditor);
  } catch (error) {
    console.error('Editör detayları alınırken hata:', error);
    return res.status(500).json({ 
      message: 'Sunucu hatası',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
} 