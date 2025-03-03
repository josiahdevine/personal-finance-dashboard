/**
 * API Response Adapters
 * 
 * This file contains adapter functions to normalize API responses from
 * different endpoints to ensure they match the expected format for our UI components.
 */

/**
 * Adapts the balance history response to ensure it matches the format expected by the Chart.js Line component
 */
export function adaptBalanceHistoryResponse(data) {
  // Handle if data is null or undefined
  if (!data) {
    return {
      labels: [],
      datasets: [{
        label: 'Net Worth',
        data: [],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    };
  }

  // Handle if data is already in the expected format
  if (data.labels && data.datasets) {
    return data;
  }

  // Handle if data.history is an array (expected from our new API)
  if (data.history && Array.isArray(data.history)) {
    return {
      labels: data.history.map(item => new Date(item.date).toLocaleDateString()),
      datasets: [{
        label: 'Net Worth',
        data: data.history.map(item => item.balance || 0),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    };
  }

  // Handle other unexpected formats
  
  return {
    labels: [],
    datasets: [{
      label: 'Net Worth',
      data: [],
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  };
}

/**
 * Adapts the monthly income response to ensure it matches the expected format
 */
export function adaptMonthlySalaryResponse(data) {
  if (!data) {
    return { average: 0 };
  }

  // Handle if data is a number
  if (typeof data === 'number') {
    return { average: data };
  }

  // Handle if data is an object
  if (typeof data === 'object') {
    // Support different property names that might come from the API
    if (typeof data.average === 'number') {
      return { average: data.average };
    }
    if (typeof data.monthlyIncome === 'number') {
      return { average: data.monthlyIncome };
    }
    if (typeof data.amount === 'number') {
      return { average: data.amount };
    }
  }

  // Default fallback
  
  return { average: 0 };
}

/**
 * Adapts the spending summary response to ensure it matches the expected format
 */
export function adaptSpendingSummaryResponse(data) {
  if (!data) {
    return {
      total: 0,
      categories: []
    };
  }

  // Handle if data is already in the expected format
  if (typeof data.total === 'number' && Array.isArray(data.categories)) {
    return data;
  }

  // Handle if data is an array (possibly just categories)
  if (Array.isArray(data)) {
    const total = data.reduce((sum, item) => sum + (typeof item.amount === 'number' ? item.amount : 0), 0);
    return {
      total,
      categories: data
    };
  }

  // Default fallback
  
  return {
    total: 0,
    categories: []
  };
}

/**
 * Adapts the financial goals response to ensure it matches the expected format
 */
export function adaptGoalsResponse(data) {
  if (!data) {
    return [];
  }

  // If data is already an array
  if (Array.isArray(data)) {
    return data.map(goal => ({
      id: goal.id || Math.random().toString(36).substr(2, 9),
      name: goal.name || 'Unnamed Goal',
      progress: typeof goal.progress === 'number' ? goal.progress : 0,
      current: typeof goal.current === 'number' ? goal.current : 0,
      target: typeof goal.target === 'number' ? goal.target : 0
    }));
  }

  // If data has a goals property that is an array
  if (data.goals && Array.isArray(data.goals)) {
    return data.goals.map(goal => ({
      id: goal.id || Math.random().toString(36).substr(2, 9),
      name: goal.name || 'Unnamed Goal',
      progress: typeof goal.progress === 'number' ? goal.progress : 0,
      current: typeof goal.current === 'number' ? goal.current : 0,
      target: typeof goal.target === 'number' ? goal.target : 0
    }));
  }

  // Default fallback
  
  return [];
} 