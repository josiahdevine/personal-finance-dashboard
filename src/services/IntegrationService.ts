import axios from './api';

export interface Integration {
  id: string;
  type: 'plaid' | 'stripe' | 'coinbase' | 'robinhood' | 'custom';
  name: string;
  status: 'active' | 'inactive' | 'error';
  lastSync?: string;
  error?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationConfig {
  type: Integration['type'];
  credentials?: {
    apiKey?: string;
    secretKey?: string;
    accessToken?: string;
    refreshToken?: string;
  };
  settings?: Record<string, any>;
  webhookUrl?: string;
}

export class IntegrationService {
  static async getIntegrations(): Promise<Integration[]> {
    const response = await axios.get<Integration[]>('/integrations');
    return response.data;
  }

  static async getIntegration(id: string): Promise<Integration> {
    const response = await axios.get<Integration>(`/integrations/${id}`);
    return response.data;
  }

  static async createIntegration(config: IntegrationConfig): Promise<Integration> {
    const response = await axios.post<Integration>('/integrations', config);
    return response.data;
  }

  static async updateIntegration(id: string, updates: Partial<IntegrationConfig>): Promise<Integration> {
    const response = await axios.patch<Integration>(`/integrations/${id}`, updates);
    return response.data;
  }

  static async deleteIntegration(id: string): Promise<void> {
    await axios.delete(`/integrations/${id}`);
  }

  static async testIntegration(id: string): Promise<{
    success: boolean;
    message?: string;
    details?: Record<string, any>;
  }> {
    const response = await axios.post(`/integrations/${id}/test`);
    return response.data;
  }

  static async syncIntegration(id: string): Promise<{
    success: boolean;
    syncId?: string;
    message?: string;
  }> {
    const response = await axios.post(`/integrations/${id}/sync`);
    return response.data;
  }

  static async getSyncStatus(integrationId: string, syncId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress?: number;
    error?: string;
  }> {
    const response = await axios.get(`/integrations/${integrationId}/sync/${syncId}`);
    return response.data;
  }

  static async getAvailableIntegrations(): Promise<Array<{
    type: Integration['type'];
    name: string;
    description: string;
    features: string[];
    requiresApiKey: boolean;
    documentationUrl?: string;
  }>> {
    const response = await axios.get('/integrations/available');
    return response.data;
  }

  static async getIntegrationLogs(id: string, options?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<Array<{
    timestamp: string;
    level: 'info' | 'warning' | 'error';
    message: string;
    details?: Record<string, any>;
  }>> {
    const response = await axios.get(`/integrations/${id}/logs`, { params: options });
    return response.data;
  }
} 