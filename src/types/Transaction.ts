export interface Transaction {
  id: string;
  account_id: string;
  user_id: string;
  amount: number;
  date: string;
  description?: string;
  merchant_name?: string;
  category_id?: string;
  pending: boolean;
  transaction_type: 'debit' | 'credit';
  payment_channel: 'online' | 'in store' | 'other';
  location?: {
    address?: string;
    city?: string;
    region?: string;
    postal_code?: string;
    country?: string;
  };
  created_at: string;
  updated_at: string;
} 