import { prisma } from '../lib/prisma';

interface CreateBillInput {
  userId: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  isRecurring: boolean;
  frequency?: 'monthly' | 'yearly' | 'weekly';
  notes?: string;
  isManual: boolean;
}

interface CreateBillMetadataInput {
  userId: string;
  plaidBillId: string;
  notes?: string;
  customCategory?: string;
}

export class BillsRepository {
  async getUserBills(userId: string) {
    return prisma.bill.findMany({
      where: {
        userId,
        isManual: true,
      },
      orderBy: {
        dueDate: 'asc',
      },
    });
  }

  async create(data: CreateBillInput) {
    return prisma.bill.create({
      data: {
        userId: data.userId,
        name: data.name,
        amount: data.amount,
        dueDate: new Date(data.dueDate),
        category: data.category,
        isRecurring: data.isRecurring,
        frequency: data.frequency,
        notes: data.notes,
        isManual: true,
      },
    });
  }

  async createBillMetadata(data: CreateBillMetadataInput) {
    return prisma.billMetadata.upsert({
      where: {
        userId_plaidBillId: {
          userId: data.userId,
          plaidBillId: data.plaidBillId,
        },
      },
      update: {
        notes: data.notes,
        customCategory: data.customCategory,
      },
      create: {
        userId: data.userId,
        plaidBillId: data.plaidBillId,
        notes: data.notes,
        customCategory: data.customCategory,
      },
    });
  }

  async update(id: string, data: Partial<CreateBillInput>) {
    return prisma.bill.update({
      where: { id },
      data: {
        name: data.name,
        amount: data.amount,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        category: data.category,
        isRecurring: data.isRecurring,
        frequency: data.frequency,
        notes: data.notes,
      },
    });
  }

  async delete(id: string) {
    return prisma.bill.delete({
      where: { id },
    });
  }

  async markAsPaid(id: string) {
    const bill = await prisma.bill.findUnique({
      where: { id },
    });

    if (!bill) {
      throw new Error('Bill not found');
    }

    // Update last payment date and calculate next due date
    const lastPaymentDate = new Date();
    let nextDueDate = new Date(bill.dueDate);

    if (bill.isRecurring && bill.frequency) {
      switch (bill.frequency) {
        case 'weekly':
          nextDueDate.setDate(nextDueDate.getDate() + 7);
          break;
        case 'monthly':
          nextDueDate.setMonth(nextDueDate.getMonth() + 1);
          break;
        case 'yearly':
          nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
          break;
      }
    }

    return prisma.bill.update({
      where: { id },
      data: {
        lastPaymentDate,
        dueDate: nextDueDate,
        paymentHistory: {
          create: {
            amount: bill.amount,
            paymentDate: lastPaymentDate,
          },
        },
      },
    });
  }
} 