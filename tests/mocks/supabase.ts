import { vi } from 'vitest';

// Mock do Supabase client
export const mockSupabaseClient = {
  from: vi.fn((table: string) => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    match: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    data: [],
    error: null,
  })),
  auth: {
    getSession: vi.fn().mockResolvedValue({
      data: {
        session: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
          },
        },
      },
      error: null,
    }),
    getUser: vi.fn().mockResolvedValue({
      data: {
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
        },
      },
      error: null,
    }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
  },
};

// Mock do createClient
export const mockCreateClient = vi.fn(() => mockSupabaseClient);

// Export para uso em testes
export const createMockSupabaseClient = () => ({
  ...mockSupabaseClient,
});
