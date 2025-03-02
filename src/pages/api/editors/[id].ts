import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { getSession } from 'next-auth/react';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const session = await getSession({ req });

  try {
    const editor = await prisma.user.findUnique({
      where: { id: id as string },
      select: {
        id: true,
        username: true,
        avatar: true,
        bio: true,
        successRate: true,
        articles: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            content: true,
            image: true,
            category: true,
            createdAt: true,
            likes: true
          }
        },
        _count: true
      }
    });

    if (!editor) {
      return res.status(404).json({ error: 'Editör bulunamadı' });
    }

    // Kullanıcının editörü takip edip etmediğini kontrol et
    let isFollowing = null;
    
    if (session?.user?.email) {
      const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email }
      });
      
      if (currentUser) {
        isFollowing = await prisma.follows.findUnique({
          where: {
            followerId_followingId: {
              followerId: currentUser.id,
              followingId: id as string
            }
          }
        });
      }
    }

    res.status(200).json({
      ...editor,
      followers: editor._count?.articles || 0,
      isFollowing: !!isFollowing
    });
  } catch (error) {
    console.error('Editör detayı alınırken hata:', error);
    res.status(500).json({ error: 'Editör detayı alınamadı' });
  }
} 