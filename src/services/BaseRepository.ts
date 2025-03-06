import { PrismaClient, Prisma } from '@prisma/client';

export interface IBaseRepository<T> {
  findAll(includeDeleted?: boolean): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(data: any): Promise<T>;
  update(id: string, data: any): Promise<T>;
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
  createMany(data: any[]): Promise<T[]>;
  updateMany(ids: string[], data: any): Promise<T[]>;
  deleteMany(ids: string[]): Promise<void>;
}

type PrismaModels = {
  [K in keyof PrismaClient]: PrismaClient[K] extends { create: any } ? K : never;
}[keyof PrismaClient];

interface TransactionOptions {
  maxRetries?: number;
  timeout?: number;
  isolationLevel?: Prisma.TransactionIsolationLevel;
}

export class BaseRepository<T> implements IBaseRepository<T> {
  protected prisma: PrismaClient;
  protected modelName: PrismaModels;

  constructor(prisma: PrismaClient, modelName: PrismaModels) {
    this.prisma = prisma;
    this.modelName = modelName;
  }

  protected handlePrismaError(error: any): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          throw new Error('Unique constraint violation');
        case 'P2025':
          throw new Error('Record not found');
        case 'P2003':
          throw new Error('Foreign key constraint violation');
        case 'P2034':
          throw new Error('Transaction timed out');
        case 'P2028':
          throw new Error('Transaction was rolled back');
        default:
          throw new Error(`Database error: ${error.message}`);
      }
    }
    throw error;
  }

  async withTransaction<R>(
    operation: (tx: Prisma.TransactionClient) => Promise<R>,
    options: TransactionOptions = {}
  ): Promise<R> {
    const {
      maxRetries = 3,
      timeout = 5000,
      isolationLevel = Prisma.TransactionIsolationLevel.Serializable
    } = options;

    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt < maxRetries) {
      try {
        return await this.prisma.$transaction(async (tx) => {
          const result = await Promise.race<R>([
            operation(tx),
            new Promise<R>((_, reject) => 
              setTimeout(() => reject(new Error('Transaction timeout')), timeout)
            )
          ]);
          return result;
        }, { isolationLevel });
      } catch (error) {
        lastError = error as Error;
        attempt++;

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          // Retry on deadlock or serialization failure
          if (['P2034', 'P2028'].includes(error.code)) {
            await new Promise(resolve => 
              setTimeout(resolve, Math.random() * 1000 * attempt)
            );
            continue;
          }
        }
        throw error;
      }
    }

    throw lastError || new Error('Transaction failed after max retries');
  }

  async findAll(includeDeleted = false): Promise<T[]> {
    try {
      return await (this.prisma[this.modelName] as any).findMany({
        where: includeDeleted ? {} : { deleted_at: null }
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findById(id: string): Promise<T | null> {
    try {
      return await (this.prisma[this.modelName] as any).findFirst({
        where: { id, deleted_at: null }
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async create(data: any): Promise<T> {
    return this.withTransaction(async (tx) => {
      return await (tx[this.modelName] as any).create({
        data: {
          ...data,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
    });
  }

  async createMany(data: any[]): Promise<T[]> {
    return this.withTransaction(async (tx) => {
      const timestamp = new Date();
      const createdItems = await (tx[this.modelName] as any).createMany({
        data: data.map(item => ({
          ...item,
          created_at: timestamp,
          updated_at: timestamp
        }))
      });
      return createdItems;
    });
  }

  async update(id: string, data: any): Promise<T> {
    return this.withTransaction(async (tx) => {
      const existing = await (tx[this.modelName] as any).findFirst({
        where: { id, deleted_at: null }
      });

      if (!existing) {
        throw new Error('Record not found');
      }

      return await (tx[this.modelName] as any).update({
        where: { id },
        data: {
          ...data,
          updated_at: new Date()
        }
      });
    });
  }

  async updateMany(ids: string[], data: any): Promise<T[]> {
    return this.withTransaction(async (tx) => {
      const timestamp = new Date();
      const updatedItems = await (tx[this.modelName] as any).updateMany({
        where: { id: { in: ids }, deleted_at: null },
        data: {
          ...data,
          updated_at: timestamp
        }
      });
      return updatedItems;
    });
  }

  async softDelete(id: string): Promise<void> {
    return this.withTransaction(async (tx) => {
      const existing = await (tx[this.modelName] as any).findFirst({
        where: { id, deleted_at: null }
      });

      if (!existing) {
        throw new Error('Record not found');
      }

      await (tx[this.modelName] as any).update({
        where: { id },
        data: { deleted_at: new Date() }
      });
    });
  }

  async deleteMany(ids: string[]): Promise<void> {
    return this.withTransaction(async (tx) => {
      await (tx[this.modelName] as any).updateMany({
        where: { id: { in: ids }, deleted_at: null },
        data: { deleted_at: new Date() }
      });
    });
  }

  async restore(id: string): Promise<void> {
    return this.withTransaction(async (tx) => {
      const existing = await (tx[this.modelName] as any).findFirst({
        where: { id }
      });

      if (!existing) {
        throw new Error('Record not found');
      }

      await (tx[this.modelName] as any).update({
        where: { id },
        data: { deleted_at: null }
      });
    });
  }
} 