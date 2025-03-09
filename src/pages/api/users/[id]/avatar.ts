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
  res.setHeader('Content-Type', 'application/json');

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

  // Kullanıcı kendi profilini veya admin kullanıcı herhangi bir profili güncelleyebilir
  if (userId !== id && decodedToken.role.toLowerCase() !== 'admin') {
    console.error('Yetkisiz erişim:', { userId, targetId: id, role: decodedToken.role });
    return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
  }

  try {
    console.log('Profil resmi yükleme işlemi başlatılıyor:', { userId, targetId: id });
    
    // Dosya yükleme klasörünü oluştur
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      try {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log('Yükleme dizini oluşturuldu:', uploadDir);
      } catch (fsError) {
        console.error('Yükleme dizini oluşturulurken hata:', fsError);
        return res.status(500).json({ 
          message: 'Dosya yükleme dizini oluşturulamadı',
          error: process.env.NODE_ENV === 'development' ? String(fsError) : undefined
        });
      }
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
          res.status(500).json({ 
            message: 'Dosya yüklenirken bir hata oluştu',
            error: process.env.NODE_ENV === 'development' ? String(err) : undefined
          });
          return resolve(true);
        }

        const avatarFile = files.avatar;
        if (!avatarFile) {
          console.error('Geçerli bir dosya yüklenmedi');
          res.status(400).json({ message: 'Geçerli bir dosya yüklenmedi' });
          return resolve(true);
        }

        // Tek bir dosya veya dosya dizisi kontrolü
        const file = Array.isArray(avatarFile) ? avatarFile[0] : avatarFile;
        console.log('Dosya alındı:', { 
          filename: file.originalFilename,
          size: file.size,
          type: file.mimetype
        });

        // Dosya tipini kontrol et
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.mimetype || '')) {
          console.error('Desteklenmeyen dosya tipi:', file.mimetype);
          res.status(400).json({ message: 'Sadece JPEG, PNG ve GIF formatları desteklenmektedir' });
          return resolve(true);
        }

        try {
          // Dosyayı yeniden adlandır
          const fileExt = path.extname(file.originalFilename || '');
          const newFileName = `${uuidv4()}${fileExt}`;
          const newFilePath = path.join(uploadDir, newFileName);

          // Dosyayı taşı
          fs.renameSync(file.filepath, newFilePath);
          console.log('Dosya yeniden adlandırıldı:', { 
            oldPath: file.filepath,
            newPath: newFilePath
          });

          // Dosya URL'sini oluştur
          const fileUrl = `/uploads/${newFileName}`;

          try {
            // Kullanıcının avatar alanını güncelle
            await prisma.user.update({
              where: { id: id as string },
              data: { avatar: fileUrl }
            });
            
            console.log('Profil resmi başarıyla güncellendi:', { 
              userId: id,
              avatarUrl: fileUrl
            });

            res.status(200).json({ 
              message: 'Profil resmi başarıyla güncellendi',
              avatar: fileUrl
            });
          } catch (dbError) {
            console.error('Veritabanı güncelleme hatası:', dbError);
            res.status(500).json({ 
              message: 'Profil resmi veritabanında güncellenirken hata oluştu',
              error: process.env.NODE_ENV === 'development' ? String(dbError) : undefined
            });
          }
        } catch (fsError) {
          console.error('Dosya işleme hatası:', fsError);
          res.status(500).json({ 
            message: 'Dosya işlenirken bir hata oluştu',
            error: process.env.NODE_ENV === 'development' ? String(fsError) : undefined
          });
        }
        
        return resolve(true);
      });
    });
  } catch (error) {
    console.error('Avatar güncelleme hatası:', error);
    return res.status(500).json({ 
      message: 'Sunucu hatası',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
} 