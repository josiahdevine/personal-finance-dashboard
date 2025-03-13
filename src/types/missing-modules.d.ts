// Declaration file for missing modules

// Prisma client types
declare module '@prisma/client' {
  export interface Account {
    id: string;
    userId: string;
    type: string;
    provider: string;
    providerAccountId: string;
    refresh_token?: string;
    access_token?: string;
    expires_at?: number;
    token_type?: string;
    scope?: string;
    id_token?: string;
    session_state?: string;
    name: string;
    balance: number;
    currency: string;
    lastUpdated: Date;
    isManual: boolean;
    notes?: string;
    deleted_at?: Date;
  }

  export interface BalanceHistory {
    id: string;
    accountId: string;
    balance: number;
    date: Date;
  }

  export enum AccountType {
    ASSET = 'ASSET',
    LIABILITY = 'LIABILITY'
  }
}

// UI Components
declare module '@/components/ui/card' {
  import { ReactNode } from 'react';
  
  export interface CardProps {
    children: ReactNode;
    className?: string;
  }
  
  export const Card: React.FC<CardProps> & {
    Header: React.FC<{ children: ReactNode }>;
    Body: React.FC<{ children: ReactNode }>;
  };

  export const CardContent: React.FC<{ children: ReactNode; className?: string }>;
  export const CardFooter: React.FC<{ children: ReactNode; className?: string }>;
  export const CardHeader: React.FC<{ children: ReactNode; className?: string }>;
  export const CardTitle: React.FC<{ children: ReactNode; className?: string }>;
}

declare module '@/components/ui/button' {
  import { ReactNode } from 'react';
  
  export interface ButtonProps {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    isFullWidth?: boolean;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
  }
  
  export const Button: React.FC<ButtonProps>;
}

declare module '@/components/ui/modal' {
  import { ReactNode } from 'react';
  
  export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
  }
  
  export const Modal: React.FC<ModalProps>;
}

// Additional UI Components
declare module '@/components/ui/textarea' {
  import { TextareaHTMLAttributes, RefObject } from 'react';
  
  export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    className?: string;
    ref?: RefObject<HTMLTextAreaElement>;
  }
  
  export const Textarea: React.FC<TextareaProps>;
}

declare module '@/components/ui/shadcn-avatar' {
  import { ReactNode } from 'react';
  
  export interface AvatarProps {
    className?: string;
    children?: ReactNode;
  }
  
  export const Avatar: React.FC<AvatarProps>;
  export const AvatarFallback: React.FC<{ children: ReactNode; className?: string }>;
}

declare module '@/components/ui/scroll-area' {
  import { ReactNode } from 'react';
  
  export interface ScrollAreaProps {
    className?: string;
    children: ReactNode;
  }
  
  export const ScrollArea: React.FC<ScrollAreaProps>;
}

// Utility functions
declare module '@/utils/formatters' {
  export function formatCurrency(amount: number, currency?: string): string;
  export function formatDate(date: Date | string): string;
}

// Hooks
declare module '@/hooks/useAccounts' {
  export interface Account {
    id: string;
    name: string;
    balance: number;
    currency: string;
    lastUpdated: Date;
    isManual: boolean;
    notes?: string;
    institutionName?: string;
  }
  
  export function useAccounts(): {
    accounts: Account[];
    isLoading: boolean;
    error: Error | null;
  };
}

// Types
declare module '@/types/base' {
  export interface BaseComponentProps {
    className?: string;
    children?: React.ReactNode;
  }
} 