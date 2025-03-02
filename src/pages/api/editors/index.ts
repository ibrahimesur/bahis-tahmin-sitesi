import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

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

    const formattedEditors = editors.map(editor => ({
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