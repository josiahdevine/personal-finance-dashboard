import axios from 'axios';
import apiService from '../liveApi';
import { log, logError } from '../../utils/logger';

// Mock dependencies
jest.mock('axios');
jest.mock('../../utils/logger');

describe('liveApi - Salary Journal Endpoints', () => {
  const mockSalaryEntry = {
    id: 1,
    company: 'Test Company',
    position: 'Test Position',
    salary_amount: 100000,
    date_of_change: '2024-03-01',
    notes: 'Test notes',
    bonus_amount: 10000,
    commission_amount: 5000,
    user_profile_id: 'primary'
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock axios instance
    axios.create.mockReturnValue({
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() }
      }
    });
  });

  describe('getSalaryEntries', () => {
    it('successfully fetches salary entries', async () => {
      const mockResponse = { data: [mockSalaryEntry] };
      axios.create().get.mockResolvedValue(mockResponse);

      const result = await apiService.getSalaryEntries({ userProfileId: 'primary' });

      expect(result).toEqual([mockSalaryEntry]);
      expect(axios.create().get).toHaveBeenCalledWith('/api/salary-journal', {
        params: { userProfileId: 'primary' }
      });
      expect(log).toHaveBeenCalled();
    });

    it('handles errors when fetching salary entries', async () => {
      const error = new Error('API Error');
      axios.create().get.mockRejectedValue(error);

      await expect(apiService.getSalaryEntries()).rejects.toThrow();
      expect(logError).toHaveBeenCalled();
    });
  });

  describe('createSalaryEntry', () => {
    it('successfully creates a salary entry', async () => {
      const mockResponse = { data: mockSalaryEntry };
      axios.create().post.mockResolvedValue(mockResponse);

      const result = await apiService.createSalaryEntry(mockSalaryEntry);

      expect(result).toEqual(mockSalaryEntry);
      expect(axios.create().post).toHaveBeenCalledWith('/api/salary-journal', mockSalaryEntry);
      expect(log).toHaveBeenCalled();
    });

    it('handles errors when creating a salary entry', async () => {
      const error = new Error('API Error');
      axios.create().post.mockRejectedValue(error);

      await expect(apiService.createSalaryEntry(mockSalaryEntry)).rejects.toThrow();
      expect(logError).toHaveBeenCalled();
    });
  });

  describe('updateSalaryEntry', () => {
    it('successfully updates a salary entry', async () => {
      const mockResponse = { data: mockSalaryEntry };
      axios.create().put.mockResolvedValue(mockResponse);

      const result = await apiService.updateSalaryEntry(1, mockSalaryEntry);

      expect(result).toEqual(mockSalaryEntry);
      expect(axios.create().put).toHaveBeenCalledWith('/api/salary-journal/1', mockSalaryEntry);
      expect(log).toHaveBeenCalled();
    });

    it('handles errors when updating a salary entry', async () => {
      const error = new Error('API Error');
      axios.create().put.mockRejectedValue(error);

      await expect(apiService.updateSalaryEntry(1, mockSalaryEntry)).rejects.toThrow();
      expect(logError).toHaveBeenCalled();
    });
  });

  describe('deleteSalaryEntry', () => {
    it('successfully deletes a salary entry', async () => {
      const mockResponse = { data: { success: true } };
      axios.create().delete.mockResolvedValue(mockResponse);

      const result = await apiService.deleteSalaryEntry(1);

      expect(result).toEqual({ success: true });
      expect(axios.create().delete).toHaveBeenCalledWith('/api/salary-journal/1');
      expect(log).toHaveBeenCalled();
    });

    it('handles errors when deleting a salary entry', async () => {
      const error = new Error('API Error');
      axios.create().delete.mockRejectedValue(error);

      await expect(apiService.deleteSalaryEntry(1)).rejects.toThrow();
      expect(logError).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('handles network errors', async () => {
      const error = new Error('Network Error');
      axios.create().get.mockRejectedValue(error);

      await expect(apiService.getSalaryEntries()).rejects.toMatchObject({
        message: 'Failed to fetch salary entries'
      });
    });

    it('handles 401 unauthorized errors', async () => {
      const error = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      };
      axios.create().get.mockRejectedValue(error);

      await expect(apiService.getSalaryEntries()).rejects.toMatchObject({
        code: '401'
      });
    });

    it('handles 404 not found errors', async () => {
      const error = {
        response: {
          status: 404,
          data: { message: 'Not found' }
        }
      };
      axios.create().get.mockRejectedValue(error);

      await expect(apiService.getSalaryEntries()).rejects.toMatchObject({
        code: '404'
      });
    });

    it('handles server errors', async () => {
      const error = {
        response: {
          status: 500,
          data: { message: 'Server error' }
        }
      };
      axios.create().get.mockRejectedValue(error);

      await expect(apiService.getSalaryEntries()).rejects.toMatchObject({
        code: 'UNKNOWN_ERROR'
      });
    });
  });
}); 