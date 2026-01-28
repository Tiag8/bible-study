import { vi } from 'vitest';

/**
 * Mock do Tiptap Editor para testes unitários
 * Fornece uma implementação simplificada do editor sem DOM real
 */
export const mockTiptapEditor = {
  // Métodos essenciais de manipulação
  setContent: vi.fn(),
  getJSON: vi.fn(() => ({ type: 'doc', content: [] })),
  getHTML: vi.fn(() => '<p></p>'),
  getText: vi.fn(() => ''),

  // Métodos de seleção/comando
  chain: vi.fn().mockReturnThis(),
  createRange: vi.fn(),
  setSelection: vi.fn(),
  blur: vi.fn(),
  focus: vi.fn(),
  run: vi.fn(),

  // Event handlers
  on: vi.fn().mockReturnThis(),
  off: vi.fn().mockReturnThis(),
  emit: vi.fn(),

  // State
  isActive: vi.fn(() => false),
  isEditable: true,
  isEmpty: false,

  // Marks & nodes
  toggleMark: vi.fn().mockReturnThis(),
  removeMark: vi.fn().mockReturnThis(),
  clearNodes: vi.fn().mockReturnThis(),

  // Selection getters
  getSelection: vi.fn(() => ({
    $from: { pos: 0 },
    $to: { pos: 0 },
    from: 0,
    to: 0,
  })),
};

/**
 * Mock do useEditor hook
 * Simula o estado do editor em componentes React
 */
export const mockUseEditor = vi.fn(() => ({
  editor: mockTiptapEditor,
  // Adicionar outros props conforme necessário
}));

/**
 * Mock para testar BubbleMenu interactions
 * Fornece métodos para simular cliques e eventos
 */
export const createMockBubbleMenuContext = (overrides = {}) => ({
  editor: mockTiptapEditor,
  shouldShow: vi.fn(() => true),
  ...overrides,
});

/**
 * Mock para testar SlashMenu interactions
 */
export const createMockSlashMenuContext = (overrides = {}) => ({
  editor: mockTiptapEditor,
  range: { from: 0, to: 0 },
  ...overrides,
});

/**
 * Simular link creation no editor (para testes de referências)
 */
export const mockLinkCreation = (linkHref: string, linkText: string) => {
  const selection = {
    from: 0,
    to: linkText.length,
    $from: { pos: 0 },
    $to: { pos: linkText.length },
  };

  return {
    setLink: vi.fn().mockReturnValue({
      insertText: vi.fn().mockReturnValue({
        run: vi.fn(),
      }),
    }),
    getSelection: vi.fn(() => selection),
    getHTML: vi.fn(() => `<a href="${linkHref}">${linkText}</a>`),
  };
};
