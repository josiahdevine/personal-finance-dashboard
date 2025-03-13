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

// Define types for the balance history records
interface BalanceHistoryRecord {
  date: Date;
  balance: number;
  account: {
    id: string;
    name: string;
    type: string;
  };
}

// Define type for the net worth data
interface NetWorthData {
  date: string;
  netWorth: number;
  assets: number;
  liabilities: number;
  accounts: Record<string, {
    id: string;
    name: string;
    type: string;
    balance: number;
  }>;
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
      const { timeFrame = 'month' } = req.query;
      
      // Validate time frame
      const parsedTimeFrame = timeFrameSchema.safeParse(timeFrame);
      if (!parsedTimeFrame.success) {
        return res.status(400).json({ error: 'Invalid time frame' });
      }
      
      // Calculate date range based on time frame
      const endDate = new Date();
      const startDate = new Date();
      
      switch (parsedTimeFrame.data) {
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        case 'all':
          // No need to adjust startDate for 'all'
          startDate.setFullYear(2000); // Just set a very old date
          break;
      }
      
      // Get balance history for the user's accounts
      const balanceHistory = await prisma.balanceHistory.findMany({
        where: {
          account: {
            userId,
            isHidden: false,
          },
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          account: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
        orderBy: {
          date: 'asc',
        },
      });
      
      // Group by date and calculate net worth
      const netWorthByDate = balanceHistory.reduce((acc: Record<string, NetWorthData>, record: BalanceHistoryRecord) => {
        const dateStr = record.date.toISOString().split('T')[0];
        
        if (!acc[dateStr]) {
          acc[dateStr] = {
            date: dateStr,
            netWorth: 0,
            assets: 0,
            liabilities: 0,
            accounts: {},
          };
        }
        
        // Add balance to the appropriate category
        const isLiability = record.account.type === 'CREDIT_CARD' || 
                           record.account.type === 'LOAN' || 
                           record.account.type === 'MORTGAGE';
        
        const balance = isLiability ? -record.balance : record.balance;
        
        acc[dateStr].accounts[record.account.id] = {
          id: record.account.id,
          name: record.account.name,
          type: record.account.type,
          balance: record.balance,
        };
        
        if (isLiability) {
          acc[dateStr].liabilities += record.balance;
        } else {
          acc[dateStr].assets += record.balance;
        }
        
        acc[dateStr].netWorth += balance;
        
        return acc;
      }, {});
      
      // Convert to array and sort by date
      const result = Object.values(netWorthByDate).sort((a, b) => {
        // Type assertion to handle the unknown type from Object.values
        const dateA = (a as NetWorthData).date;
        const dateB = (b as NetWorthData).date;
        return new Date(dateA).getTime() - new Date(dateB).getTime();
      });
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error fetching net worth history:', error);
      return res.status(500).json({ error: 'Failed to fetch net worth history' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 