import { PrismaClient } from '@prisma/client';
import { BackupConfig } from '../types/backup';

export class BackupService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async createBackup(config: BackupConfig): Promise<Record<string, any[]>> {
    const tables = await this.prisma.$queryRaw`
      SELECT tablename 
      FROM pg_catalog.pg_tables 
      WHERE schemaname = 'public'
      ${config.excludeTables?.length ? 'AND tablename NOT IN (${config.excludeTables})' : ''}
    `;

    const tableNames = (tables as { tablename: string }[]).map(t => t.tablename);
    const backup: Record<string, any[]> = {};
    
    for (const tableName of tableNames) {
      const model = this.prisma[tableName as keyof PrismaClient];
      if (typeof model === 'object' && 'findMany' in model) {
        backup[tableName] = await (model as any).findMany();
      }
    }

    return backup;
  }

  async restoreBackup(data: Record<string, any[]>): Promise<void> {
    for (const [table, records] of Object.entries(data)) {
      const model = this.prisma[table as keyof PrismaClient];
      if (typeof model === 'object' && 'createMany' in model) {
        await (model as any).createMany({
          data: records,
          skipDuplicates: true
        });
      }
    }
  }
} 