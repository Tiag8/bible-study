"use client";

import { useState } from "react";
import { Search, Network, Filter, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTags } from "@/hooks";
import { cn } from "@/lib/utils";
import { COLORS, BORDERS, TAG_COLORS } from "@/lib/design-tokens";

interface TopBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  onGraphClick: () => void;
}

export function TopBar({
  searchQuery,
  onSearchChange,
  selectedTags,
  onTagsChange,
  onGraphClick,
}: TopBarProps) {
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const { tags, loading: tagsLoading } = useTags();

  const toggleTag = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      onTagsChange(selectedTags.filter((t) => t !== tagName));
    } else {
      onTagsChange([...selectedTags, tagName]);
    }
  };

  const clearTags = () => {
    onTagsChange([]);
  };

  return (
    <div className={cn("bg-white px-6 py-4", BORDERS.gray.replace('border', 'border-b'))}>
      {/* TOKENS: COLORS.primary, COLORS.neutral, BORDERS */}
      <div className="flex items-center gap-4">
        {/* Search Input */}
        <div className="flex-1 relative max-w-lg">
          <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4", COLORS.neutral.text.light)} />
          <Input
            placeholder="Buscar livros, capítulos ou tags..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className={cn("absolute right-3 top-1/2 -translate-y-1/2 transition-colors", COLORS.neutral.text.light, `hover:${COLORS.neutral.text.secondary}`)}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tag Filter */}
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTagDropdown(!showTagDropdown)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Tags
            {selectedTags.length > 0 && (
              <Badge variant="default" className="ml-2 bg-blue-600">
                {selectedTags.length}
              </Badge>
            )}
          </Button>

          {/* Tag Dropdown */}
          {showTagDropdown && (
            <div className={cn("absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-50", BORDERS.gray)}>
              <div className="p-2 border-b border-gray-100 flex items-center justify-between">
                <span className={cn("text-sm font-medium", COLORS.neutral.text.secondary)}>
                  Filtrar por Tags
                </span>
                {selectedTags.length > 0 && (
                  <button
                    onClick={clearTags}
                    className={cn("text-xs transition-colors", COLORS.primary.text, `hover:${COLORS.primary.dark}`)}
                  >
                    Limpar
                  </button>
                )}
              </div>
              <div className="p-2 max-h-64 overflow-y-auto">
                {tagsLoading ? (
                  <div className={cn("text-center py-4 text-sm", COLORS.neutral.text.muted)}>Carregando...</div>
                ) : tags.length === 0 ? (
                  <div className={cn("text-center py-4 text-sm", COLORS.neutral.text.muted)}>Nenhuma tag</div>
                ) : (
                  tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.name)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors",
                        `hover:${COLORS.neutral[50]}`,
                        selectedTags.includes(tag.name) && COLORS.primary.light
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: TAG_COLORS[tag.color] || TAG_COLORS.blue,
                          }}
                        />
                        <span>{tag.name}</span>
                      </div>
                      {selectedTags.includes(tag.name) && (
                        <Check className={cn("w-4 h-4", COLORS.primary.text)} />
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Graph View Button */}
        <Button variant="default" onClick={onGraphClick}>
          <Network className="w-4 h-4 mr-2" />
          Visão do Grafo
        </Button>
      </div>

      {/* Active Tag Filters */}
      {selectedTags.length > 0 && (
        <div className="flex items-center gap-2 mt-3">
          <span className={cn("text-sm", COLORS.neutral.text.muted)}>Filtros ativos:</span>
          {selectedTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {tag}
              <button
                onClick={() => toggleTag(tag)}
                className="ml-1 hover:text-gray-900"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
