import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBubbleMenuHandlers } from '@/components/Editor/BubbleMenu/useBubbleMenuHandlers';
import type { Editor } from '@tiptap/react';

describe('useBubbleMenuHandlers', () => {
  let mockEditor: any;
  let setMode: any;
  let setLinkUrl: any;
  let setSearchQuery: any;
  let chainMock: any;

  beforeEach(() => {
    vi.clearAllMocks();

    chainMock = {
      focus: vi.fn().mockReturnThis(),
      extendMarkRange: vi.fn().mockReturnThis(),
      setLink: vi.fn().mockReturnThis(),
      unsetLink: vi.fn().mockReturnThis(),
      toggleHighlight: vi.fn().mockReturnThis(),
      unsetHighlight: vi.fn().mockReturnThis(),
      setColor: vi.fn().mockReturnThis(),
      unsetColor: vi.fn().mockReturnThis(),
      toggleBlockquote: vi.fn().mockReturnThis(),
      updateAttributes: vi.fn().mockReturnThis(),
      clearNodes: vi.fn().mockReturnThis(),
      unsetAllMarks: vi.fn().mockReturnThis(),
      run: vi.fn(),
    };

    mockEditor = {
      chain: vi.fn(() => chainMock),
      isActive: vi.fn(() => false),
    };

    setMode = vi.fn();
    setLinkUrl = vi.fn();
    setSearchQuery = vi.fn();
  });

  // ✅ TEST 1: Create external link
  it('should set external link with correct href', () => {
    const { result } = renderHook(() =>
      useBubbleMenuHandlers({
        editor: mockEditor as unknown as Editor,
        setMode,
        setLinkUrl,
        setSearchQuery,
      })
    );

    const testUrl = 'https://example.com';
    act(() => {
      result.current.setLink(testUrl);
    });

    expect(mockEditor.chain).toHaveBeenCalled();
    expect(chainMock.focus).toHaveBeenCalled();
    expect(chainMock.extendMarkRange).toHaveBeenCalledWith('link');
    expect(chainMock.setLink).toHaveBeenCalledWith({ href: testUrl });
    expect(chainMock.run).toHaveBeenCalled();
    expect(setLinkUrl).toHaveBeenCalledWith('');
    expect(setMode).toHaveBeenCalledWith('default');
  });

  // ✅ TEST 2: Create internal reference with /estudo/ format (Phase 3 refactoring)
  it('should create reference with /estudo/ URL format', () => {
    const { result } = renderHook(() =>
      useBubbleMenuHandlers({
        editor: mockEditor as unknown as Editor,
        setMode,
        setLinkUrl,
        setSearchQuery,
      })
    );

    const studyId = 'uuid-12345';
    const studyTitle = 'Gênesis 1';

    act(() => {
      result.current.setReference(studyId, studyTitle);
    });

    expect(chainMock.setLink).toHaveBeenCalledWith({
      href: `/estudo/${studyId}`,
    });
    expect(setSearchQuery).toHaveBeenCalledWith('');
    expect(setMode).toHaveBeenCalledWith('default');
  });

  // ✅ TEST 3: Remove link
  it('should remove link from selection', () => {
    const { result } = renderHook(() =>
      useBubbleMenuHandlers({
        editor: mockEditor as unknown as Editor,
        setMode,
        setLinkUrl,
        setSearchQuery,
      })
    );

    act(() => {
      result.current.removeLink();
    });

    expect(mockEditor.chain).toHaveBeenCalled();
    expect(chainMock.focus).toHaveBeenCalled();
    expect(chainMock.unsetLink).toHaveBeenCalled();
    expect(chainMock.run).toHaveBeenCalled();
  });

  // ✅ TEST 4: Apply highlight with color
  it('should apply highlight with specific color', () => {
    const { result } = renderHook(() =>
      useBubbleMenuHandlers({
        editor: mockEditor as unknown as Editor,
        setMode,
        setLinkUrl,
        setSearchQuery,
      })
    );

    const highlightColor = 'yellow';

    act(() => {
      result.current.setHighlight(highlightColor);
    });

    expect(chainMock.toggleHighlight).toHaveBeenCalledWith({ color: highlightColor });
    expect(chainMock.run).toHaveBeenCalled();
    expect(setMode).toHaveBeenCalledWith('default');
  });

  // ✅ TEST 5: Remove highlight
  it('should remove highlight from selection', () => {
    const { result } = renderHook(() =>
      useBubbleMenuHandlers({
        editor: mockEditor as unknown as Editor,
        setMode,
        setLinkUrl,
        setSearchQuery,
      })
    );

    act(() => {
      result.current.removeHighlight();
    });

    expect(chainMock.unsetHighlight).toHaveBeenCalled();
    expect(chainMock.run).toHaveBeenCalled();
    expect(setMode).toHaveBeenCalledWith('default');
  });

  // ✅ TEST 6: Set text color
  it('should set text color to specified value', () => {
    const { result } = renderHook(() =>
      useBubbleMenuHandlers({
        editor: mockEditor as unknown as Editor,
        setMode,
        setLinkUrl,
        setSearchQuery,
      })
    );

    const textColor = '#FF0000';

    act(() => {
      result.current.setTextColor(textColor);
    });

    expect(chainMock.setColor).toHaveBeenCalledWith(textColor);
    expect(chainMock.run).toHaveBeenCalled();
    expect(setMode).toHaveBeenCalledWith('default');
  });

  // ✅ TEST 7: Remove text color
  it('should remove text color from selection', () => {
    const { result } = renderHook(() =>
      useBubbleMenuHandlers({
        editor: mockEditor as unknown as Editor,
        setMode,
        setLinkUrl,
        setSearchQuery,
      })
    );

    act(() => {
      result.current.removeTextColor();
    });

    expect(chainMock.unsetColor).toHaveBeenCalled();
    expect(chainMock.run).toHaveBeenCalled();
    expect(setMode).toHaveBeenCalledWith('default');
  });

  // ✅ TEST 8: Set blockquote with color
  it('should create blockquote with border color', () => {
    mockEditor.isActive = vi.fn(() => false);

    const { result } = renderHook(() =>
      useBubbleMenuHandlers({
        editor: mockEditor as unknown as Editor,
        setMode,
        setLinkUrl,
        setSearchQuery,
      })
    );

    const borderColor = 'blue';

    act(() => {
      result.current.setBlockquote(borderColor);
    });

    expect(mockEditor.isActive).toHaveBeenCalledWith('blockquote');
    expect(chainMock.toggleBlockquote).toHaveBeenCalled();
    expect(chainMock.updateAttributes).toHaveBeenCalledWith('blockquote', {
      borderColor,
    });
    expect(setMode).toHaveBeenCalledWith('default');
  });
});
