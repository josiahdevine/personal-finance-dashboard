// Declaration file for missing modules

// Prisma client types
declare module '@prisma/client' {
  export class PrismaClient {
    account: {
      findMany: (args: any) => Promise<Account[]>;
      create: (args: any) => Promise<Account>;
      update: (args: any) => Promise<Account>;
      delete: (args: any) => Promise<Account>;
      findUnique: (args: any) => Promise<Account | null>;
    };
    balanceHistory: {
      findMany: (args: any) => Promise<BalanceHistory[]>;
      create: (args: any) => Promise<BalanceHistory>;
      createMany: (args: any) => Promise<{ count: number }>;
    };
    bill: {
      findMany: (args: any) => Promise<Bill[]>;
      create: (args: any) => Promise<Bill>;
      update: (args: any) => Promise<Bill>;
      delete: (args: any) => Promise<Bill>;
      findUnique: (args: any) => Promise<Bill | null>;
    };
    billMetadata: {
      upsert: (args: any) => Promise<BillMetadata>;
    };
    
    $connect: () => Promise<void>;
    $disconnect: () => Promise<void>;
    $on: (eventType: string, callback: (event: any) => void) => void;
    $transaction: <T>(fn: (prisma: Prisma.TransactionClient) => Promise<T>, options?: { isolationLevel?: Prisma.TransactionIsolationLevel }) => Promise<T>;
    $use: (middleware: (params: any, next: (params: any) => Promise<any>) => Promise<any>) => void;
  }
  
  export namespace Prisma {
    export type InputJsonValue = string | number | boolean | null | { [key: string]: InputJsonValue } | InputJsonValue[];
    export type JsonValue = string | number | boolean | null | { [key: string]: JsonValue } | JsonValue[];
    export type Decimal = number;
    
    export enum TransactionIsolationLevel {
      ReadUncommitted = 'ReadUncommitted',
      ReadCommitted = 'ReadCommitted',
      RepeatableRead = 'RepeatableRead',
      Serializable = 'Serializable'
    }
    
    export class PrismaClientKnownRequestError extends Error {
      code: string;
      meta?: Record<string, unknown>;
      clientVersion: string;
      constructor(message: string, code: string, clientVersion: string, meta?: Record<string, unknown>);
    }
    
    export class PrismaClientUnknownRequestError extends Error {
      clientVersion: string;
      constructor(message: string, clientVersion: string);
    }
    
    export class PrismaClientValidationError extends Error {
      constructor(message: string);
    }
    
    export type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>;
    
    export interface StringFilter {
      equals?: string;
      in?: string[];
      notIn?: string[];
      lt?: string;
      lte?: string;
      gt?: string;
      gte?: string;
      contains?: string;
      startsWith?: string;
      endsWith?: string;
      not?: string | StringFilter;
    }
    
    export interface DateTimeFilter {
      equals?: Date;
      in?: Date[];
      notIn?: Date[];
      lt?: Date;
      lte?: Date;
      gt?: Date;
      gte?: Date;
      not?: Date | DateTimeFilter;
    }
    
