import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // OPTIONS isteği için hızlı yanıt
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Token doğrulama
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Yetkilendirme başarısız' });
  }

  const token = authHeader.split(' ')[1];
  let decodedToken: JwtPayload;

  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as JwtPayload;
  } catch (error) {
    console.error('Token doğrulama hatası:', error);
    return res.status(401).json({ message: 'Geçersiz veya süresi dolmuş token' });
  }

  const userId = decodedToken.userId;
  const { id } = req.query;

  // Kullanıcı kendi profilini veya admin kullanıcı herhangi bir profili görüntüleyebilir
  if (userId !== id && decodedToken.role !== 'admin') {
    return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
  }

  try {
    // GET isteği - Kullanıcı bilgilerini getir
    if (req.method === 'GET') {
      const user = await prisma.user.findUnique({
        where: { id: id as string },
        select: {
          id: true,
          username: true,
          email: true,
          avatar: true,
          bio: true,
          role: true,
          membershipType: true,
          membershipExpiry: true,
          createdAt: true,
          _count: {
            select: {
              followers: true,
              following: true,
              predictions: true,
              articles: true,
            }
          }
        }
      });

      if (!user) {
        return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
      }

      return res.status(200).json(user);
    }
    
    // PUT isteği - Kullanıcı bilgilerini güncelle
    else if (req.method === 'PUT') {
      const { username, bio, currentPassword, newPassword } = req.body;
      
      // Kullanıcı adı kontrolü
      if (username) {
        const existingUser = await prisma.user.findUnique({
          where: {
            username,
            NOT: {
              id: id as string
            }
          }
        });
        
        if (existingUser) {
          return res.status(400).json({ message: 'Bu kullanıcı adı zaten kullanılıyor' });
        }
      }
      
      // Şifre değişikliği varsa
      if (currentPassword && newPassword) {
        // Mevcut kullanıcıyı ve şifresini al
        const user = await prisma.user.findUnique({
          where: { id: id as string },
          select: { password: true }
        });
        
        if (!user) {
          return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }
        
        // Mevcut şifreyi kontrol et
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
          return res.status(400).json({ message: 'Mevcut şifre yanlış' });
        }
        
        // Yeni şifreyi hashle
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Kullanıcıyı güncelle
        const updatedUser = await prisma.user.update({
          where: { id: id as string },
          data: {
            username,
            bio,
            password: hashedPassword
          },
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
            bio: true,
            role: true,
            membershipType: true,
            membershipExpiry: true
          }
        });
        
        return res.status(200).json(updatedUser);
      } 
      // Şifre değişikliği yoksa
      else {
        // Kullanıcıyı güncelle
        const updatedUser = await prisma.user.update({
          where: { id: id as string },
          data: {
            username,
            bio
          },
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
            bio: true,
            role: true,
            membershipType: true,
            membershipExpiry: true
          }
        });
        
        return res.status(200).json(updatedUser);
      }
    }
    
    // Desteklenmeyen HTTP metodu
    else {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('Kullanıcı işlemi sırasında hata:', error);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
} 