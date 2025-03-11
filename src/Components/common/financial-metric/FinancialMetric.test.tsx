import React from 'react';
import { screen } from '@testing-library/react';
import FinancialMetric from './FinancialMetric';
import { renderWithProviders } from '../../../test/TestProviders';

// Mock the formatters
jest.mock('../../../utils/formatters', () => ({
  formatCurrency: jest.fn((value) => `$${value}`),
  formatPercentage: jest.fn((value) => `${value}%`),
}));

describe('FinancialMetric Component', () => {
  it('renders the label and value correctly', () => {
    renderWithProviders(
      <FinancialMetric 
        label="Total Balance" 
        value={1000} 
        formatType="currency" 
      />
    );
    
    const labelEl = screen.getByTestId('financial-metric-label');
    const valueEl = screen.getByTestId('financial-metric-value');
    
    expect(labelEl).toHaveTextContent('Total Balance');
    expect(valueEl).toHaveTextContent('$1000');
  });
  
  it('renders positive change indicator correctly', () => {
    renderWithProviders(
      <FinancialMetric 
        label="Monthly Income" 
        value={1500} 
        previousValue={1200} 
        formatType="currency" 
      />
    );
    
    const labelEl = screen.getByTestId('financial-metric-label');
    const valueEl = screen.getByTestId('financial-metric-value');
    const changeEl = screen.getByTestId('financial-metric-change');
    const iconEl = screen.getByTestId('financial-metric-icon');
    const percentageEl = screen.getByTestId('financial-metric-percentage');
    
    expect(labelEl).toHaveTextContent('Monthly Income');
    expect(valueEl).toHaveTextContent('$1500');
    expect(percentageEl).toHaveTextContent('25%');
    expect(iconEl).toHaveTextContent('▲');
    expect(changeEl).toHaveClass('positive');
  });
  
  it('renders negative change indicator correctly', () => {
    renderWithProviders(
      <FinancialMetric 
        label="Monthly Expenses" 
        value={800} 
        previousValue={1000} 
        formatType="currency" 
      />
    );
    
    const labelEl = screen.getByTestId('financial-metric-label');
    const valueEl = screen.getByTestId('financial-metric-value');
    const changeEl = screen.getByTestId('financial-metric-change');
    const iconEl = screen.getByTestId('financial-metric-icon');
    const percentageEl = screen.getByTestId('financial-metric-percentage');
    
    expect(labelEl).toHaveTextContent('Monthly Expenses');
    expect(valueEl).toHaveTextContent('$800');
    expect(percentageEl).toHaveTextContent('20%');
    expect(iconEl).toHaveTextContent('▼');
    expect(changeEl).toHaveClass('negative');
  });
  
  it('formats percentage values correctly', () => {
    renderWithProviders(
      <FinancialMetric 
        label="Growth Rate" 
        value={7.5} 
        formatType="percentage" 
      />
    );
    
    const labelEl = screen.getByTestId('financial-metric-label');
    const valueEl = screen.getByTestId('financial-metric-value');
    
    expect(labelEl).toHaveTextContent('Growth Rate');
    expect(valueEl).toHaveTextContent('7.5%');
  });
  
  it('applies additional className when provided', () => {
    const { container } = renderWithProviders(
      <FinancialMetric 
        label="Revenue" 
        value={5000} 
        className="custom-class" 
      />
    );
    
    const metricEl = screen.getByTestId('financial-metric');
    expect(metricEl).toHaveClass('financial-metric');
    expect(metricEl).toHaveClass('custom-class');
  });
}); 