import api from './api';
import { Integration, CreateIntegrationData, UpdateIntegrationData } from '../types/models';

export class IntegrationService {
  static async getIntegrations(): Promise<Integration[]> {
    const response = await api.get<Integration[]>('/api/integrations');
    return response.data;
  }

  static async createIntegration(data: CreateIntegrationData): Promise<Integration> {
    const response = await api.post<Integration>('/api/integrations', data);
    return response.data;
  }

  static async updateIntegration(id: string, data: UpdateIntegrationData): Promise<Integration> {
    const response = await api.patch<Integration>(`/api/integrations/${id}`, data);
    return response.data;
  }

  static async deleteIntegration(id: string): Promise<void> {
    await api.delete(`/api/integrations/${id}`);
  }

  static async syncIntegration(id: string): Promise<Integration> {
    const response = await api.post<Integration>(`/api/integrations/${id}/sync`);
    return response.data;
  }
} 