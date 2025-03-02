import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

// Basit bir editor tipi tanımlıyorum
interface Editor {
  id: string;
  username: string;
  avatar: string | null;
  bio: string | null;
  successRate: number | null;
  _count: {
    predictions: number;
    followers: number;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Tip ataması olmadan sorguyu çalıştırıyoruz
    const editors = await prisma.user.findMany({
      where: {
        role: 'editor'
      },
      select: {
        id: true,
        username: true,
        avatar: true,
        bio: true,
        successRate: true,
        _count: {
          select: {
            predictions: true,
            followers: true
          }
        }
      }
    });

    // any tipini kullanarak tip hatalarını geçici olarak çözüyoruz
    const formattedEditors = editors.map((editor: any) => ({
      id: editor.id,
      username: editor.username,
      avatar: editor.avatar,
      bio: editor.bio,
      successRate: editor.successRate || 0,
      articleCount: editor._count.predictions,
      followers: editor._count.followers
    }));

    res.status(200).json(formattedEditors);
  } catch (error) {
    console.error('Editörler yüklenirken hata:', error);
    res.status(500).json({ error: 'Editörler yüklenemedi' });
  }
} 