import { api } from './api';
import { Transaction } from '../types/models';

interface SearchResults {
  transactions: Transaction[];
  categories: string[];
  merchants: string[];
}

export class SearchService {
  static async search(query: string): Promise<SearchResults> {
    const response = await api.get<SearchResults>('/search', {
      params: { q: query }
    });
    return response;
  }

  static async getRecentSearches(): Promise<string[]> {
    const response = await api.get<string[]>('/search/recent');
    return response;
  }

  static async clearRecentSearches(): Promise<void> {
    await api.delete('/search/recent');
  }

  static async getSuggestions(partial: string): Promise<string[]> {
    const response = await api.get<string[]>('/search/suggestions', {
      params: { q: partial }
    });
    return response;
  }
} 