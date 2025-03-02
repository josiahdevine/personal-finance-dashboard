/**
 * Query Optimization Utility for Neon Tech PostgreSQL
 * This module provides functions to analyze and optimize database queries
 */

const { query } = require('./db-connector');
const dbMonitor = require('./db-monitor');

// Configuration
const config = {
  slowQueryThreshold: 1000, // ms
  indexSuggestionThreshold: 5, // number of slow queries on same table/column
  analyzeFrequency: 100, // analyze after every N queries
  queriesTracked: 0
};

// Track slow queries by table and column
const slowQueryStats = {
  byTable: {},
  byTableAndColumn: {}
};

/**
 * Analyze a query for potential optimizations
 * @param {string} queryText - The SQL query text
 * @param {number} duration - Query execution duration in ms
 * @returns {Object} Analysis results with optimization suggestions
 */
function analyzeQuery(queryText, duration) {
  try {
    // Skip if query is too short or not a SELECT
    if (queryText.length < 10 || !queryText.trim().toUpperCase().startsWith('SELECT')) {
      return { analyzed: false, reason: 'Not a SELECT query or query too short' };
    }
    
    // Parse the query to identify tables and conditions
    const tables = extractTables(queryText);
    const conditions = extractConditions(queryText);
    const orderBy = extractOrderBy(queryText);
    
    // Track query stats
    trackQueryStats(tables, conditions, orderBy, duration);
    
    // Check if it's a slow query
    const isSlow = duration > config.slowQueryThreshold;
    
    // Generate optimization suggestions
    const suggestions = [];
    
    if (isSlow) {
      // Suggest indexes for slow queries
      const indexSuggestions = suggestIndexes(tables, conditions, orderBy);
      suggestions.push(...indexSuggestions);
      
      // Suggest query rewrites
      const rewriteSuggestions = suggestQueryRewrites(queryText, tables, conditions);
      suggestions.push(...rewriteSuggestions);
    }
    
    // Increment queries tracked counter
    config.queriesTracked++;
    
    // Periodically run ANALYZE on tables
    if (config.queriesTracked % config.analyzeFrequency === 0) {
      runAnalyzeOnFrequentTables();
    }
    
    return {
      analyzed: true,
      duration,
      isSlow,
      tables,
      conditions,
      orderBy,
      suggestions
    };
  } catch (error) {
    console.error('Error analyzing query:', error);
    return {
      analyzed: false,
      error: error.message
    };
  }
}

/**
 * Extract table names from a query
 * @param {string} queryText - SQL query text
 * @returns {Array} List of table names
 */
function extractTables(queryText) {
  const tables = [];
  
  // Simple regex to extract tables from FROM and JOIN clauses
  // Note: This is a simplified approach and may not work for all complex queries
  const fromRegex = /FROM\s+([a-zA-Z0-9_]+)/i;
  const joinRegex = /JOIN\s+([a-zA-Z0-9_]+)/gi;
  
  // Extract table from FROM clause
  const fromMatch = queryText.match(fromRegex);
  if (fromMatch && fromMatch[1]) {
    tables.push(fromMatch[1]);
  }
  
  // Extract tables from JOIN clauses
  let joinMatch;
  while ((joinMatch = joinRegex.exec(queryText)) !== null) {
    if (joinMatch[1]) {
      tables.push(joinMatch[1]);
    }
  }
  
  return [...new Set(tables)]; // Remove duplicates
}

/**
 * Extract conditions from a query
 * @param {string} queryText - SQL query text
 * @returns {Array} List of condition objects with table and column
 */
