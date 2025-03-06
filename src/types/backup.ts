export interface BackupConfig {
  destination?: string;
  includeMetadata?: boolean;
  excludeTables?: string[];
  compressionLevel?: number;
} 