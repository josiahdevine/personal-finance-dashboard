import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Create a simple accessible component for testing
const AccessibleComponent = () => (
  <div>
    <h1>Dashboard</h1>
    <nav aria-label="Main navigation">
      <ul>
        <li><a href="/dashboard">Dashboard</a></li>
        <li><a href="/accounts">Accounts</a></li>
        <li><a href="/transactions">Transactions</a></li>
      </ul>
    </nav>
    <main>
      <section aria-labelledby="dashboard-heading">
        <h2 id="dashboard-heading">Financial Summary</h2>
        <div role="region" aria-label="Account balances">
          <h3>Account Balances</h3>
          <ul>
            <li>Checking: $2,500.00</li>
            <li>Savings: $10,000.00</li>
            <li>Investment: $45,000.00</li>
          </ul>
        </div>
      </section>
      <section aria-labelledby="transactions-heading">
        <h2 id="transactions-heading">Recent Transactions</h2>
        <table aria-label="Recent transactions">
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Description</th>
              <th scope="col">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2023-04-15</td>
              <td>Grocery Shopping</td>
              <td>-$125.45</td>
            </tr>
            <tr>
              <td>2023-04-14</td>
              <td>Salary Deposit</td>
              <td>+$3,500.00</td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>
    <footer>
      <p>© 2023 Personal Finance Dashboard</p>
    </footer>
  </div>
);

// Component with accessibility issues for testing
const InaccessibleComponent = () => (
  <div>
    <div>Dashboard</div>
    <div>
      <div>
        <div onClick={() => console.log('clicked')}>Dashboard</div>
        <div onClick={() => console.log('clicked')}>Accounts</div>
        <div onClick={() => console.log('clicked')}>Transactions</div>
      </div>
    </div>
    <div>
      <div>
        <div>Financial Summary</div>
        <div>
          <div>Account Balances</div>
          <div>
            <div>Checking: $2,500.00</div>
            <div>Savings: $10,000.00</div>
            <div>Investment: $45,000.00</div>
          </div>
        </div>
      </div>
      <div>
        <div>Recent Transactions</div>
        <div>
          <div>
            <div>Date</div>
            <div>Description</div>
            <div>Amount</div>
          </div>
          <div>
            <div>2023-04-15</div>
            <div>Grocery Shopping</div>
            <div>-$125.45</div>
          </div>
          <div>
            <div>2023-04-14</div>
            <div>Salary Deposit</div>
            <div>+$3,500.00</div>
          </div>
        </div>
      </div>
    </div>
    <div>
      <div>© 2023 Personal Finance Dashboard</div>
    </div>
  </div>
);

describe('Basic Accessibility Tests', () => {
  it('accessible component passes axe tests', async () => {
    const { container } = render(<AccessibleComponent />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('accessible component renders with proper semantic structure', () => {
    render(<AccessibleComponent />);
    
    // Check for proper heading hierarchy
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Dashboard');
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(2);
    
    // Check for navigation
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    
    // Check for main content
    expect(screen.getByRole('main')).toBeInTheDocument();
    
    // Check for links
    expect(screen.getAllByRole('link')).toHaveLength(3);
    
    // Check for table
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(3);
    expect(screen.getAllByRole('columnheader')).toHaveLength(3);
  });

  it('inaccessible component fails axe tests', async () => {
    const { container } = render(<InaccessibleComponent />);
    const results = await axe(container);
    
    // This should fail, but we're checking that our testing infrastructure works
    expect(results.violations.length).toBeGreaterThan(0);
  });
});
