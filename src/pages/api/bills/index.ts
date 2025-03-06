import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { z } from 'zod';
import { PlaidService } from '../../../services/PlaidService';
import { BillsRepository } from '../../../models/BillsRepository';
import { handleApiError } from '../../../utils/api';

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
const plaidService = new PlaidService();

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
        const [plaidBills, manualBills] = await Promise.all([
          plaidService.getBills(userId),
          billsRepo.getUserBills(userId),
        ]);

        // Transform Plaid bills to match our format
        const transformedPlaidBills = plaidBills.map(bill => ({
          id: bill.bill_id,
          name: bill.name,
          amount: bill.amount,
          dueDate: bill.due_date,
          category: bill.category,
          isRecurring: true,
          frequency: 'monthly',
          plaidAccountId: bill.account_id,
          plaidBillId: bill.bill_id,
          isManual: false,
          status: bill.status,
          lastPaymentDate: bill.last_payment_date,
          nextPaymentDate: bill.next_payment_date,
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
    return handleApiError(error, res);
  }
} 