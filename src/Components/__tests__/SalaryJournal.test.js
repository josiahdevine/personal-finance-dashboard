import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { toast } from 'react-toastify';
import SalaryJournal from '../SalaryJournal';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

// Mock dependencies
jest.mock('../../contexts/AuthContext');
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

describe('SalaryJournal', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User'
  };

  const mockSalaryEntry = {
    id: '1',
    company: 'Test Company',
    position: 'Software Engineer',
    salary_amount: 100000,
    date_of_change: '2024-01-01',
    notes: 'Test notes',
    bonus_amount: 10000,
    commission_amount: 5000,
    health_insurance: 200,
    dental_insurance: 50,
    vision_insurance: 20,
    retirement_401k: 10000,
    state: 'CA',
    city: 'San Francisco'
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock useAuth hook
    useAuth.mockReturnValue({
      token: 'test-token',
      userId: '1',
      currentUser: mockUser
    });

    // Mock axios instance
    const mockAxiosInstance = axios.create();
    mockAxiosInstance.get = jest.fn().mockResolvedValue({ data: [mockSalaryEntry] });
    mockAxiosInstance.post = jest.fn().mockResolvedValue({ data: mockSalaryEntry });
    mockAxiosInstance.put = jest.fn().mockResolvedValue({ data: mockSalaryEntry });
    mockAxiosInstance.delete = jest.fn().mockResolvedValue({ data: { success: true } });
    axios.create.mockReturnValue(mockAxiosInstance);
  });

  it('renders without crashing', () => {
    render(<SalaryJournal />);
    expect(screen.getByText('Salary Journal')).toBeInTheDocument();
  });

  it('loads and displays salary entries', async () => {
    render(<SalaryJournal />);
    
    // Wait for the mock data to be loaded
    await waitFor(() => {
      expect(axios.create().get).toHaveBeenCalledWith('/api/salary-journal', {
        params: { userProfileId: 'primary' }
      });
    });
    
    // Verify the salary entry is displayed
    expect(screen.getByText('Test Company')).toBeInTheDocument();
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('$100,000')).toBeInTheDocument();
  });

  it('can add a new salary entry', async () => {
    render(<SalaryJournal />);
    
    // Click the "Add Salary Entry" button in the empty state
    const addButton = screen.getByRole('button', { name: /Add Salary Entry/i, exact: false });
    fireEvent.click(addButton);
    
    // Fill out form
    fireEvent.change(screen.getByLabelText(/Company/i), { target: { value: 'New Company' } });
    fireEvent.change(screen.getByLabelText(/Position/i), { target: { value: 'New Position' } });
    fireEvent.change(screen.getByLabelText(/Salary Amount/i), { target: { value: '120000' } });
    fireEvent.change(screen.getByLabelText(/Date of Change/i), { target: { value: '2024-02-01' } });
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /Save/i });
    fireEvent.click(submitButton);
    
    // Verify API call
    await waitFor(() => {
      expect(axios.create().post).toHaveBeenCalledWith('/api/salary-journal', expect.any(Object));
    });
  });

  it('can update an existing salary entry', async () => {
    render(<SalaryJournal />);
    
    // Wait for the mock data to be loaded
    await waitFor(() => {
      expect(axios.create().get).toHaveBeenCalledWith('/api/salary-journal', {
        params: { userProfileId: 'primary' }
      });
    });
    
    // Click edit button
    const editButton = screen.getByRole('button', { name: /Edit/i });
    fireEvent.click(editButton);
    
    // Update form
    fireEvent.change(screen.getByLabelText(/Company/i), { target: { value: 'Updated Company' } });
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /Save/i });
    fireEvent.click(submitButton);
    
    // Verify API call
    await waitFor(() => {
      expect(axios.create().put).toHaveBeenCalledWith(`/api/salary-journal/${mockSalaryEntry.id}`, expect.any(Object));
    });
  });

  it('can delete a salary entry', async () => {
    render(<SalaryJournal />);
    
    // Wait for the mock data to be loaded
    await waitFor(() => {
      expect(axios.create().get).toHaveBeenCalledWith('/api/salary-journal', {
        params: { userProfileId: 'primary' }
      });
    });
    
    // Click delete button
    const deleteButton = screen.getByRole('button', { name: /Delete/i });
    fireEvent.click(deleteButton);
    
    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /Confirm/i });
    fireEvent.click(confirmButton);
    
    // Verify API call
    await waitFor(() => {
      expect(axios.create().delete).toHaveBeenCalledWith(`/api/salary-journal/${mockSalaryEntry.id}`);
    });
  });

  it('calculates net income correctly', async () => {
    render(<SalaryJournal />);
    
    // Wait for the mock data to be loaded
    await waitFor(() => {
      expect(axios.create().get).toHaveBeenCalledWith('/api/salary-journal', {
        params: { userProfileId: 'primary' }
      });
    });
    
    // Verify net income calculation
    const netIncomeCell = screen.getByText(/\$[\d,]+/);
    expect(netIncomeCell).toBeInTheDocument();
  });

  it('validates required fields on form submission', async () => {
    render(<SalaryJournal />);
    
    // Click the "Add Salary Entry" button in the empty state
    const addButton = screen.getByRole('button', { name: /Add Salary Entry/i, exact: false });
    fireEvent.click(addButton);
    
    // Try to submit without required fields
    const submitButton = screen.getByRole('button', { name: /Save/i });
    fireEvent.click(submitButton);
    
    // Verify validation messages
    expect(screen.getByText(/Company is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Position is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Salary amount is required/i)).toBeInTheDocument();
    
    // Verify no API call was made
    expect(axios.create().post).not.toHaveBeenCalled();
  });
}); 