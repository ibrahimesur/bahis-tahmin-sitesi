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
  res.setHeader('Content-Type', 'application/json');

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
    console.log('Token doğrulandı:', { 
      userId: decodedToken.userId, 
      role: decodedToken.role 
    });
  } catch (error) {
    console.error('Token doğrulama hatası:', error);
    return res.status(401).json({ message: 'Geçersiz veya süresi dolmuş token' });
  }

  const userId = decodedToken.userId;
  const { id } = req.query;

  // Kullanıcı kendi profilini veya admin kullanıcı herhangi bir profili görüntüleyebilir
  if (userId !== id && decodedToken.role.toLowerCase() !== 'admin') {
    return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
  }

  try {
    // GET isteği - Kullanıcı bilgilerini getir
    if (req.method === 'GET') {
      console.log('Kullanıcı bilgileri getiriliyor:', { id });
      
      try {
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
          console.error('Kullanıcı bulunamadı:', { id });
          return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }

        console.log('Kullanıcı bilgileri başarıyla alındı:', { id, username: user.username });
        return res.status(200).json(user);
      } catch (dbError) {
        console.error('Kullanıcı bilgileri alınırken veritabanı hatası:', dbError);
        return res.status(500).json({ 
          message: 'Kullanıcı bilgileri alınırken veritabanı hatası oluştu',
          error: process.env.NODE_ENV === 'development' ? String(dbError) : undefined
        });
      }
    }
    
    // PUT isteği - Kullanıcı bilgilerini güncelle
    else if (req.method === 'PUT') {
      const { username, bio, currentPassword, newPassword } = req.body;
      console.log('Kullanıcı bilgileri güncelleniyor:', { id, username });
      
      try {
        // Kullanıcı adı kontrolü
        if (username) {
          try {
            const existingUser = await prisma.user.findFirst({
              where: {
                username,
                id: {
                  not: id as string
                }
              }
            });
            
            if (existingUser) {
              return res.status(400).json({ message: 'Bu kullanıcı adı zaten kullanılıyor' });
            }
          } catch (dbError) {
            console.error('Kullanıcı adı kontrolü sırasında veritabanı hatası:', dbError);
            return res.status(500).json({ 
              message: 'Kullanıcı adı kontrolü sırasında veritabanı hatası oluştu',
              error: process.env.NODE_ENV === 'development' ? String(dbError) : undefined
            });
          }
        }
        
        // Şifre değişikliği varsa
        if (currentPassword && newPassword) {
          try {
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
            
            console.log('Kullanıcı bilgileri ve şifre güncellendi:', { id, username: updatedUser.username });
            return res.status(200).json(updatedUser);
          } catch (dbError) {
            console.error('Şifre güncelleme sırasında veritabanı hatası:', dbError);
            return res.status(500).json({ 
              message: 'Şifre güncelleme sırasında veritabanı hatası oluştu',
              error: process.env.NODE_ENV === 'development' ? String(dbError) : undefined
            });
          }
        } 
        // Şifre değişikliği yoksa
        else {
          try {
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
            
            console.log('Kullanıcı bilgileri güncellendi:', { id, username: updatedUser.username });
            return res.status(200).json(updatedUser);
          } catch (dbError) {
            console.error('Kullanıcı bilgileri güncellenirken veritabanı hatası:', dbError);
            return res.status(500).json({ 
              message: 'Kullanıcı bilgileri güncellenirken veritabanı hatası oluştu',
              error: process.env.NODE_ENV === 'development' ? String(dbError) : undefined
            });
          }
        }
      } catch (error) {
        console.error('Kullanıcı güncelleme işlemi sırasında hata:', error);
        return res.status(500).json({ 
          message: 'Kullanıcı güncelleme işlemi sırasında hata oluştu',
          error: process.env.NODE_ENV === 'development' ? String(error) : undefined
        });
      }
    }
    
    // Desteklenmeyen HTTP metodu
    else {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('Kullanıcı işlemi sırasında hata:', error);
    return res.status(500).json({ 
      message: 'Sunucu hatası',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
} 