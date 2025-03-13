import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { prisma } from '../../../lib/prisma';
import { z } from 'zod';

const timeFrameSchema = z.enum(['week', 'month', 'quarter', 'year', 'all']);

interface SessionUser {
  id: string;
  name?: string;
  email?: string;
  image?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });
  
  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const userId = (session.user as SessionUser).id;
  
  if (req.method === 'GET') {
    try {
      const accounts = await prisma.account.findMany({
        where: {
          userId,
          isHidden: false,
        },
        orderBy: {
          name: 'asc',
        },
      });
      
      return res.status(200).json(accounts);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      return res.status(500).json({ error: 'Failed to fetch accounts' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 