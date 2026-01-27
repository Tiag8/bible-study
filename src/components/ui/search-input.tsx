'use client';

import { useState, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { COLORS, BORDERS } from '@/lib/design-tokens';

export interface SearchInputProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function SearchInput({
  placeholder = 'Buscar estudos...',
  onSearch,
  loading = false,
  disabled = false,
  className,
}: SearchInputProps) {
  const [value, setValue] = useState('');

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);
      // Debounced search would go here, for now immediate
      onSearch(newValue);
    },
    [onSearch]
  );

  const handleClear = useCallback(() => {
    setValue('');
    onSearch('');
  }, [onSearch]);

  return (
    <div
      className={cn(
        'relative flex items-center',
        'bg-white rounded-lg',
        BORDERS.gray,
        'focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent',
        'transition-all',
        className
      )}
    >
      <Search className={cn("w-4 h-4 ml-3 pointer-events-none", COLORS.neutral.text.light)} />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled || loading}
        className={cn(
          'flex-1 px-3 py-2 text-sm',
          'bg-transparent border-0 outline-none',
          'placeholder-gray-500',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
        aria-label="Search studies"
      />
      {loading && (
        <Loader2 className={cn("w-4 h-4 mr-3 animate-spin", COLORS.primary.text)} />
      )}
      {!loading && value && (
        <button
          onClick={handleClear}
          className={cn("mr-2 p-1 rounded transition-colors hover:", COLORS.neutral[100])}
          aria-label="Clear search"
        >
          <X className={cn("w-4 h-4", COLORS.neutral.text.light, "hover:text-gray-600")} />
        </button>
      )}
    </div>
  );
}
