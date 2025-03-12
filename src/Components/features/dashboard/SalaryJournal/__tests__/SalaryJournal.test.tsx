import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SalaryJournal from '../SalaryJournal';

// Mock any chart components to avoid rendering issues in tests
jest.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="mock-line-chart">Mock Line Chart</div>,
  Doughnut: () => <div data-testid="mock-doughnut-chart">Mock Doughnut Chart</div>,
}));

describe('SalaryJournal Component', () => {
  test('renders the Salary Journal title', () => {
    render(<SalaryJournal />);
    expect(screen.getByText('Salary Journal')).toBeInTheDocument();
  });

  test('renders the Income History section', () => {
    render(<SalaryJournal />);
    expect(screen.getByText('Income History')).toBeInTheDocument();
  });

  test('renders the Recent Income section', () => {
    render(<SalaryJournal />);
    expect(screen.getByText('Recent Income')).toBeInTheDocument();
  });

  test('renders sample data in the table', () => {
    render(<SalaryJournal />);
    // Check if at least one of the sample entries is in the document
    const sourceElements = screen.getAllByText('Job Inc.');
    expect(sourceElements.length).toBeGreaterThan(0);
    
    const amountElements = screen.getAllByText('$3,500.00');
    expect(amountElements.length).toBeGreaterThan(0);
  });
}); 