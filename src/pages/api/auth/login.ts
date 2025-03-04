import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import prisma from '../../../lib/prisma';
import { LoginFormData } from '../../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // CORS başlıklarını ekle
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // OPTIONS isteği için erken yanıt
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // İstek gövdesini kontrol et
    if (!req.body) {
      return res.status(400).json({ error: 'İstek gövdesi boş' });
    }

    const { email, password }: LoginFormData = req.body;

    // Gerekli alanları kontrol et
    if (!email || !password) {
      return res.status(400).json({ error: 'E-posta ve şifre gerekli' });
    }

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

    // JSON yanıtı döndür
    res.status(200).json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Giriş hatası:', error);
    // Hata durumunda da JSON yanıtı döndür
    res.status(500).json({ error: 'Sunucu hatası', details: error instanceof Error ? error.message : 'Bilinmeyen hata' });
  }
} 