import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';
import { getSession } from 'next-auth/react';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });
  const { id } = req.query;

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Oturum açmanız gerekiyor' });
  }

  try {
    if (req.method === 'POST') {
      // Takip et
      await prisma.follows.create({
        data: {
          followerId: session.user.id,
          followingId: id as string
        }
      });
      res.status(200).json({ message: 'Takip edildi' });
    } else if (req.method === 'DELETE') {
      // Takibi bırak
      await prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId: session.user.id,
            followingId: id as string
          }
        }
      });
      res.status(200).json({ message: 'Takip bırakıldı' });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Takip işlemi sırasında hata:', error);
    res.status(500).json({ error: 'İşlem başarısız' });
  }
} 