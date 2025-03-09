import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('API: /api/editors/follow - İstek alındı', {
    method: req.method,
    body: req.body
  });

  // CORS için header ayarları
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // OPTIONS isteği için CORS yanıtı
  if (req.method === 'OPTIONS') {
    console.log('API: /api/editors/follow - OPTIONS isteği yanıtlandı');
    res.status(200).end();
    return;
  }

  // Sadece POST (takip et) ve DELETE (takibi bırak) isteklerine izin ver
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    console.log(`API: /api/editors/follow - Desteklenmeyen metod: ${req.method}`);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Token doğrulama
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('API: /api/editors/follow - Token bulunamadı');
    return res.status(401).json({ message: 'Yetkilendirme başarısız: Token bulunamadı' });
  }

  const token = authHeader.split(' ')[1];
  console.log('API: /api/editors/follow - Token alındı', { tokenLength: token.length });
  
  let decodedToken;

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('API: /api/editors/follow - JWT_SECRET bulunamadı');
      throw new Error('JWT_SECRET ortam değişkeni tanımlanmamış');
    }
    
    console.log('API: /api/editors/follow - Token doğrulanıyor');
    decodedToken = jwt.verify(token, jwtSecret) as { userId: string };
    console.log('API: /api/editors/follow - Token doğrulandı', { userId: decodedToken.userId });
  } catch (error) {
    console.error('API: /api/editors/follow - Token doğrulama hatası', error);
    return res.status(401).json({ message: 'Yetkilendirme başarısız: Geçersiz token' });
  }

  try {
    // İstek gövdesinden editör ID'sini al
    const { editorId } = req.body;
    
    if (!editorId) {
      console.error('API: /api/editors/follow - Editör ID bulunamadı');
      return res.status(400).json({ message: 'Editör ID zorunludur' });
    }

    // Kullanıcı ve editörün varlığını kontrol et
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.userId }
    });

    if (!user) {
      console.error('API: /api/editors/follow - Kullanıcı bulunamadı');
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    const editor = await prisma.user.findUnique({
      where: { 
        id: editorId,
        role: 'editor'
      }
    });

    if (!editor) {
      console.error('API: /api/editors/follow - Editör bulunamadı');
      return res.status(404).json({ message: 'Editör bulunamadı' });
    }

    // Kendini takip etmeyi engelle
    if (user.id === editor.id) {
      console.error('API: /api/editors/follow - Kendini takip etme denemesi');
      return res.status(400).json({ message: 'Kendinizi takip edemezsiniz' });
    }

    // Mevcut takip durumunu kontrol et
    const existingFollow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId: editor.id
        }
      }
    });

    // POST isteği: Takip et
    if (req.method === 'POST') {
      // Zaten takip ediyorsa hata döndürme
      if (existingFollow) {
        console.log('API: /api/editors/follow - Zaten takip ediliyor');
        return res.status(200).json({ 
          message: 'Bu editörü zaten takip ediyorsunuz',
          isFollowing: true
        });
      }

      // Takip kaydı oluştur
      await prisma.follows.create({
        data: {
          followerId: user.id,
          followingId: editor.id
        }
      });

      console.log('API: /api/editors/follow - Takip başarılı', { 
        userId: user.id, 
        editorId: editor.id 
      });
      
      return res.status(201).json({ 
        message: 'Editör başarıyla takip edildi',
        isFollowing: true
      });
    }
    
    // DELETE isteği: Takibi bırak
    if (req.method === 'DELETE') {
      // Takip etmiyorsa hata döndürme
      if (!existingFollow) {
        console.log('API: /api/editors/follow - Takip edilmiyor');
        return res.status(200).json({ 
          message: 'Bu editörü takip etmiyorsunuz',
          isFollowing: false
        });
      }

      // Takip kaydını sil
      await prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId: user.id,
            followingId: editor.id
          }
        }
      });

      console.log('API: /api/editors/follow - Takipten çıkma başarılı', { 
        userId: user.id, 
        editorId: editor.id 
      });
      
      return res.status(200).json({ 
        message: 'Editör takibi başarıyla bırakıldı',
        isFollowing: false
      });
    }
  } catch (error) {
    console.error('API: /api/editors/follow - Sunucu hatası:', error);
    return res.status(500).json({
      message: 'Sunucu hatası',
      error: process.env.NODE_ENV !== 'production' ? String(error) : undefined
    });
  }
} 