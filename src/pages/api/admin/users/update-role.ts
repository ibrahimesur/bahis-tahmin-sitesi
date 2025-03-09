import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('API: /api/admin/users/update-role - İstek alındı', {
    method: req.method,
    body: req.body,
    headers: {
      authorization: req.headers.authorization ? 'Bearer ***' : 'Yok',
      'content-type': req.headers['content-type']
    }
  });

  // CORS için header ayarları
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // OPTIONS isteği için CORS yanıtı
  if (req.method === 'OPTIONS') {
    console.log('API: /api/admin/users/update-role - OPTIONS isteği yanıtlandı');
    res.status(200).end();
    return;
  }

  // Sadece POST isteklerine izin ver
  if (req.method !== 'POST') {
    console.log(`API: /api/admin/users/update-role - Desteklenmeyen metod: ${req.method}`);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Token doğrulama
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('API: /api/admin/users/update-role - Token bulunamadı');
    return res.status(401).json({ message: 'Yetkilendirme başarısız: Token bulunamadı' });
  }

  const token = authHeader.split(' ')[1];
  console.log('API: /api/admin/users/update-role - Token alındı', { tokenLength: token.length });
  
  let decodedToken;

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('API: /api/admin/users/update-role - JWT_SECRET bulunamadı');
      throw new Error('JWT_SECRET ortam değişkeni tanımlanmamış');
    }
    
    console.log('API: /api/admin/users/update-role - Token doğrulanıyor');
    decodedToken = jwt.verify(token, jwtSecret) as { userId: string };
    console.log('API: /api/admin/users/update-role - Token doğrulandı', { userId: decodedToken.userId });
  } catch (error) {
    console.error('API: /api/admin/users/update-role - Token doğrulama hatası', error);
    return res.status(401).json({ message: 'Yetkilendirme başarısız: Geçersiz token' });
  }

  try {
    // İstek yapan kullanıcının admin olup olmadığını kontrol et
    console.log('API: /api/admin/users/update-role - Admin kontrolü yapılıyor', { userId: decodedToken.userId });
    const adminUser = await prisma.user.findUnique({
      where: { id: decodedToken.userId }
    });

    if (!adminUser) {
      console.error('API: /api/admin/users/update-role - Kullanıcı bulunamadı');
      return res.status(403).json({ message: 'Kullanıcı bulunamadı' });
    }

    if (adminUser.role !== 'admin') {
      console.error('API: /api/admin/users/update-role - Yetkisiz erişim', { role: adminUser.role });
      return res.status(403).json({ message: 'Bu işlem için admin yetkisi gerekiyor' });
    }

    // İstek gövdesinden kullanıcı ID ve yeni rolü al
    const { userId, newRole } = req.body;
    console.log('API: /api/admin/users/update-role - İstek parametreleri', { userId, newRole });

    if (!userId || !newRole) {
      console.error('API: /api/admin/users/update-role - Eksik parametreler');
      return res.status(400).json({ message: 'Kullanıcı ID ve yeni rol zorunludur' });
    }

    // Geçerli rol değerlerini kontrol et
    if (!['user', 'editor', 'admin'].includes(newRole)) {
      console.error('API: /api/admin/users/update-role - Geçersiz rol', { newRole });
      return res.status(400).json({ message: 'Geçersiz rol. Geçerli değerler: user, editor, admin' });
    }

    // Kullanıcıyı bul
    console.log('API: /api/admin/users/update-role - Kullanıcı aranıyor', { userId });
    const userToUpdate = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!userToUpdate) {
      console.error('API: /api/admin/users/update-role - Güncellenecek kullanıcı bulunamadı');
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Kullanıcı rolünü güncelle
    console.log('API: /api/admin/users/update-role - Kullanıcı rolü güncelleniyor', { 
      userId, 
      oldRole: userToUpdate.role, 
      newRole 
    });
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole }
    });

    // Hassas bilgileri çıkar
    const { password, ...userWithoutPassword } = updatedUser;

    console.log('API: /api/admin/users/update-role - Kullanıcı rolü güncellendi', { 
      userId, 
      newRole: updatedUser.role 
    });
    
    return res.status(200).json({
      message: 'Kullanıcı rolü başarıyla güncellendi',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('API: /api/admin/users/update-role - Sunucu hatası:', error);
    return res.status(500).json({
      message: 'Sunucu hatası',
      error: process.env.NODE_ENV !== 'production' ? String(error) : undefined
    });
  }
} 