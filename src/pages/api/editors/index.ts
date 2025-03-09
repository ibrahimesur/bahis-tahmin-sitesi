import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('API: /api/editors - İstek alındı', {
    method: req.method,
    query: req.query
  });

  // CORS için header ayarları
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // OPTIONS isteği için CORS yanıtı
  if (req.method === 'OPTIONS') {
    console.log('API: /api/editors - OPTIONS isteği yanıtlandı');
    res.status(200).end();
    return;
  }

  // Sadece GET isteklerine izin ver
  if (req.method !== 'GET') {
    console.log(`API: /api/editors - Desteklenmeyen metod: ${req.method}`);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    console.log('API: /api/editors - Editörler getiriliyor');
    
    // Editör rolüne sahip kullanıcıları getir
    const editors = await prisma.user.findMany({
      where: {
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
      },
      orderBy: {
        successRate: 'desc' // Başarı oranına göre sırala
      },
      take: 10 // En fazla 10 editör göster
    });

    console.log('API: /api/editors - Editörler bulundu', { count: editors.length });
    
    // Editörlerin tahmin başarı oranlarını hesapla
    const editorsWithStats = await Promise.all(
      editors.map(async (editor) => {
        // Editörün tahminlerini getir
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
        
        return {
          id: editor.id,
          name: editor.username,
          image: editor.avatar || '/images/default-avatar.png', // Avatar yoksa varsayılan resim
          successRate: successRate,
          followers: followers,
          bio: editor.bio || 'Profesyonel bahis tahmincisi',
          contentCount: contentCount
        };
      })
    );

    return res.status(200).json({ editors: editorsWithStats });
  } catch (error) {
    console.error('API: /api/editors - Sunucu hatası:', error);
    return res.status(500).json({
      message: 'Sunucu hatası',
      error: process.env.NODE_ENV !== 'production' ? String(error) : undefined
    });
  }
} 