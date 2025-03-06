import api from './api';
import type { APIKey, CreateAPIKeyData } from '../types/models';

export class APIKeyService {
  static async getAPIKeys(): Promise<APIKey[]> {
    const response = await api.get<APIKey[]>('/api/keys');
    return response.data;
  }

  static async createAPIKey(data: CreateAPIKeyData): Promise<APIKey> {
    const response = await api.post<APIKey>('/api/keys', data);
    return response.data;
  }

  static async revokeAPIKey(id: string): Promise<void> {
    await api.delete(`/api/keys/${id}`);
  }
} 