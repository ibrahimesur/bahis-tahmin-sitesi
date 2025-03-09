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
        // Şifre gibi hassas bilgileri dahil etme
        password: false
      },
      orderBy: {
        successRate: 'desc' // Başarı oranına göre sırala
      },
      take: 10 // En fazla 10 editör göster
    });

    console.log('API: /api/editors - Editörler bulundu', { count: editors.length });
    
    // Editörleri istemcinin beklediği formata dönüştür
    const formattedEditors = editors.map(editor => ({
      id: editor.id,
      name: editor.username,
      image: editor.avatar || '/images/default-avatar.png', // Avatar yoksa varsayılan resim
      successRate: editor.successRate || 75, // Başarı oranı yoksa varsayılan değer
      followers: Math.floor(Math.random() * 1000) + 500, // Şimdilik rastgele takipçi sayısı
      bio: editor.bio || 'Profesyonel bahis tahmincisi'
    }));

    return res.status(200).json({ editors: formattedEditors });
  } catch (error) {
    console.error('API: /api/editors - Sunucu hatası:', error);
    return res.status(500).json({
      message: 'Sunucu hatası',
      error: process.env.NODE_ENV !== 'production' ? String(error) : undefined
    });
  }
} 