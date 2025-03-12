import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { z } from 'zod';
import PlaidService, { PlaidTransaction } from '../../../services/plaidService';
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
          PlaidService.getAccounts(),
          billsRepo.getUserBills(userId),
        ]);

        // Get transactions for each account
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30); // Last 30 days
        const endDate = new Date();

        // Prepare the parameters for the transaction request
        const transactionParams = {
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          account_ids: accounts.map(account => account.plaid_account_id)
        };

        // Get all transactions in one call
        const transactionResponse = await PlaidService.getTransactions(transactionParams);

        // Transform transactions into bills
        const transformedPlaidBills = transactionResponse.transactions.map((transaction: PlaidTransaction) => ({
          id: transaction.plaid_transaction_id,
          name: transaction.name,
          amount: transaction.amount,
          dueDate: transaction.date,
          category: transaction.category || 'Uncategorized',
          isRecurring: true,
          frequency: 'monthly',
          plaidAccountId: transaction.account_id,
          plaidBillId: transaction.plaid_transaction_id,
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