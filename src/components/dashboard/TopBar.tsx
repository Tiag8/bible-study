"use client";

import { useState } from "react";
import { Search, Network, Filter, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTags } from "@/hooks";
import { cn } from "@/lib/utils";
import { PARCHMENT, TAG_COLORS, SHADOW_WARM } from "@/lib/design-tokens";

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
    <div className={cn("bg-warm-white px-4 md:px-6 py-3 md:py-4 border-b", PARCHMENT.border.default)}>
      <div className="flex items-center gap-2 md:gap-4 flex-wrap">
        {/* Search Input */}
        <div className="flex-1 relative max-w-lg">
          <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4", PARCHMENT.text.muted)} />
          <Input
            placeholder="Buscar livros, capítulos ou tags..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={cn(
              "pl-10 bg-parchment border-linen",
              "placeholder:text-sand",
              "focus:border-amber-light focus:ring-amber-light/20"
            )}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className={cn("absolute right-3 top-1/2 -translate-y-1/2 transition-colors p-1", PARCHMENT.text.muted, "hover:text-walnut")}
              aria-label="Limpar busca"
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
            aria-label="Filtrar por tags"
            aria-expanded={showTagDropdown}
            className={cn(
              "border-linen text-stone hover:bg-cream hover:text-walnut"
            )}
          >
            <Filter className="w-4 h-4 mr-2" />
            Tags
            {selectedTags.length > 0 && (
              <Badge variant="default" className="ml-2 bg-amber text-white">
                {selectedTags.length}
              </Badge>
            )}
          </Button>

          {/* Tag Dropdown */}
          {showTagDropdown && (
            <div className={cn("absolute top-full right-0 mt-2 w-64 bg-cream rounded-lg border z-50", PARCHMENT.border.default, SHADOW_WARM.md)}>
              <div className={cn("p-2 border-b flex items-center justify-between", PARCHMENT.border.default)}>
                <span className={cn("text-sm font-medium", PARCHMENT.text.secondary)}>
                  Filtrar por Tags
                </span>
                {selectedTags.length > 0 && (
                  <button
                    onClick={clearTags}
                    className={cn("text-xs transition-colors", PARCHMENT.accent.text, "hover:text-amber-dark")}
                  >
                    Limpar
                  </button>
                )}
              </div>
              <div className="p-2 max-h-64 overflow-y-auto">
                {tagsLoading ? (
                  <div className={cn("text-center py-4 text-sm", PARCHMENT.text.muted)}>Carregando...</div>
                ) : tags.length === 0 ? (
                  <div className={cn("text-center py-4 text-sm", PARCHMENT.text.muted)}>Nenhuma tag</div>
                ) : (
                  tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.name)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors",
                        "hover:bg-warm-white",
                        selectedTags.includes(tag.name) && "bg-warm-white"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: TAG_COLORS[tag.color] || TAG_COLORS.blue,
                          }}
                        />
                        <span className={PARCHMENT.text.secondary}>{tag.name}</span>
                      </div>
                      {selectedTags.includes(tag.name) && (
                        <Check className={cn("w-4 h-4", PARCHMENT.accent.text)} />
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Graph View Button */}
        <Button
          variant="default"
          onClick={onGraphClick}
          aria-label="Abrir visualização do grafo"
          className="bg-amber hover:bg-amber-dark text-white hidden sm:inline-flex"
        >
          <Network className="w-4 h-4 mr-2" />
          <span className="hidden md:inline">Visão do Grafo</span>
          <span className="md:hidden">Grafo</span>
        </Button>
      </div>

      {/* Active Tag Filters */}
      {selectedTags.length > 0 && (
        <div className="flex items-center gap-2 mt-3">
          <span className={cn("text-sm", PARCHMENT.text.muted)}>Filtros ativos:</span>
          {selectedTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="flex items-center gap-1 bg-warm-white border-linen text-walnut"
            >
              {tag}
              <button
                onClick={() => toggleTag(tag)}
                className="ml-1 hover:text-espresso p-0.5"
                aria-label={`Remover filtro ${tag}`}
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
