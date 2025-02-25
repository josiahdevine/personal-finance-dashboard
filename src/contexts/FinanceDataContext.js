import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { log, logError } from '../utils/logger';

// Create the context
const FinanceDataContext = createContext();

// Custom hook to use the context
export function useFinanceData() {
  return useContext(FinanceDataContext);
}

export function FinanceDataProvider({ children }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // Bills Analysis Data
  const [monthlyExpenses, setMonthlyExpenses] = useState([]);
  const [totalMonthlyExpenses, setTotalMonthlyExpenses] = useState(0);
  const [expenseCategories, setExpenseCategories] = useState({});
  
  // Salary Journal Data
  const [salaryEntries, setSalaryEntries] = useState([]);
  const [totalMonthlyIncome, setTotalMonthlyIncome] = useState(0);
  const [incomeBreakdown, setIncomeBreakdown] = useState({});
  
  // Goals Data
  const [financialGoals, setFinancialGoals] = useState([]);
  const [goalProgress, setGoalProgress] = useState({});
  
  // Transactions Data
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    log('FinanceDataContext', 'Finance Data Provider mounted');
    
    const loadUserData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        log('FinanceDataContext', 'Loading user financial data');
        
        // Here you would usually fetch data from your API or database
        // For now, we'll use dummy data or localStorage as a temporary storage
        
        // Load Bills Analysis data
        const storedExpenses = localStorage.getItem(`expenses_${currentUser.uid}`);
        if (storedExpenses) {
          const expenses = JSON.parse(storedExpenses);
          setMonthlyExpenses(expenses);
          
          // Calculate totals and categories
          const total = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
          setTotalMonthlyExpenses(total);
          
          // Group by category
          const categories = expenses.reduce((acc, expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + Number(expense.amount);
            return acc;
          }, {});
          setExpenseCategories(categories);
        }
        
        // Load Salary Journal data
        const storedSalary = localStorage.getItem(`salary_${currentUser.uid}`);
        if (storedSalary) {
          const salary = JSON.parse(storedSalary);
          setSalaryEntries(salary);
          
          // Calculate monthly income
          const latestSalary = salary[0]; // Assuming sorted by date desc
          if (latestSalary) {
            setTotalMonthlyIncome(Number(latestSalary.netPay || 0));
            
            // Set income breakdown
            setIncomeBreakdown({
              gross: Number(latestSalary.grossPay || 0),
              taxes: Number(latestSalary.taxesTotal || 0),
              deductions: Number(latestSalary.deductionsTotal || 0),
              net: Number(latestSalary.netPay || 0)
            });
          }
        }
        
        // Load Goals data
        const storedGoals = localStorage.getItem(`goals_${currentUser.uid}`);
        if (storedGoals) {
          const goals = JSON.parse(storedGoals);
          setFinancialGoals(goals);
          
          // Calculate progress for each goal
          const progress = goals.reduce((acc, goal) => {
            acc[goal.id] = {
              current: Number(goal.currentAmount || 0),
              target: Number(goal.targetAmount || 0),
              percent: Math.round((Number(goal.currentAmount || 0) / Number(goal.targetAmount || 1)) * 100)
            };
            return acc;
          }, {});
          setGoalProgress(progress);
        }
        
        // Load Transactions data
        const storedTransactions = localStorage.getItem(`transactions_${currentUser.uid}`);
        if (storedTransactions) {
          setRecentTransactions(JSON.parse(storedTransactions));
        }
        
        log('FinanceDataContext', 'User financial data loaded successfully');
      } catch (error) {
        logError('FinanceDataContext', 'Error loading user financial data', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
    
    return () => {
      log('FinanceDataContext', 'Finance Data Provider unmounting');
    };
  }, [currentUser]);
  
  // Methods to update data from different components
  
  // Bills Analysis methods
  const updateExpense = (expense) => {
    try {
      setMonthlyExpenses(prevExpenses => {
        const updatedExpenses = expense.id 
          ? prevExpenses.map(e => e.id === expense.id ? expense : e)
          : [...prevExpenses, { ...expense, id: Date.now().toString() }];
        
        // Save to localStorage
        localStorage.setItem(`expenses_${currentUser?.uid}`, JSON.stringify(updatedExpenses));
        
        // Update derived state
        const total = updatedExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
        setTotalMonthlyExpenses(total);
        
        const categories = updatedExpenses.reduce((acc, e) => {
          acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
          return acc;
        }, {});
        setExpenseCategories(categories);
        
        return updatedExpenses;
      });
      
      log('FinanceDataContext', 'Expense updated successfully');
    } catch (error) {
      logError('FinanceDataContext', 'Error updating expense', error);
    }
  };
  
  const deleteExpense = (expenseId) => {
    try {
      setMonthlyExpenses(prevExpenses => {
        const updatedExpenses = prevExpenses.filter(e => e.id !== expenseId);
        
        // Save to localStorage
        localStorage.setItem(`expenses_${currentUser?.uid}`, JSON.stringify(updatedExpenses));
        
        // Update derived state
        const total = updatedExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
        setTotalMonthlyExpenses(total);
        
        const categories = updatedExpenses.reduce((acc, e) => {
          acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
          return acc;
        }, {});
        setExpenseCategories(categories);
        
        return updatedExpenses;
      });
      
      log('FinanceDataContext', 'Expense deleted successfully');
    } catch (error) {
      logError('FinanceDataContext', 'Error deleting expense', error);
    }
  };
  
  // Salary Journal methods
  const updateSalaryEntry = (entry) => {
    try {
      setSalaryEntries(prevEntries => {
        const updatedEntries = entry.id 
          ? prevEntries.map(e => e.id === entry.id ? entry : e)
          : [...prevEntries, { ...entry, id: Date.now().toString() }];
        
        // Sort by date descending
        updatedEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Save to localStorage
        localStorage.setItem(`salary_${currentUser?.uid}`, JSON.stringify(updatedEntries));
        
        // Update derived state
        const latestEntry = updatedEntries[0];
        if (latestEntry) {
          setTotalMonthlyIncome(Number(latestEntry.netPay || 0));
          
          setIncomeBreakdown({
            gross: Number(latestEntry.grossPay || 0),
            taxes: Number(latestEntry.taxesTotal || 0),
            deductions: Number(latestEntry.deductionsTotal || 0),
            net: Number(latestEntry.netPay || 0)
          });
        }
        
        return updatedEntries;
      });
      
      log('FinanceDataContext', 'Salary entry updated successfully');
    } catch (error) {
      logError('FinanceDataContext', 'Error updating salary entry', error);
    }
  };
  
  const deleteSalaryEntry = (entryId) => {
    try {
      setSalaryEntries(prevEntries => {
        const updatedEntries = prevEntries.filter(e => e.id !== entryId);
        
        // Save to localStorage
        localStorage.setItem(`salary_${currentUser?.uid}`, JSON.stringify(updatedEntries));
        
        // Update derived state
        const latestEntry = updatedEntries[0];
        if (latestEntry) {
          setTotalMonthlyIncome(Number(latestEntry.netPay || 0));
          
          setIncomeBreakdown({
            gross: Number(latestEntry.grossPay || 0),
            taxes: Number(latestEntry.taxesTotal || 0),
            deductions: Number(latestEntry.deductionsTotal || 0),
            net: Number(latestEntry.netPay || 0)
          });
        } else {
          setTotalMonthlyIncome(0);
          setIncomeBreakdown({});
        }
        
        return updatedEntries;
      });
      
      log('FinanceDataContext', 'Salary entry deleted successfully');
    } catch (error) {
      logError('FinanceDataContext', 'Error deleting salary entry', error);
    }
  };
  
  // Goals methods
  const updateGoal = (goal) => {
    try {
      setFinancialGoals(prevGoals => {
        const updatedGoals = goal.id 
          ? prevGoals.map(g => g.id === goal.id ? goal : g)
          : [...prevGoals, { ...goal, id: Date.now().toString() }];
        
        // Save to localStorage
        localStorage.setItem(`goals_${currentUser?.uid}`, JSON.stringify(updatedGoals));
        
        // Update progress
        const progress = updatedGoals.reduce((acc, g) => {
          acc[g.id] = {
            current: Number(g.currentAmount || 0),
            target: Number(g.targetAmount || 0),
            percent: Math.round((Number(g.currentAmount || 0) / Number(g.targetAmount || 1)) * 100)
          };
          return acc;
        }, {});
        setGoalProgress(progress);
        
        return updatedGoals;
      });
      
      log('FinanceDataContext', 'Goal updated successfully');
    } catch (error) {
      logError('FinanceDataContext', 'Error updating goal', error);
    }
  };
  
  const deleteGoal = (goalId) => {
    try {
      setFinancialGoals(prevGoals => {
        const updatedGoals = prevGoals.filter(g => g.id !== goalId);
        
        // Save to localStorage
        localStorage.setItem(`goals_${currentUser?.uid}`, JSON.stringify(updatedGoals));
        
        // Update progress
        const newProgress = { ...goalProgress };
        delete newProgress[goalId];
        setGoalProgress(newProgress);
        
        return updatedGoals;
      });
      
      log('FinanceDataContext', 'Goal deleted successfully');
    } catch (error) {
      logError('FinanceDataContext', 'Error deleting goal', error);
    }
  };
  
  // Transactions methods
  const updateTransactions = (transactions) => {
    try {
      setRecentTransactions(transactions);
      localStorage.setItem(`transactions_${currentUser?.uid}`, JSON.stringify(transactions));
      log('FinanceDataContext', 'Transactions updated successfully');
    } catch (error) {
      logError('FinanceDataContext', 'Error updating transactions', error);
    }
  };
  
  // Calculate financial summary for dashboard
  const financialSummary = {
    monthlyIncome: totalMonthlyIncome,
    monthlyExpenses: totalMonthlyExpenses,
    monthlySavings: totalMonthlyIncome - totalMonthlyExpenses,
    savingsRate: totalMonthlyIncome > 0 
      ? Math.round(((totalMonthlyIncome - totalMonthlyExpenses) / totalMonthlyIncome) * 100) 
      : 0,
    expenseBreakdown: expenseCategories,
    incomeBreakdown: incomeBreakdown,
    topGoals: financialGoals.slice(0, 3),
    recentTransactions: recentTransactions.slice(0, 5)
  };

  // Context value
  const value = {
    // Data
    monthlyExpenses,
    totalMonthlyExpenses,
    expenseCategories,
    salaryEntries,
    totalMonthlyIncome,
    incomeBreakdown,
    financialGoals,
    goalProgress,
    recentTransactions,
    financialSummary,
    loading,
    
    // Methods
    updateExpense,
    deleteExpense,
    updateSalaryEntry,
    deleteSalaryEntry,
    updateGoal,
    deleteGoal,
    updateTransactions
  };

  return (
    <FinanceDataContext.Provider value={value}>
      {children}
    </FinanceDataContext.Provider>
  );
}

export default FinanceDataContext; 