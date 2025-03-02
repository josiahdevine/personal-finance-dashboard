/**
 * Database Backup Utility for Neon Tech PostgreSQL
 * This module provides functions to backup and restore database data
 */

const { query } = require('./db-connector');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  backupDir: process.env.BACKUP_DIR || './backups',
  maxBackups: 10,
  tables: [
    'users',
    'salary_entries',
    'financial_goals',
    'plaid_accounts',
    'plaid_transactions'
  ]
};

/**
 * Create a backup of specified tables
 * @param {Array} tables - List of tables to backup (defaults to all tables in config)
 * @returns {Promise<Object>} Backup result with filename and stats
 */
async function createBackup(tables = config.tables) {
  try {
    // Create backup directory if it doesn't exist
    if (!fs.existsSync(config.backupDir)) {
      fs.mkdirSync(config.backupDir, { recursive: true });
    }
    
    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilename = `neon-backup-${timestamp}.json`;
    const backupPath = path.join(config.backupDir, backupFilename);
    
    // Initialize backup data structure
    const backupData = {
      metadata: {
        timestamp: new Date().toISOString(),
        tables: tables,
        version: '1.0'
      },
      tables: {}
    };
    
    // Backup each table
    for (const table of tables) {
      console.log(`Backing up table: ${table}`);
      
      // Get table data
      const result = await query(`SELECT * FROM ${table}`);
      
      // Add table data to backup
      backupData.tables[table] = {
        rows: result.rows,
        count: result.rowCount
      };
      
      console.log(`Backed up ${result.rowCount} rows from ${table}`);
    }
    
    // Write backup to file
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
    
    // Clean up old backups if needed
    cleanupOldBackups();
    
    return {
      success: true,
      filename: backupFilename,
      path: backupPath,
      tables: tables,
      counts: Object.keys(backupData.tables).reduce((acc, table) => {
        acc[table] = backupData.tables[table].count;
        return acc;
      }, {}),
      timestamp: backupData.metadata.timestamp
    };
  } catch (error) {
    console.error('Error creating database backup:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Restore data from a backup file
 * @param {string} backupFilename - Name of the backup file to restore
 * @param {Array} tables - List of tables to restore (defaults to all tables in backup)
 * @returns {Promise<Object>} Restore result with stats
 */
async function restoreBackup(backupFilename, tables = null) {
  try {
    const backupPath = path.join(config.backupDir, backupFilename);
    
    // Check if backup file exists
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup file not found: ${backupFilename}`);
    }
    
    // Read backup file
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    
    // Validate backup format
    if (!backupData.metadata || !backupData.tables) {
      throw new Error('Invalid backup format');
    }
    
    // Determine which tables to restore
    const tablesToRestore = tables || Object.keys(backupData.tables);
    
    // Track restore statistics
    const stats = {
      tables: {},
      totalRowsRestored: 0
    };
    
    // Restore each table
    for (const table of tablesToRestore) {
      // Skip if table not in backup
      if (!backupData.tables[table]) {
        console.log(`Table ${table} not found in backup, skipping`);
        stats.tables[table] = { skipped: true };
        continue;
      }
      
      console.log(`Restoring table: ${table}`);
      const tableData = backupData.tables[table];
      
      // Skip if no rows to restore
      if (!tableData.rows || tableData.rows.length === 0) {
        console.log(`No rows to restore for table ${table}`);
        stats.tables[table] = { rowsRestored: 0 };
        continue;
      }
      
      // Get column names from first row
      const columns = Object.keys(tableData.rows[0]);
      
      // Track rows restored for this table
      let rowsRestored = 0;
      
      // Restore each row
      for (const row of tableData.rows) {
        // Build INSERT query with ON CONFLICT DO UPDATE
        const columnList = columns.join(', ');
        const valuePlaceholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        const updateSet = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');
        
        // Determine primary key (assuming 'id' is primary key)
        const primaryKey = 'id';
        
        const query = `
          INSERT INTO ${table} (${columnList})
          VALUES (${valuePlaceholders})
          ON CONFLICT (${primaryKey}) DO UPDATE
          SET ${updateSet}
        `;
        
        // Extract values in order
        const values = columns.map(col => row[col]);
        
        // Execute query
        await query(query, values);
        rowsRestored++;
      }
      
      console.log(`Restored ${rowsRestored} rows to ${table}`);
      stats.tables[table] = { rowsRestored };
      stats.totalRowsRestored += rowsRestored;
    }
    
    return {
      success: true,
      filename: backupFilename,
      stats
    };
  } catch (error) {
    console.error('Error restoring database backup:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * List available backups
 * @returns {Array} List of backup files with metadata
 */
function listBackups() {
  try {
    // Create backup directory if it doesn't exist
    if (!fs.existsSync(config.backupDir)) {
      fs.mkdirSync(config.backupDir, { recursive: true });
      return [];
    }
    
    // Get list of backup files
    const files = fs.readdirSync(config.backupDir)
      .filter(file => file.startsWith('neon-backup-') && file.endsWith('.json'));
    
    // Get metadata for each backup
    return files.map(file => {
      try {
        const backupPath = path.join(config.backupDir, file);
        const stats = fs.statSync(backupPath);
        
        // Try to read metadata from backup file
        let metadata = { tables: [] };
        try {
          const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
          metadata = backupData.metadata || metadata;
        } catch (e) {
          console.error(`Error reading metadata from backup ${file}:`, e);
        }
        
        return {
          filename: file,
          size: stats.size,
          created: stats.mtime,
          tables: metadata.tables,
          version: metadata.version
        };
      } catch (e) {
        console.error(`Error processing backup file ${file}:`, e);
        return {
          filename: file,
          error: e.message
        };
      }
    }).sort((a, b) => {
      // Sort by creation date (newest first)
      return new Date(b.created) - new Date(a.created);
    });
  } catch (error) {
    console.error('Error listing backups:', error);
    return [];
  }
}

/**
 * Clean up old backups, keeping only the most recent ones
 */
function cleanupOldBackups() {
  try {
    const backups = listBackups();
    
    // If we have more backups than the maximum allowed, delete the oldest ones
    if (backups.length > config.maxBackups) {
      const backupsToDelete = backups.slice(config.maxBackups);
      
      for (const backup of backupsToDelete) {
        const backupPath = path.join(config.backupDir, backup.filename);
        fs.unlinkSync(backupPath);
        console.log(`Deleted old backup: ${backup.filename}`);
      }
    }
  } catch (error) {
    console.error('Error cleaning up old backups:', error);
  }
}

module.exports = {
  createBackup,
  restoreBackup,
  listBackups
}; 