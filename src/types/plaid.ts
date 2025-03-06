import { AccountType, AccountSubtype } from './models';

export interface PlaidBalance {
  available: number | null;
  current: number;
  limit: number | null;
  iso_currency_code: string | null;
  unofficial_currency_code: string | null;
}

export interface PlaidAccount {
  account_id: string;
  balances: PlaidBalance;
  mask: string | null;
  name: string;
  official_name: string | null;
  type: AccountType;
  subtype: AccountSubtype | null;
  verification_status: string | null;
}

export interface PlaidTransaction {
  transaction_id: string;
  account_id: string;
  amount: number;
  date: string;
  name: string;
  merchant_name: string | null;
  category: string[];
  pending: boolean;
  transaction_type: string;
  iso_currency_code: string | null;
  location: {
    address: string | null;
    city: string | null;
    region: string | null;
    postal_code: string | null;
    country: string | null;
    lat: number | null;
    lon: number | null;
  } | null;
  personal_finance_category: {
    primary: string;
    detailed: string;
  } | null;
}

export interface PlaidError {
  error_type: string;
  error_code: string;
  error_message: string;
  display_message: string | null;
  request_id: string;
  causes: string[];
}

export interface PlaidInstitution {
  institution_id: string;
  name: string;
  products: string[];
  country_codes: string[];
  logo: string | null;
  primary_color: string | null;
  url: string | null;
}

export interface PlaidAccountResponse {
  accounts: PlaidAccount[];
  item: {
    item_id: string;
    institution_id: string;
    webhook: string | null;
  };
  request_id: string;
}

export interface PlaidTransactionResponse {
  accounts: PlaidAccount[];
  transactions: PlaidTransaction[];
  total_transactions: number;
  request_id: string;
}

export interface PlaidLinkTokenResponse {
  link_token: string;
  expiration: string;
  request_id: string;
}

export interface PlaidExchangeResponse {
  access_token: string;
  item_id: string;
  request_id: string;
} 