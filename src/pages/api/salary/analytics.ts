import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { SalaryRepository } from '../../../models/SalaryRepository';
import { handleApiError } from '../../../utils/api';

const salaryRepo = new SalaryRepository();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = session.user.id;

    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const [currentSalary, salaryHistory, salaryGrowth] = await Promise.all([
      salaryRepo.getCurrentSalary(userId),
      salaryRepo.getSalaryHistory(userId),
      salaryRepo.getSalaryGrowth(userId),
    ]);

    // Calculate analytics
    const analytics = {
      currentSalary,
      salaryHistory,
      salaryGrowth,
      averageSalary: currentSalary?.position
        ? await salaryRepo.getAverageSalaryByPosition(currentSalary.position)
        : null,
      stats: {
        totalYTD: salaryHistory.reduce((sum, entry) => {
          const startYear = new Date(entry.start_date).getFullYear();
          const currentYear = new Date().getFullYear();
          if (startYear === currentYear) {
            return sum + entry.base_salary + entry.bonus + entry.stock_options + entry.other_benefits;
          }
          return sum;
        }, 0),
        monthlyAverage: currentSalary
          ? (currentSalary.base_salary + currentSalary.bonus + currentSalary.stock_options + currentSalary.other_benefits) / 12
          : 0,
        yearOverYearGrowth: salaryGrowth.length > 1
          ? ((salaryGrowth[salaryGrowth.length - 1].total_compensation - salaryGrowth[salaryGrowth.length - 2].total_compensation) /
              salaryGrowth[salaryGrowth.length - 2].total_compensation) * 100
          : 0,
      },
    };

    return res.status(200).json(analytics);
  } catch (error) {
    return handleApiError(error, res);
  }
} 