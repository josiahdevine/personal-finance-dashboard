// Declaration file for react-dom/client
declare module 'react-dom/client' {
  import * as React from 'react';
  
  export interface Root {
    render(children: React.ReactNode): void;
    unmount(): void;
  }
  
  export function createRoot(
    container: Element | Document | DocumentFragment | null,
    options?: { 
      onRecoverableError?: (error: unknown) => void;
      identifierPrefix?: string;
    }
  ): Root;
  
  export function hydrateRoot(
    container: Element | Document | DocumentFragment,
    children: React.ReactNode,
    options?: {
      onRecoverableError?: (error: unknown) => void;
      identifierPrefix?: string;
    }
  ): Root;
} 