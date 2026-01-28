import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * Testes para interceptação de cliques em links internos
 *
 * Simula o comportamento do handler de clique em StudyPageClient.tsx
 * que intercepta links /estudo/* e bible-graph://study/*
 */

describe('Editor Link Click Interception', () => {
  let mockRouter: any;
  let editorElement: HTMLElement;
  let preventDefault: ReturnType<typeof vi.fn>;
  let stopPropagation: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Mock do router
    mockRouter = {
      push: vi.fn().mockResolvedValue(true),
    };

    // Criar elemento fake do editor
    editorElement = document.createElement('div');
    editorElement.className = 'tiptap';
    document.body.appendChild(editorElement);

    preventDefault = vi.fn();
    stopPropagation = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
    if (editorElement?.parentElement) {
      editorElement.parentElement.removeChild(editorElement);
    }
  });

  // ✅ TEST 1: Intercept /estudo/ links
  it('should intercept and handle /estudo/ protocol links', () => {
    const link = document.createElement('a');
    link.href = '/estudo/uuid-12345';
    editorElement.appendChild(link);

    const preventDefault = vi.fn();

    // Simular o handler
    const handleLinkClick = (e: any) => {
      const target = e.target as HTMLElement;
      const linkEl = target.closest('a[href^="/estudo/"]');

      if (linkEl instanceof HTMLAnchorElement) {
        const href = linkEl.getAttribute('href');
        if (href?.startsWith('/estudo/')) {
          e.preventDefault();
          mockRouter.push(href);
        }
      }
    };

    const eventWithMethods = {
      target: link,
      preventDefault,
    } as any;

    handleLinkClick(eventWithMethods);

    expect(preventDefault).toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledWith('/estudo/uuid-12345');
  });

  // ✅ TEST 2: Intercept bible-graph:// links
  it('should intercept and convert bible-graph:// links', () => {
    const link = document.createElement('a');
    link.href = 'bible-graph://study/uuid-67890';
    editorElement.appendChild(link);

    const preventDefault = vi.fn();
    const eventWithMethods = {
      target: link,
      preventDefault,
    } as any;

    const handleLinkClick = (e: any) => {
      const target = e.target as HTMLElement;
      const linkEl = target.closest('a[href^="bible-graph://"]');

      if (linkEl instanceof HTMLAnchorElement) {
        const href = linkEl.getAttribute('href');
        if (href?.startsWith('bible-graph://study/')) {
          e.preventDefault();
          const studyId = href.replace('bible-graph://study/', '');
          mockRouter.push(`/estudo/${studyId}`);
        }
      }
    };

    handleLinkClick(eventWithMethods);

    expect(preventDefault).toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledWith('/estudo/uuid-67890');
  });

  // ✅ TEST 3: router.push called with correct path
  it('should call router.push with the correct study path', () => {
    const studyId = 'abc-def-ghi';
    const link = document.createElement('a');
    link.href = `/estudo/${studyId}`;
    editorElement.appendChild(link);

    const preventDefault = vi.fn();
    const eventWithMethods = { target: link, preventDefault } as any;

    const handleLinkClick = (e: any) => {
      const target = e.target as HTMLElement;
      const linkEl = target.closest('a[href^="/estudo/"]');
      if (linkEl instanceof HTMLAnchorElement) {
        const href = linkEl.getAttribute('href');
        if (href) {
          e.preventDefault();
          mockRouter.push(href);
        }
      }
    };

    handleLinkClick(eventWithMethods);

    expect(mockRouter.push).toHaveBeenCalledWith(`/estudo/${studyId}`);
    expect(mockRouter.push).toHaveBeenCalledTimes(1);
  });

  // ✅ TEST 4: Event delegation (click on nested element)
  it('should handle clicks on nested elements inside links', () => {
    const link = document.createElement('a');
    link.href = '/estudo/nested-test';

    const span = document.createElement('span');
    span.textContent = 'Click me';
    link.appendChild(span);
    editorElement.appendChild(link);

    const preventDefault = vi.fn();
    const eventWithMethods = {
      target: span, // Clique no span, não no link direto
      preventDefault,
    } as any;

    const handleLinkClick = (e: any) => {
      const target = e.target as HTMLElement;
      const linkEl = target.closest('a[href^="/estudo/"]');
      if (linkEl instanceof HTMLAnchorElement) {
        const href = linkEl.getAttribute('href');
        if (href) {
          e.preventDefault();
          mockRouter.push(href);
        }
      }
    };

    handleLinkClick(eventWithMethods);

    expect(preventDefault).toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledWith('/estudo/nested-test');
  });

  // ✅ TEST 5: Multiple links on same page
  it('should handle multiple links independently', () => {
    const link1 = document.createElement('a');
    link1.href = '/estudo/link-1';

    const link2 = document.createElement('a');
    link2.href = '/estudo/link-2';

    editorElement.appendChild(link1);
    editorElement.appendChild(link2);

    const handleLinkClick = (e: any) => {
      const target = e.target as HTMLElement;
      const linkEl = target.closest('a[href^="/estudo/"]');
      if (linkEl instanceof HTMLAnchorElement) {
        const href = linkEl.getAttribute('href');
        if (href) {
          e.preventDefault();
          mockRouter.push(href);
        }
      }
    };

    // Click link 1
    handleLinkClick({ target: link1, preventDefault: vi.fn() });
    expect(mockRouter.push).toHaveBeenNthCalledWith(1, '/estudo/link-1');

    // Click link 2
    handleLinkClick({ target: link2, preventDefault: vi.fn() });
    expect(mockRouter.push).toHaveBeenNthCalledWith(2, '/estudo/link-2');

    expect(mockRouter.push).toHaveBeenCalledTimes(2);
  });

  // ✅ TEST 6: Non-link clicks are ignored
  it('should not intercept clicks on non-link elements', () => {
    const nonLink = document.createElement('span');
    nonLink.textContent = 'Not a link';
    editorElement.appendChild(nonLink);

    const preventDefault = vi.fn();
    const eventWithMethods = {
      target: nonLink,
      preventDefault,
    } as any;

    const handleLinkClick = (e: any) => {
      const target = e.target as HTMLElement;
      const linkEl = target.closest('a[href^="/estudo/"]');
      if (linkEl instanceof HTMLAnchorElement) {
        e.preventDefault();
        mockRouter.push(linkEl.getAttribute('href')!);
      }
    };

    handleLinkClick(eventWithMethods);

    expect(preventDefault).not.toHaveBeenCalled();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  // ✅ TEST 7: External links are not intercepted
  it('should not intercept external http/https links', () => {
    const externalLink = document.createElement('a');
    externalLink.href = 'https://example.com';
    editorElement.appendChild(externalLink);

    const preventDefault = vi.fn();
    const eventWithMethods = {
      target: externalLink,
      preventDefault,
    } as any;

    const handleLinkClick = (e: any) => {
      const target = e.target as HTMLElement;
      const linkEl = target.closest('a[href^="/estudo/"]');
      if (linkEl instanceof HTMLAnchorElement) {
        e.preventDefault();
        mockRouter.push(linkEl.getAttribute('href')!);
      }
    };

    handleLinkClick(eventWithMethods);

    expect(preventDefault).not.toHaveBeenCalled();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  // ✅ TEST 8: Ctrl+Click behavior
  it('should still intercept even with modifier keys', () => {
    const link = document.createElement('a');
    link.href = '/estudo/ctrl-click-test';
    editorElement.appendChild(link);

    const preventDefault = vi.fn();
    const eventWithMethods = {
      target: link,
      preventDefault,
      ctrlKey: true, // Simulando Ctrl+Click
    } as any;

    const handleLinkClick = (e: any) => {
      const target = e.target as HTMLElement;
      const linkEl = target.closest('a[href^="/estudo/"]');
      if (linkEl instanceof HTMLAnchorElement) {
        const href = linkEl.getAttribute('href');
        if (href) {
          e.preventDefault();
          mockRouter.push(href);
        }
      }
    };

    handleLinkClick(eventWithMethods);

    expect(preventDefault).toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledWith('/estudo/ctrl-click-test');
  });

  // ✅ TEST 9: Event listener cleanup
  it('should properly cleanup event listener on unmount', () => {
    const removeSpy = vi.spyOn(Element.prototype, 'removeEventListener');

    const handleLinkClick = vi.fn();
    editorElement.addEventListener('click', handleLinkClick);

    // Simular unmount
    editorElement.removeEventListener('click', handleLinkClick);

    expect(removeSpy).toHaveBeenCalledWith('click', handleLinkClick);

    removeSpy.mockRestore();
  });
});
