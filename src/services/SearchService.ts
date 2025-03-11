import api from './api';
import { Transaction } from '../types/models';
import { AxiosResponse } from 'axios';

interface SearchResults {
  transactions: Transaction[];
  categories: string[];
  merchants: string[];
}

// Helper function for extracting response data
const extractData = <T>(response: T | AxiosResponse<T>): T => {
  return 'data' in (response as any) 
    ? (response as any).data 
    : response as T;
};

export class SearchService {
  static async search(query: string): Promise<SearchResults> {
    try {
      const response = await api.get<SearchResults>('/api/search', {
        params: { q: query }
      });
      return extractData(response);
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  static async getCategories(): Promise<string[]> {
    try {
      const response = await api.get<string[]>('/api/categories');
      return extractData(response);
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  static async getMerchants(): Promise<string[]> {
    try {
      const response = await api.get<string[]>('/api/merchants');
      return extractData(response);
    } catch (error) {
      console.error('Error fetching merchants:', error);
      throw error;
    }
  }

  static async getRecentSearches(): Promise<string[]> {
    try {
      const response = await api.get<string[]>('/api/search/recent');
      return extractData(response);
    } catch (error) {
      console.error('Error fetching recent searches:', error);
      throw error;
    }
  }

  static async clearRecentSearches(): Promise<void> {
    try {
      await api.delete('/api/search/recent');
    } catch (error) {
      console.error('Error clearing recent searches:', error);
      throw error;
    }
  }

  static async saveSearch(query: string): Promise<void> {
    try {
      await api.post('/api/search/save', { query });
    } catch (error) {
      console.error('Error saving search:', error);
      throw error;
    }
  }

  static async getSuggestions(partial: string): Promise<string[]> {
    try {
      const response = await api.get<string[]>('/api/search/suggestions', {
        params: { q: partial }
      });
      return extractData(response);
    } catch (error) {
      console.error('Error fetching search suggestions:', error);
      throw error;
    }
  }

  static async autocomplete(partial: string): Promise<string[]> {
    try {
      const response = await api.get<string[]>('/api/search/autocomplete', {
        params: { q: partial }
      });
      return extractData(response);
    } catch (error) {
      console.error('Error fetching autocomplete suggestions:', error);
      throw error;
    }
  }
} 