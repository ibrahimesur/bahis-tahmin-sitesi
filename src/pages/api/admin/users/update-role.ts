import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS için header ayarları
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // OPTIONS isteği için CORS yanıtı
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Sadece POST isteklerine izin ver
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
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

  try {
    // İstek yapan kullanıcının admin olup olmadığını kontrol et
    const adminUser = await prisma.user.findUnique({
      where: { id: decodedToken.userId }
    });

    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ message: 'Bu işlem için admin yetkisi gerekiyor' });
    }

    // İstek gövdesinden kullanıcı ID ve yeni rolü al
    const { userId, newRole } = req.body;

    if (!userId || !newRole) {
      return res.status(400).json({ message: 'Kullanıcı ID ve yeni rol zorunludur' });
    }

    // Geçerli rol değerlerini kontrol et
    if (!['user', 'editor', 'admin'].includes(newRole)) {
      return res.status(400).json({ message: 'Geçersiz rol. Geçerli değerler: user, editor, admin' });
    }

    // Kullanıcıyı bul
    const userToUpdate = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!userToUpdate) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Kullanıcı rolünü güncelle
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole }
    });

    // Hassas bilgileri çıkar
    const { password, ...userWithoutPassword } = updatedUser;

    return res.status(200).json({
      message: 'Kullanıcı rolü başarıyla güncellendi',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Kullanıcı rolü güncellenirken hata oluştu:', error);
    return res.status(500).json({
      message: 'Sunucu hatası',
      error: process.env.NODE_ENV !== 'production' ? String(error) : undefined
    });
  }
} 