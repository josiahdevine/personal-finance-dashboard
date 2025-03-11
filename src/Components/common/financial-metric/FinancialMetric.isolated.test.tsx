/**
 * Isolated test for the FinancialMetric component
 * This test is designed to run independently of the main codebase
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import FinancialMetric from './FinancialMetric';

// Mock the formatters
jest.mock('../../../utils/formatters', () => ({
  formatCurrency: jest.fn((value) => `$${value}`),
  formatPercentage: jest.fn((value) => `${value}%`),
}));

describe('FinancialMetric Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the label and value correctly', () => {
    render(<FinancialMetric label="Total Balance" value={1000} />);
    
    expect(screen.getByText('Total Balance')).toBeInTheDocument();
    expect(screen.getByText('$1000')).toBeInTheDocument();
  });

  test('renders positive change indicator correctly', () => {
    render(<FinancialMetric label="Growth" value={1500} previousValue={1200} />);
    
    const changeElement = screen.getByText('25%');
    expect(changeElement).toBeInTheDocument();
    expect(changeElement.parentElement).toHaveClass('positive');
  });

  test('renders negative change indicator correctly', () => {
    render(<FinancialMetric label="Loss" value={800} previousValue={1000} />);
    
    const changeElement = screen.getByText('20%');
    expect(changeElement).toBeInTheDocument();
    expect(changeElement.parentElement).toHaveClass('negative');
  });

  test('formats percentage values correctly', () => {
    render(<FinancialMetric label="Rate" value={7.5} formatType="percentage" />);
    
    expect(screen.getByText('7.5%')).toBeInTheDocument();
  });

  test('applies additional class name when provided', () => {
    const { container } = render(
      <FinancialMetric label="Custom" value={1000} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('financial-metric');
    expect(container.firstChild).toHaveClass('custom-class');
  });
}); 