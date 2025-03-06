import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { prisma } from '../../../lib/prisma';
import { z } from 'zod';
import { Account, BalanceHistory, AccountType } from '@prisma/client';

const timeFrameSchema = z.enum(['week', 'month', 'quarter', 'year', 'all']);

interface SessionUser {
  id: string;
  email: string;
}

interface ExtendedAccount extends Omit<Account, 'type'> {
  type: AccountType;
  balanceHistory: BalanceHistory[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });
    const user = session?.user as SessionUser | undefined;
    
    if (!user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const timeFrame = timeFrameSchema.parse(req.query.timeFrame || 'month');
    
    // Calculate the start date based on the time frame
    const now = new Date();
    let startDate = new Date();
    switch (timeFrame) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        startDate = new Date(0); // Beginning of time
        break;
    }

    // Fetch all accounts and their balances for the user
    const accounts = await prisma.account.findMany({
      where: {
        userId: user.id,
      },
      include: {
        balanceHistory: {
          where: {
            date: {
              gte: startDate,
            },
          },
          orderBy: {
            date: 'asc',
          },
        },
      },
    }) as ExtendedAccount[];

    // Group balances by date and calculate totals
    const balancesByDate = new Map<string, { assets: number; liabilities: number }>();
    
    accounts.forEach((account: ExtendedAccount) => {
      account.balanceHistory.forEach((history: BalanceHistory) => {
        const dateKey = history.date.toISOString().split('T')[0];
        const current = balancesByDate.get(dateKey) || { assets: 0, liabilities: 0 };
        
        if (account.type === AccountType.ASSET) {
          current.assets += history.balance;
        } else {
          current.liabilities += history.balance;
        }
        
        balancesByDate.set(dateKey, current);
      });
    });

    // Convert to array and calculate net worth
    const netWorthHistory = Array.from(balancesByDate.entries())
      .map(([date, { assets, liabilities }]) => ({
        date,
        assets,
        liabilities,
        netWorth: assets - liabilities,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return res.status(200).json(netWorthHistory);
  } catch (error) {
    console.error('Error fetching net worth history:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 