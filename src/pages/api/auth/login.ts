import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import prisma from '../../../lib/prisma';
import { LoginFormData } from '../../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('Giriş API isteği alındı:', req.method);
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Tanımlı' : 'Tanımlı değil');
  
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
    return res.status(200).json({ message: 'CORS OK' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // İstek gövdesini kontrol et
    console.log('İstek gövdesi:', req.body ? 'Mevcut' : 'Boş');
    
    if (!req.body) {
      return res.status(400).json({ error: 'İstek gövdesi boş' });
    }

    const { email, password }: LoginFormData = req.body;
    console.log('Giriş denemesi:', email);

    // Gerekli alanları kontrol et
    if (!email || !password) {
      return res.status(400).json({ error: 'E-posta ve şifre gerekli' });
    }

    // Veritabanı bağlantısını kontrol et
    try {
      await prisma.$connect();
      console.log('Veritabanı bağlantısı başarılı');
    } catch (dbError) {
      console.error('Veritabanı bağlantı hatası:', dbError);
      return res.status(500).json({ 
        error: 'Veritabanı bağlantı hatası', 
        details: dbError instanceof Error ? dbError.message : 'Bilinmeyen hata' 
      });
    }

    // Kullanıcıyı bul
    console.log('Kullanıcı aranıyor:', email);
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('Kullanıcı bulunamadı:', email);
      return res.status(401).json({ error: 'E-posta veya şifre hatalı' });
    }

    console.log('Kullanıcı bulundu, şifre kontrol ediliyor');
    // Şifreyi kontrol et
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      console.log('Şifre hatalı');
      return res.status(401).json({ error: 'E-posta veya şifre hatalı' });
    }

    console.log('Giriş başarılı:', user.username);
    // Hassas bilgileri çıkar
    const { password: _, ...userWithoutPassword } = user;

    // JSON yanıtı döndür
    res.status(200).json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Giriş hatası:', error);
    // Hata durumunda da JSON yanıtı döndür
    res.status(500).json({ 
      error: 'Sunucu hatası', 
      details: error instanceof Error ? error.message : 'Bilinmeyen hata',
      stack: error instanceof Error ? error.stack : undefined
    });
  } finally {
    // Veritabanı bağlantısını kapat
    try {
      await prisma.$disconnect();
      console.log('Veritabanı bağlantısı kapatıldı');
    } catch (disconnectError) {
      console.error('Veritabanı bağlantısı kapatılırken hata:', disconnectError);
    }
  }
} 