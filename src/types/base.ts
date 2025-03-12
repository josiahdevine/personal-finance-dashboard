/**
 * Base type for UUID strings
 */
export type UUID = string;

/**
 * Base type for ISO 8601 datetime strings
 */
export type ISO8601DateTime = string;

/**
 * Supported currencies
 */
export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  CAD = 'CAD',
  AUD = 'AUD',
  JPY = 'JPY',
  CNY = 'CNY',
  INR = 'INR'
}

/**
 * TimeFrame type for date ranges
 */
export interface TimeFrame {
  startDate: ISO8601DateTime;
  endDate: ISO8601DateTime;
}

/**
 * TimeFrameOption interface for selectable time periods
 */
export interface TimeFrameOption {
  id: string;
  label: string;
  value: string;
  timeFrame: TimeFrame | (() => TimeFrame);
}

/**
 * ChartDataPoint interface for visualization data
 */
export interface ChartDataPoint {
  x: string | number;
  y: number;
  label?: string;
  color?: string;
  [key: string]: any;
}

/**
 * ApiResponse generic type for API responses
 */
export interface ApiResponse<T> {
  data: T;
  meta?: ApiMeta;
  error?: ApiError;
}

/**
 * ApiError interface for error responses
 */
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

/**
 * ApiMeta interface for metadata in API responses
 */
export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  [key: string]: any;
}

/**
 * Base component props interface for all components
 */
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}
