import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('API: /api/editors/is-following - İstek alındı', {
    method: req.method,
    query: req.query
  });

  // CORS için header ayarları
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // OPTIONS isteği için CORS yanıtı
  if (req.method === 'OPTIONS') {
    console.log('API: /api/editors/is-following - OPTIONS isteği yanıtlandı');
    res.status(200).end();
    return;
  }

  // Sadece GET isteklerine izin ver
  if (req.method !== 'GET') {
    console.log(`API: /api/editors/is-following - Desteklenmeyen metod: ${req.method}`);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Token doğrulama
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('API: /api/editors/is-following - Token bulunamadı');
    return res.status(401).json({ message: 'Yetkilendirme başarısız: Token bulunamadı' });
  }

  const token = authHeader.split(' ')[1];
  console.log('API: /api/editors/is-following - Token alındı', { tokenLength: token.length });
  
  let decodedToken;

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('API: /api/editors/is-following - JWT_SECRET bulunamadı');
      throw new Error('JWT_SECRET ortam değişkeni tanımlanmamış');
    }
    
    console.log('API: /api/editors/is-following - Token doğrulanıyor');
    decodedToken = jwt.verify(token, jwtSecret) as { userId: string };
    console.log('API: /api/editors/is-following - Token doğrulandı', { userId: decodedToken.userId });
  } catch (error) {
    console.error('API: /api/editors/is-following - Token doğrulama hatası', error);
    return res.status(401).json({ message: 'Yetkilendirme başarısız: Geçersiz token' });
  }

  try {
    // Query parametresinden editör ID'sini al
    const editorId = req.query.editorId as string;
    
    if (!editorId) {
      console.error('API: /api/editors/is-following - Editör ID bulunamadı');
      return res.status(400).json({ message: 'Editör ID zorunludur' });
    }

    // Takip durumunu kontrol et
    const follow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: decodedToken.userId,
          followingId: editorId
        }
      }
    });

    console.log('API: /api/editors/is-following - Takip durumu kontrol edildi', { 
      userId: decodedToken.userId, 
      editorId, 
      isFollowing: !!follow 
    });

    return res.status(200).json({ 
      isFollowing: !!follow 
    });
  } catch (error) {
    console.error('API: /api/editors/is-following - Sunucu hatası:', error);
    return res.status(500).json({
      message: 'Sunucu hatası',
      error: process.env.NODE_ENV !== 'production' ? String(error) : undefined
    });
  }
} 