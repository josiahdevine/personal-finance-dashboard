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
    const { id } = req.query;

    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    // Verify ownership
    const entry = await salaryRepo.findById(id);
    if (!entry || entry.user_id !== userId) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    switch (req.method) {
      case 'GET':
        return res.status(200).json(entry);

      case 'PUT':
        const validatedUpdate = salaryEntrySchema.parse({
          ...req.body,
          user_id: userId,
        });
        const updatedEntry = await salaryRepo.update(id, validatedUpdate);
        return res.status(200).json(updatedEntry);

      case 'DELETE':
        await salaryRepo.delete(id);
        return res.status(204).end();

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    return handleApiError(error, res);
  }
} 