function extractConditions(queryText) {
  const conditions = [];
  
  // Extract WHERE clause
  const whereClauseRegex = /WHERE\s+(.*?)(?:ORDER BY|GROUP BY|LIMIT|$)/is;
  const whereMatch = queryText.match(whereClauseRegex);
  
  if (whereMatch && whereMatch[1]) {
    const whereClause = whereMatch[1].trim();
    
    // Split by AND/OR and extract column names
    const conditionParts = whereClause.split(/\s+AND\s+|\s+OR\s+/i);
    
    for (const part of conditionParts) {
      // Extract column name from condition
      const columnMatch = part.match(/([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)|([a-zA-Z0-9_]+)\s*[=<>!]/i);
      
      if (columnMatch) {
        if (columnMatch[1] && columnMatch[2]) {
          // Table.column format
          conditions.push({
            table: columnMatch[1],
            column: columnMatch[2]
          });
        } else if (columnMatch[3]) {
          // Just column format
          conditions.push({
            column: columnMatch[3]
          });
        }
      }
    }
  }
  
  return conditions;
}

/**
 * Extract ORDER BY columns from a query
 * @param {string} queryText - SQL query text
 * @returns {Array} List of order by objects with column name
 */
function extractOrderBy(queryText) {
  const orderByColumns = [];
  
  // Extract ORDER BY clause
  const orderByRegex = /ORDER BY\s+(.*?)(?:LIMIT|$)/is;
  const orderByMatch = queryText.match(orderByRegex);
  
  if (orderByMatch && orderByMatch[1]) {
    const orderByClause = orderByMatch[1].trim();
    
    // Split by commas and extract column names
    const parts = orderByClause.split(',');
    
    for (const part of parts) {
      // Extract column name from ORDER BY
      const columnMatch = part.trim().match(/([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)|([a-zA-Z0-9_]+)/i);
      
      if (columnMatch) {
        if (columnMatch[1] && columnMatch[2]) {
          // Table.column format
          orderByColumns.push({
            table: columnMatch[1],
            column: columnMatch[2]
          });
        } else if (columnMatch[3]) {
          // Just column format
          orderByColumns.push({
            column: columnMatch[3]
          });
        }
      }
    }
  }
  
  return orderByColumns;
}

/**
 * Track query statistics for optimization suggestions
 * @param {Array} tables - Tables used in the query
 * @param {Array} conditions - Conditions used in the query
 * @param {Array} orderBy - ORDER BY columns used in the query
 * @param {number} duration - Query execution duration
 */
function trackQueryStats(tables, conditions, orderBy, duration) {
  // Track by table
  for (const table of tables) {
    if (!slowQueryStats.byTable[table]) {
      slowQueryStats.byTable[table] = {
        count: 0,
        totalDuration: 0
      };
    }
    
    slowQueryStats.byTable[table].count++;
    slowQueryStats.byTable[table].totalDuration += duration;
  }
  
  // Track by table and column for WHERE conditions
  for (const condition of conditions) {
    if (!condition.table && tables.length === 1) {
      // If condition doesn't specify table but query only has one table,
      // assume the condition is for that table
      condition.table = tables[0];
    }
    
    if (condition.table && condition.column) {
      const key = `${condition.table}.${condition.column}`;
      
      if (!slowQueryStats.byTableAndColumn[key]) {
        slowQueryStats.byTableAndColumn[key] = {
          count: 0,
          totalDuration: 0,
          table: condition.table,
          column: condition.column
        };
      }
      
      slowQueryStats.byTableAndColumn[key].count++;
      slowQueryStats.byTableAndColumn[key].totalDuration += duration;
    }
  }
  
  // Track by table and column for ORDER BY
  for (const order of orderBy) {
    if (!order.table && tables.length === 1) {
      // If order doesn't specify table but query only has one table,
      // assume the order is for that table
      order.table = tables[0];
    }
    
    if (order.table && order.column) {
      const key = `${order.table}.${order.column}`;
      
      if (!slowQueryStats.byTableAndColumn[key]) {
        slowQueryStats.byTableAndColumn[key] = {
          count: 0,
          totalDuration: 0,
          table: order.table,
          column: order.column
        };
      }
      
      slowQueryStats.byTableAndColumn[key].count++;
      slowQueryStats.byTableAndColumn[key].totalDuration += duration;
    }
  }
}

/**
 * Suggest indexes based on query statistics
 * @param {Array} tables - Tables used in the query
 * @param {Array} conditions - Conditions used in the query
 * @param {Array} orderBy - ORDER BY columns used in the query
 * @returns {Array} List of index suggestions
 */
function suggestIndexes(tables, conditions, orderBy) {
  const suggestions = [];
  
  // Check conditions for potential indexes
  for (const condition of conditions) {
    if (condition.table && condition.column) {
      const key = `${condition.table}.${condition.column}`;
      const stats = slowQueryStats.byTableAndColumn[key];
      
      if (stats && stats.count >= config.indexSuggestionThreshold) {
        suggestions.push({
          type: 'index',
          table: condition.table,
          column: condition.column,
          reason: `Column appears in WHERE clause of ${stats.count} slow queries`,
          sql: `CREATE INDEX idx_${condition.table}_${condition.column} ON ${condition.table} (${condition.column});`
        });
      }
    }
  }
  
  // Check ORDER BY for potential indexes
  for (const order of orderBy) {
    if (order.table && order.column) {
      const key = `${order.table}.${order.column}`;
      const stats = slowQueryStats.byTableAndColumn[key];
      
      if (stats && stats.count >= config.indexSuggestionThreshold) {
        suggestions.push({
          type: 'index',
          table: order.table,
          column: order.column,
          reason: `Column appears in ORDER BY clause of ${stats.count} slow queries`,
          sql: `CREATE INDEX idx_${order.table}_${order.column} ON ${order.table} (${order.column});`
        });
      }
    }
  }
  
  // Remove duplicate suggestions
  return suggestions.filter((suggestion, index, self) => 
    index === self.findIndex(s => 
      s.table === suggestion.table && s.column === suggestion.column
    )
  );
}

/**
 * Suggest query rewrites based on query analysis
 * @param {string} queryText - Original query text
 * @param {Array} tables - Tables used in the query
 * @param {Array} conditions - Conditions used in the query
 * @returns {Array} List of query rewrite suggestions
 */
function suggestQueryRewrites(queryText, tables, conditions) {
  const suggestions = [];
  
  // Check for SELECT * usage
  if (queryText.includes('SELECT *')) {
    suggestions.push({
      type: 'rewrite',
      reason: 'Using SELECT * can be inefficient. Specify only needed columns.',
      importance: 'medium'
    });
  }
  
  // Check for missing LIMIT
  if (!queryText.includes('LIMIT') && tables.length > 0) {
    suggestions.push({
      type: 'rewrite',
      reason: 'Consider adding LIMIT to prevent retrieving too many rows',
      importance: 'medium'
    });
  }
  
  // Check for potential JOIN issues
  if (tables.length > 2 && !queryText.includes('INNER JOIN')) {
    suggestions.push({
      type: 'rewrite',
      reason: 'Multiple tables without INNER JOIN might cause performance issues',
      importance: 'high'
    });
  }
  
  return suggestions;
}

/**
 * Run ANALYZE on frequently queried tables
 */
async function runAnalyzeOnFrequentTables() {
  try {
    // Get top tables by query count
    const topTables = Object.entries(slowQueryStats.byTable)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(entry => entry[0]);
    
    for (const table of topTables) {
      console.log(`Running ANALYZE on frequently queried table: ${table}`);
      await query(`ANALYZE ${table}`);
    }
  } catch (error) {
    console.error('Error running ANALYZE on tables:', error);
  }
}

/**
 * Get query optimization statistics and suggestions
 * @returns {Object} Query optimization statistics and suggestions
 */
function getOptimizationStats() {
  // Generate index suggestions based on accumulated stats
  const indexSuggestions = [];
  
  for (const [key, stats] of Object.entries(slowQueryStats.byTableAndColumn)) {
    if (stats.count >= config.indexSuggestionThreshold) {
      indexSuggestions.push({
        table: stats.table,
        column: stats.column,
        queryCount: stats.count,
        avgDuration: stats.totalDuration / stats.count,
        sql: `CREATE INDEX idx_${stats.table}_${stats.column} ON ${stats.table} (${stats.column});`
      });
    }
  }
  
  // Sort suggestions by query count (descending)
  indexSuggestions.sort((a, b) => b.queryCount - a.queryCount);
  
  return {
    queriesAnalyzed: config.queriesTracked,
    tableStats: slowQueryStats.byTable,
    indexSuggestions
  };
}

/**
 * Reset optimization statistics
 */
function resetOptimizationStats() {
  slowQueryStats.byTable = {};
  slowQueryStats.byTableAndColumn = {};
  config.queriesTracked = 0;
  
  console.log('Query optimization statistics have been reset');
}

module.exports = {
  analyzeQuery,
  getOptimizationStats,
  resetOptimizationStats
}; 