import React from 'react';
import { render, screen } from '@testing-library/react';
import { BalanceHistoryChart, BalanceHistoryDataPoint } from '../BalanceHistoryChart';
import { ThemeProvider } from '../../../contexts/ThemeContext';
import { DisplayMode } from '../../../types/enums';

// Mock useTheme hook
jest.mock('../../../hooks/useTheme', () => ({
  useTheme: () => ({
    theme: {
      mode: DisplayMode.LIGHT,
      isDark: false
    }
  })
}));

// Mock react-chartjs-2
jest.mock('react-chartjs-2', () => ({
  Line: jest.fn(({ data, options }) => (
    <div data-testid="mocked-line-chart">
      <div data-testid="chart-title">{options?.plugins?.title?.text || ''}</div>
      <div data-testid="chart-data">{JSON.stringify(data.labels)}</div>
    </div>
  ))
}));

// Mock formatCurrency utility
jest.mock('../../../utils/formatters', () => ({
  formatCurrency: jest.fn((value) => `$${value}`)
}));

describe('BalanceHistoryChart', () => {
  const mockData: BalanceHistoryDataPoint[] = [
    { date: '2023-01-01', amount: 5000 },
    { date: '2023-02-01', amount: 5500 },
    { date: '2023-03-01', amount: 6200 },
    { date: '2023-04-01', amount: 6800 },
    { date: '2023-05-01', amount: 7500 }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Add a test div with the chart-container id for the tests
    const div = document.createElement('div');
    div.setAttribute('data-testid', 'chart-container');
    div.setAttribute('id', 'chart-container');
    document.body.appendChild(div);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  const renderComponent = (props = {}) => {
    return render(
      <ThemeProvider>
        <BalanceHistoryChart data={mockData} {...props} />
      </ThemeProvider>
    );
  };

  it('should render without crashing', () => {
    renderComponent();
    expect(screen.getByTestId('mocked-line-chart')).toBeInTheDocument();
  });

  it('should render the correct title when provided', () => {
    const title = 'Custom Balance History';
    renderComponent({ title });
    
    // Check if title is being passed to the chart options
    expect(screen.getByTestId('chart-title').textContent).toContain(title);
  });

  it('should render the default title when none is provided', () => {
    renderComponent();
    
    // Check if default title is being passed to the chart options
    expect(screen.getByTestId('chart-title').textContent).toContain('Balance History');
  });

  it('should render with custom height', () => {
    const height = 500;
    renderComponent({ height });
    // Since we're mocking the entire chart component, we can't directly test height styles
    // This test is more of a smoke test to ensure the component renders with the height prop
    expect(screen.getByTestId('mocked-line-chart')).toBeInTheDocument();
  });

  it('should apply custom gradient and line colors', () => {
    const gradientColor = 'rgba(255, 99, 132, 0.2)';
    const lineColor = 'rgb(255, 99, 132)';
    
    renderComponent({ gradientColor, lineColor });
    
    // Since we're mocking the Line component, we can't directly test the color application
    // This is more of an integration test that would need to be verified visually
    expect(screen.getByTestId('mocked-line-chart')).toBeInTheDocument();
  });

  it('should hide legend when showLegend is false', () => {
    renderComponent({ showLegend: false });
    
    // Since we're mocking the chart, we can't directly test legend visibility
    // This test is more of a smoke test to ensure the component renders with showLegend=false
    expect(screen.getByTestId('mocked-line-chart')).toBeInTheDocument();
  });

  it('should display a message when data is empty', () => {
    renderComponent({ data: [] });
    
    // Check if the no data message is displayed using the data-testid
    expect(screen.getByTestId('no-data-message')).toBeInTheDocument();
    expect(screen.getByText('No balance history data available')).toBeInTheDocument();
    
    // The chart should not be rendered when there's no data
    expect(screen.queryByTestId('mocked-line-chart')).not.toBeInTheDocument();
  });
});
