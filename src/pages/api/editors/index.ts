import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { Prisma } from '@prisma/client';

// Prisma'nın döndürdüğü tip için bir tip tanımı
type EditorResult = Prisma.UserGetPayload<{
  select: {
    id: true;
    username: true;
    avatar: true;
    bio: true;
    successRate: true;
    _count: {
      select: {
        predictions: true;
        followers: true;
      }
    }
  }
}>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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