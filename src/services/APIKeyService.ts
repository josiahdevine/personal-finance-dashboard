import axios, { AxiosResponse } from 'axios';

export interface APIKey {
  id: string;
  name: string;
  prefix: string;
  lastUsed?: string;
  createdAt: string;
  expiresAt?: string;
  scopes: string[];
  status: 'active' | 'expired' | 'revoked';
  metadata?: Record<string, any>;
}

export interface CreateAPIKeyOptions {
  name: string;
  scopes: string[];
  expiresAt?: string;
  metadata?: Record<string, any>;
}

interface APIKeyScope {
  id: string;
  name: string;
  description: string;
}

interface APIKeyValidation {
  valid: boolean;
  scopes: string[];
  expiresAt?: string;
}

export class APIKeyService {
  static async getAPIKeys(): Promise<APIKey[]> {
    const response = await axios.get<APIKey[]>('/api-keys');
    return response.data;
  }

  static async createAPIKey(options: CreateAPIKeyOptions): Promise<{
    apiKey: APIKey;
    secretKey: string; // Full API key, only shown once
  }> {
    const response = await axios.post<{
      apiKey: APIKey;
      secretKey: string;
    }>('/api-keys', options);
    return response.data;
  }

  static async revokeAPIKey(id: string): Promise<void> {
    await axios.delete(`/api-keys/${id}`);
  }

  static async updateAPIKey(id: string, updates: {
    name?: string;
    scopes?: string[];
    metadata?: Record<string, any>;
  }): Promise<APIKey> {
    const response = await axios.patch<APIKey>(`/api-keys/${id}`, updates);
    return response.data;
  }

  static async getAPIKeyUsage(id: string, options?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<Array<{
    timestamp: string;
    endpoint: string;
    method: string;
    statusCode: number;
    responseTime: number;
  }>> {
    const response = await axios.get(`/api-keys/${id}/usage`, { params: options });
    return response.data;
  }

  static async rotateAPIKey(id: string): Promise<{
    apiKey: APIKey;
    secretKey: string; // New API key, only shown once
  }> {
    const response = await axios.post<{
      apiKey: APIKey;
      secretKey: string;
    }>(`/api-keys/${id}/rotate`);
    return response.data;
  }

  static async getScopes(): Promise<APIKeyScope[]> {
    const response: AxiosResponse<APIKeyScope[]> = await axios.get('/api-keys/scopes');
    return response.data;
  }

  static async validateAPIKey(key: string): Promise<APIKeyValidation> {
    const response: AxiosResponse<APIKeyValidation> = await axios.post('/api-keys/validate', { key });
    return response.data;
  }
} 