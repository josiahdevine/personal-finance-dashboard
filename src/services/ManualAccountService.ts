import axios from 'axios';
import { ManualAccount, BaseModel } from '../models/types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8888/.netlify/functions';

export class ManualAccountService {
  private static instance: ManualAccountService;

  private constructor() {}

  static getInstance(): ManualAccountService {
    if (!ManualAccountService.instance) {
      ManualAccountService.instance = new ManualAccountService();
    }
    return ManualAccountService.instance;
  }

  async getAccountsByUserId(userId: string): Promise<ManualAccount[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/manual-accounts/user/${userId}`);
      return response.data.map((account: any) => ({
        ...account,
        created_at: new Date(account.created_at).toISOString(),
        updated_at: new Date(account.updated_at).toISOString()
      }));
    } catch (error) {
      console.error('Error fetching manual accounts:', error);
      throw error;
    }
  }

  async createAccount(account: Omit<ManualAccount, keyof BaseModel>): Promise<ManualAccount> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/manual-accounts`, account);
      return {
        ...response.data,
        created_at: new Date(response.data.created_at).toISOString(),
        updated_at: new Date(response.data.updated_at).toISOString()
      };
    } catch (error) {
      console.error('Error creating manual account:', error);
      throw error;
    }
  }

  async updateAccount(id: string, account: Partial<Omit<ManualAccount, keyof BaseModel>>): Promise<ManualAccount> {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/manual-accounts/${id}`, account);
      return {
        ...response.data,
        created_at: new Date(response.data.created_at).toISOString(),
        updated_at: new Date(response.data.updated_at).toISOString()
      };
    } catch (error) {
      console.error('Error updating manual account:', error);
      throw error;
    }
  }

  async deleteAccount(id: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/api/manual-accounts/${id}`);
    } catch (error) {
      console.error('Error deleting manual account:', error);
      throw error;
    }
  }

  async updateBalance(id: string, newBalance: number): Promise<ManualAccount> {
    try {
      const response = await axios.patch(`${API_BASE_URL}/api/manual-accounts/${id}/balance`, { balance: newBalance });
      return {
        ...response.data,
        created_at: new Date(response.data.created_at).toISOString(),
        updated_at: new Date(response.data.updated_at).toISOString()
      };
    } catch (error) {
      console.error('Error updating account balance:', error);
      throw error;
    }
  }
}
