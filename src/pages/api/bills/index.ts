import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { z } from 'zod';
import PlaidService from '../../../services/plaidService';
import { BillsRepository } from '../../../models/BillsRepository';

const billSchema = z.object({
  name: z.string(),
  amount: z.number().positive(),
  dueDate: z.string(),
  category: z.string(),
  isRecurring: z.boolean(),
  frequency: z.enum(['monthly', 'yearly', 'weekly']).optional(),
  plaidAccountId: z.string().optional(),
  plaidBillId: z.string().optional(),
  isManual: z.boolean(),
  notes: z.string().optional(),
});

const billsRepo = new BillsRepository();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = session.user.id;

    switch (req.method) {
      case 'GET':
        // Get both Plaid and manual bills
        const [accounts, manualBills] = await Promise.all([
          PlaidService.getAccounts(userId),
          billsRepo.getUserBills(userId),
        ]);

        // Get transactions for each account
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30); // Last 30 days
        const endDate = new Date();

        const transactions = await Promise.all(
          accounts.map(() => PlaidService.getTransactions(
            userId,
            startDate.toISOString().split('T')[0],
            endDate.toISOString().split('T')[0]
          ))
        );

        // Transform transactions into bills
        const transformedPlaidBills = transactions.flat().map(transaction => ({
          id: transaction.id,
          name: transaction.description,
          amount: transaction.amount,
          dueDate: transaction.date,
          category: transaction.category[0] || 'Uncategorized',
          isRecurring: true,
          frequency: 'monthly',
          plaidAccountId: transaction.accountId,
          plaidBillId: transaction.id,
          isManual: false,
          status: transaction.pending ? 'pending' : 'posted',
          lastPaymentDate: transaction.date,
          nextPaymentDate: null,
        }));

        return res.status(200).json({
          bills: [...transformedPlaidBills, ...manualBills],
        });

      case 'POST':
        // Validate request body
        const validatedBill = billSchema.parse(req.body);

        // If it's a manual bill, save it to our database
        if (validatedBill.isManual) {
          const newBill = await billsRepo.create({
            ...validatedBill,
            userId,
          });
          return res.status(201).json(newBill);
        }

        // If it's a Plaid bill, we might want to add additional metadata or user customization
        if (validatedBill.plaidBillId) {
          const billMetadata = await billsRepo.createBillMetadata({
            userId,
            plaidBillId: validatedBill.plaidBillId,
            notes: validatedBill.notes,
            customCategory: validatedBill.category !== 'default' ? validatedBill.category : undefined,
          });
          return res.status(201).json(billMetadata);
        }

        return res.status(400).json({ error: 'Invalid bill type' });

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 