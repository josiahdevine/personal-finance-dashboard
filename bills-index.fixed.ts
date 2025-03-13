import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { z } from 'zod';
import { BillsRepository } from '../../../models/BillsRepository';

const billSchema = z.object({
  name: z.string(),
  amount: z.number().positive(),
  dueDate: z.string(),
  category: z.string(), // Required in CreateBillInput
  isRecurring: z.boolean().default(false),
  frequency: z.enum(['weekly', 'monthly', 'yearly']).optional(),
  notes: z.string().optional(),
  isManual: z.boolean().default(true),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });
  
  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Type assertion for session.user.id
  const userId = (session.user as any).id as string;
  const billsRepo = new BillsRepository();
  
  switch (req.method) {
    case 'GET':
      try {
        const bills = await billsRepo.getUserBills(userId);
        return res.status(200).json(bills);
      } catch (error) {
        console.error('Error fetching bills:', error);
        return res.status(500).json({ error: 'Failed to fetch bills' });
      }
      
    case 'POST':
      try {
        const billData = billSchema.parse(req.body);
        const newBill = await billsRepo.create({
          ...billData,
          userId,
        });
        return res.status(201).json(newBill);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ error: error.errors });
        }
        console.error('Error creating bill:', error);
        return res.status(500).json({ error: 'Failed to create bill' });
      }
      
    case 'PUT':
      try {
        const { id, ...billData } = req.body;
        if (!id) {
          return res.status(400).json({ error: 'Bill ID is required' });
        }
        
        // We don't have a getBillById method, so we'll just update directly
        const updatedBill = await billsRepo.update(id, billSchema.parse(billData));
        return res.status(200).json(updatedBill);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ error: error.errors });
        }
        console.error('Error updating bill:', error);
        return res.status(500).json({ error: 'Failed to update bill' });
      }
      
    case 'DELETE':
      try {
        const { id } = req.query;
        if (!id || Array.isArray(id)) {
          return res.status(400).json({ error: 'Valid bill ID is required' });
        }
        
        await billsRepo.delete(id);
        return res.status(204).end();
      } catch (error) {
        console.error('Error deleting bill:', error);
        return res.status(500).json({ error: 'Failed to delete bill' });
      }
      
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 