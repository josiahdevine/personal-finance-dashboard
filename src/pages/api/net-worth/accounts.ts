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

    // Fetch all accounts with their current and previous balances
    const accounts = await prisma.account.findMany({
      where: {
        userId: user.id,
      },
      include: {
        balanceHistory: {
          orderBy: {
            date: 'desc',
          },
          take: 2, // Get current and previous balance
        },
      },
    }) as ExtendedAccount[];

    // Transform the data to include balance changes
    const accountBalances = accounts.map((account: ExtendedAccount) => {
      const currentBalance = account.balanceHistory[0]?.balance || 0;
      const previousBalance = account.balanceHistory[1]?.balance || currentBalance;
      const change = currentBalance - previousBalance;
      const changePercentage = previousBalance !== 0 ? (change / previousBalance) * 100 : 0;

      return {
        type: account.type === AccountType.ASSET ? 'asset' : 'liability',
        name: account.name,
        balance: currentBalance,
        change,
        changePercentage,
      };
    });

    return res.status(200).json(accountBalances);
  } catch (error) {
    console.error('Error fetching account balances:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 