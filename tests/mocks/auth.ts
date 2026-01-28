import { vi } from 'vitest';

export const mockAuthContextValue = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    user_metadata: {
      full_name: 'Test User',
    },
  },
  profile: {
    id: 'test-user-id',
    full_name: 'Test User',
    role: 'free' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  loading: false,
  error: null,
  signIn: vi.fn().mockResolvedValue(undefined),
  signUp: vi.fn().mockResolvedValue(undefined),
  signOut: vi.fn().mockResolvedValue(undefined),
  refreshProfile: vi.fn().mockResolvedValue(undefined),
};

export const mockAuthContextValueLoading = {
  ...mockAuthContextValue,
  loading: true,
  user: null,
  profile: null,
};

export const mockAuthContextValueLoggedOut = {
  ...mockAuthContextValue,
  user: null,
  profile: null,
  loading: false,
};

export const createMockAuthContext = (overrides = {}) => ({
  ...mockAuthContextValue,
  ...overrides,
});
