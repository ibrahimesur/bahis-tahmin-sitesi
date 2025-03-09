import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('API: /api/editors/[id] - İstek alındı', {
    method: req.method,
    query: req.query
  });

  // CORS için header ayarları
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // OPTIONS isteği için CORS yanıtı
  if (req.method === 'OPTIONS') {
    console.log('API: /api/editors/[id] - OPTIONS isteği yanıtlandı');
    res.status(200).end();
    return;
  }

  // Sadece GET isteklerine izin ver
  if (req.method !== 'GET') {
    console.log(`API: /api/editors/[id] - Desteklenmeyen metod: ${req.method}`);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      console.error('API: /api/editors/[id] - Geçersiz ID');
      return res.status(400).json({ message: 'Geçersiz editör ID' });
    }

    console.log('API: /api/editors/[id] - Editör getiriliyor', { id });
    
    // Editörü getir
    const editor = await prisma.user.findUnique({
      where: {
        id,
        role: 'editor'
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        avatar: true,
        bio: true,
        successRate: true,
        createdAt: true,
        // Takipçi sayısını hesapla
        _count: {
          select: {
            followers: true,
            predictions: true,
            articles: true
          }
        },
        // Şifre gibi hassas bilgileri dahil etme
        password: false
      }
    });

    if (!editor) {
      console.error('API: /api/editors/[id] - Editör bulunamadı', { id });
      return res.status(404).json({ message: 'Editör bulunamadı' });
    }

    // Editörün tahmin başarı oranını hesapla
    const predictions = await prisma.prediction.findMany({
      where: {
        authorId: editor.id,
        status: {
          in: ['won', 'lost'] // Sadece sonuçlanmış tahminler
        }
      },
      select: {
        status: true
      }
    });
    
    // Başarı oranını hesapla
    const totalPredictions = predictions.length;
    const wonPredictions = predictions.filter(p => p.status === 'won').length;
    const successRate = totalPredictions > 0 
      ? Math.round((wonPredictions / totalPredictions) * 100) 
      : editor.successRate || 75; // Tahmin yoksa varsayılan değer veya mevcut değer
    
    // Takipçi sayısını al
    const followers = editor._count.followers;
    
    // Toplam içerik sayısı (tahminler + makaleler)
    const contentCount = editor._count.predictions + editor._count.articles;
    
    const formattedEditor = {
      id: editor.id,
      name: editor.username,
      image: editor.avatar || '/images/default-avatar.png', // Avatar yoksa varsayılan resim
      bio: editor.bio || 'Profesyonel bahis tahmincisi',
      successRate: successRate,
      followers: followers,
      contentCount: contentCount
    };

    console.log('API: /api/editors/[id] - Editör bulundu', { id, name: editor.username });
    return res.status(200).json(formattedEditor);
  } catch (error) {
    console.error('API: /api/editors/[id] - Sunucu hatası:', error);
    return res.status(500).json({
      message: 'Sunucu hatası',
      error: process.env.NODE_ENV !== 'production' ? String(error) : undefined
    });
  }
} 