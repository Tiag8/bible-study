import { vi } from 'vitest';

// Mock do Next.js router
export const mockRouter = {
  push: vi.fn().mockResolvedValue(true),
  replace: vi.fn().mockResolvedValue(true),
  reload: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn().mockResolvedValue(undefined),
  beforePopState: vi.fn(),
  pathname: '/estudo/test-id',
  query: { id: 'test-id' },
  asPath: '/estudo/test-id',
  basePath: '',
  locale: 'pt-BR',
  locales: ['pt-BR', 'en'],
  defaultLocale: 'pt-BR',
  domainLocales: [],
  isLocaleDomain: false,
  isReady: true,
  isFallback: false,
  isPreview: false,
  route: '/estudo/[id]',
};

// Para usar em testes: vi.mocked(useRouter).mockReturnValue(mockRouter)
export const createMockRouter = () => ({
  ...mockRouter,
  push: vi.fn().mockResolvedValue(true),
  replace: vi.fn().mockResolvedValue(true),
  reload: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn().mockResolvedValue(undefined),
});