    export interface BoolFilter {
      equals?: boolean;
      not?: boolean | BoolFilter;
    }
  }
  
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
    isHidden?: boolean;
    notes?: string;
    deleted_at?: Date;
  }

  export interface Bill {
    id: string;
    userId: string;
    name: string;
    amount: number;
    dueDate: Date;
    category: string;
    isRecurring: boolean;
    frequency?: 'monthly' | 'yearly' | 'weekly';
    notes?: string;
    isManual: boolean;
    lastPaymentDate?: Date;
    paymentHistory?: PaymentHistory[];
  }

  export interface PaymentHistory {
    id: string;
    billId: string;
    amount: number;
    paymentDate: Date;
  }

  export interface BillMetadata {
    id: string;
    userId: string;
    plaidBillId: string;
    notes?: string;
    customCategory?: string;
  }

  export interface BalanceHistory {
    id: string;
    accountId: string;
    balance: number;
    date: Date;
    account?: {
      id: string;
      name: string;
      type: string;
    };
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
  import { ReactNode, ButtonHTMLAttributes, ForwardRefExoticComponent, RefAttributes } from 'react';
  
  export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children?: ReactNode;
    variant?: 'default' | 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'link';
    size?: 'default' | 'sm' | 'md' | 'lg' | 'icon';
    isFullWidth?: boolean;
    isDisabled?: boolean;
    isLoading?: boolean;
    asChild?: boolean;
    className?: string;
  }
  
  export const Button: ForwardRefExoticComponent<ButtonProps & RefAttributes<HTMLButtonElement>>;
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
  import { TextareaHTMLAttributes, ForwardRefExoticComponent, RefAttributes } from 'react';
  
  export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    className?: string;
    variant?: 'default' | 'outline' | 'ghost';
    error?: string;
    label?: string;
    fullWidth?: boolean;
  }
  
  export const Textarea: ForwardRefExoticComponent<TextareaProps & RefAttributes<HTMLTextAreaElement>>;
}

declare module '@/components/ui/shadcn-avatar' {
  import { ReactNode, ImgHTMLAttributes, ForwardRefExoticComponent, RefAttributes } from 'react';
  
  export interface AvatarProps {
    className?: string;
    children?: ReactNode;
    src?: string;
    alt?: string;
  }
  
  export interface AvatarImageProps extends ImgHTMLAttributes<HTMLImageElement> {
    src?: string;
    alt?: string;
    className?: string;
  }
  
  export const Avatar: ForwardRefExoticComponent<AvatarProps & RefAttributes<HTMLDivElement>>;
  export const AvatarImage: ForwardRefExoticComponent<AvatarImageProps & RefAttributes<HTMLImageElement>>;
  export const AvatarFallback: ForwardRefExoticComponent<{ children: ReactNode; className?: string } & RefAttributes<HTMLDivElement>>;
}

declare module '@/components/ui/scroll-area' {
  import { ReactNode, ForwardRefExoticComponent, RefAttributes } from 'react';
  
  export interface ScrollAreaProps {
    className?: string;
    children: ReactNode;
    type?: 'auto' | 'always' | 'scroll' | 'hover';
    scrollHideDelay?: number;
  }
  
  export const ScrollArea: ForwardRefExoticComponent<ScrollAreaProps & RefAttributes<HTMLDivElement>>;
  export const ScrollBar: ForwardRefExoticComponent<{ orientation?: 'vertical' | 'horizontal'; className?: string } & RefAttributes<HTMLDivElement>>;
}

// Plaid-related declarations
declare module 'react-plaid-link' {
  export interface PlaidLinkOnSuccessMetadata {
    institution?: {
      id: string;
      name: string;
    };
    accounts: Array<{
      id: string;
      name: string;
      mask: string;
      type: string;
      subtype: string;
    }>;
    link_session_id: string;
  }

  export interface PlaidLinkError {
    error_code: string;
    error_message: string;
    error_type: string;
    display_message: string;
  }

  export interface PlaidLinkOnEventMetadata {
    [key: string]: any;
  }

  export interface PlaidLinkOptions {
    token: string;
    onSuccess: (public_token: string, metadata: PlaidLinkOnSuccessMetadata) => void;
    onExit?: (error: PlaidLinkError | null, metadata: PlaidLinkOnEventMetadata) => void;
    onEvent?: (eventName: string, metadata: PlaidLinkOnEventMetadata) => void;
  }

  export function usePlaidLink(options: PlaidLinkOptions): {
    open: () => void;
    ready: boolean;
    error: PlaidLinkError | null;
  };
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
    type?: string;
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
    deleteAccount: (id: string) => Promise<void>;
    openEditModal: (id: string) => void;
    openAddModal: () => void;
  };
}

// Types
declare module '@/types/base' {
  export interface BaseComponentProps {
    className?: string;
    children?: React.ReactNode;
  }
} 