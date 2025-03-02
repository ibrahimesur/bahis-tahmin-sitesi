import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import prisma from '../../../lib/prisma';
import { RegisterFormData } from '../../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, email, password }: RegisterFormData = req.body;

    if (!username || !email || !password) {
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

    res.status(201).json({
      message: 'Kayıt başarılı',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Kayıt hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata') });
  }
} 