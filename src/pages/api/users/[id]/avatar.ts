import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';
import jwt from 'jsonwebtoken';
import formidable, { Fields, Files, File } from 'formidable';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// JWT token için tip tanımı
interface JwtPayload {
  userId: string;
  role: string;
  iat?: number;
  exp?: number;
}

// formidable için config
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS başlıkları
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // OPTIONS isteği için hızlı yanıt
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Sadece POST isteklerini işle
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
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

  // Kullanıcı kendi profilini veya admin kullanıcı herhangi bir profili güncelleyebilir
  if (userId !== id && decodedToken.role !== 'admin') {
    return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
  }

  try {
    // Dosya yükleme klasörünü oluştur
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Form verilerini parse et
    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 2 * 1024 * 1024, // 2MB
    });

    return new Promise((resolve, reject) => {
      form.parse(req, async (err: Error | null, fields: Fields, files: Files) => {
        if (err) {
          console.error('Dosya yükleme hatası:', err);
          res.status(500).json({ message: 'Dosya yüklenirken bir hata oluştu' });
          return resolve(true);
        }

        const avatarFile = files.avatar;
        if (!avatarFile) {
          res.status(400).json({ message: 'Geçerli bir dosya yüklenmedi' });
          return resolve(true);
        }

        // Tek bir dosya veya dosya dizisi kontrolü
        const file = Array.isArray(avatarFile) ? avatarFile[0] : avatarFile;

        // Dosya tipini kontrol et
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.mimetype || '')) {
          res.status(400).json({ message: 'Sadece JPEG, PNG ve GIF formatları desteklenmektedir' });
          return resolve(true);
        }

        // Dosyayı yeniden adlandır
        const fileExt = path.extname(file.originalFilename || '');
        const newFileName = `${uuidv4()}${fileExt}`;
        const newFilePath = path.join(uploadDir, newFileName);

        // Dosyayı taşı
        fs.renameSync(file.filepath, newFilePath);

        // Dosya URL'sini oluştur
        const fileUrl = `/uploads/${newFileName}`;

        // Kullanıcının avatar alanını güncelle
        await prisma.user.update({
          where: { id: id as string },
          data: { avatar: fileUrl }
        });

        res.status(200).json({ 
          message: 'Profil resmi başarıyla güncellendi',
          avatar: fileUrl
        });
        
        return resolve(true);
      });
    });
  } catch (error) {
    console.error('Avatar güncelleme hatası:', error);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
} 