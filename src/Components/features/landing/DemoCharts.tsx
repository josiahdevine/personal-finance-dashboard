import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Budget Visualization Data
const budgetData = [
  { name: 'Housing', value: 1200, fill: '#8884d8' },
  { name: 'Food', value: 500, fill: '#83a6ed' },
  { name: 'Transport', value: 300, fill: '#8dd1e1' },
  { name: 'Entertainment', value: 250, fill: '#82ca9d' },
  { name: 'Utilities', value: 200, fill: '#a4de6c' },
  { name: 'Others', value: 150, fill: '#d0ed57' },
];

// Expense Tracking Data
const expenseData = [
  { month: 'Jan', expenses: 1900, income: 2400 },
  { month: 'Feb', expenses: 1700, income: 2200 },
  { month: 'Mar', expenses: 2300, income: 2400 },
  { month: 'Apr', expenses: 1800, income: 2300 },
  { month: 'May', expenses: 1900, income: 2500 },
  { month: 'Jun', expenses: 2100, income: 2600 },
];

// Financial Insights Data
const insightsData = [
  { month: 'Jan', savings: 300 },
  { month: 'Feb', savings: 500 },
  { month: 'Mar', savings: 100 },
  { month: 'Apr', savings: 500 },
  { month: 'May', savings: 600 },
  { month: 'Jun', savings: 500 },
  { month: 'Jul', savings: 700 },
];

// Goal Tracking Data
const goalData = [
  { name: 'Current', value: 12000 },
  { name: 'Remaining', value: 8000 },
];

const COLORS = ['#0088FE', '#ECEFF1'];

export const BudgetDistributionChart: React.FC = () => {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={budgetData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {budgetData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `$${value}`} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export const ExpenseTrackingChart: React.FC = () => {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        data={expenseData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip formatter={(value) => `$${value}`} />
        <Legend />
        <Bar dataKey="income" fill="#8884d8" name="Income" />
        <Bar dataKey="expenses" fill="#82ca9d" name="Expenses" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export const FinancialInsightsChart: React.FC = () => {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart
        data={insightsData}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="month" />
        <YAxis />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip formatter={(value) => `$${value}`} />
        <Area
          type="monotone"
          dataKey="savings"
          stroke="#8884d8"
          fillOpacity={1}
          fill="url(#colorSavings)"
          name="Monthly Savings"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export const GoalTrackingChart: React.FC = () => {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={goalData}
          cx="50%"
          cy="50%"
          startAngle={90}
          endAngle={-270}
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {goalData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `$${value}`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};
