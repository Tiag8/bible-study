import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';
import { mockAuthContextValue } from './mocks/auth';

// Mock do AuthContext provider
const MockAuthProvider: React.FC<{
  children: React.ReactNode;
  value?: typeof mockAuthContextValue;
}> = ({ children, value = mockAuthContextValue }) => {
  return (
    <div data-testid="mock-auth-provider">
      {children}
    </div>
  );
};

// Custom render que inclui todos os providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    authValue?: typeof mockAuthContextValue;
  },
) => {
  const { authValue = mockAuthContextValue, ...renderOptions } = options || {};

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => (
    <MockAuthProvider value={authValue}>
      {children}
    </MockAuthProvider>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Re-export everything from testing-library
export * from '@testing-library/react';
export { customRender as render };

// Utility para mock de localStorage
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach(key => {
        delete store[key];
      });
    },
  };
};
