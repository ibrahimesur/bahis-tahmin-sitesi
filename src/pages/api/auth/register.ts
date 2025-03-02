import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import prisma from '../../../lib/prisma';
import { RegisterFormData } from '../../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // CORS başlıklarını ekle
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  // Content-Type başlığını ayarla
  res.setHeader('Content-Type', 'application/json');

  // OPTIONS isteği için hemen yanıt ver
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Gelen istek gövdesi:', req.body);
    
    // İstek gövdesi boş ise
    if (!req.body || Object.keys(req.body).length === 0) {
      console.error('İstek gövdesi boş veya geçersiz');
      return res.status(400).json({ error: 'Geçersiz istek gövdesi' });
    }
    
    const { username, email, password }: RegisterFormData = req.body;

    if (!username || !email || !password) {
      console.log('Eksik alanlar:', { username: !!username, email: !!email, password: !!password });
      return res.status(400).json({
        error: 'Kullanıcı adı, email ve şifre gereklidir'
      });
    }

    console.log('Kayıt isteği alındı:', { username, email });

    // E-posta ve kullanıcı adı kontrolü
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      console.log('Kullanıcı zaten var:', existingUser.email);
      return res.status(400).json({
        error: 'Bu e-posta veya kullanıcı adı zaten kullanılıyor'
      });
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Kullanıcıyı oluştur
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        membershipType: 'free'
      }
    });

    // Hassas bilgileri çıkar
    const { password: _, ...userWithoutPassword } = user;

    console.log('Kullanıcı başarıyla oluşturuldu:', userWithoutPassword.id);

    // Yanıt gönder
    const response = {
      message: 'Kayıt başarılı',
      user: userWithoutPassword
    };
    
    console.log('Gönderilen yanıt:', response);
    return res.status(201).json(response);
  } catch (error) {
    console.error('Kayıt hatası:', error);
    return res.status(500).json({ error: 'Sunucu hatası: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata') });
  }
} 