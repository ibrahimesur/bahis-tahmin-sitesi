import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import prisma from '../../../lib/prisma';
import { LoginFormData } from '../../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password }: LoginFormData = req.body;

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'E-posta veya şifre hatalı' });
    }

    // Şifreyi kontrol et
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ error: 'E-posta veya şifre hatalı' });
    }

    // Hassas bilgileri çıkar
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Giriş hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
} 