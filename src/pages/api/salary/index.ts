import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { SalaryRepository } from '../../../models/SalaryRepository';
import { salaryEntrySchema } from '../../../utils/validation';
import { handleApiError } from '../../../utils/api';

const salaryRepo = new SalaryRepository();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = session.user.id;

    switch (req.method) {
      case 'GET':
        const entries = await salaryRepo.getSalaryHistory(userId);
        return res.status(200).json(entries);

      case 'POST':
        const validatedEntry = salaryEntrySchema.parse({
          ...req.body,
          user_id: userId,
        });
        const newEntry = await salaryRepo.create(validatedEntry);
        return res.status(201).json(newEntry);

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    return handleApiError(error, res);
  }
} 