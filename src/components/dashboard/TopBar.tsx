"use client";

import { useState } from "react";
import { Search, Network, Filter, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTags } from "@/hooks";
import { cn } from "@/lib/utils";

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
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center gap-4">
        {/* Search Input */}
        <div className="flex-1 relative max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar livros, capítulos ou tags..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
            <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="p-2 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Filtrar por Tags
                </span>
                {selectedTags.length > 0 && (
                  <button
                    onClick={clearTags}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Limpar
                  </button>
                )}
              </div>
              <div className="p-2 max-h-64 overflow-y-auto">
                {tagsLoading ? (
                  <div className="text-center py-4 text-gray-500 text-sm">Carregando...</div>
                ) : tags.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 text-sm">Nenhuma tag</div>
                ) : (
                  tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.name)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm",
                        "hover:bg-gray-50 transition-colors",
                        selectedTags.includes(tag.name) && "bg-blue-50"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "w-2 h-2 rounded-full",
                            `bg-${tag.color}-500`
                          )}
                          style={{
                            backgroundColor:
                              tag.color === "blue"
                                ? "#3b82f6"
                                : tag.color === "purple"
                                ? "#8b5cf6"
                                : tag.color === "green"
                                ? "#22c55e"
                                : tag.color === "amber"
                                ? "#f59e0b"
                                : tag.color === "pink"
                                ? "#ec4899"
                                : tag.color === "indigo"
                                ? "#6366f1"
                                : tag.color === "red"
                                ? "#ef4444"
                                : "#10b981",
                          }}
                        />
                        <span>{tag.name}</span>
                      </div>
                      {selectedTags.includes(tag.name) && (
                        <Check className="w-4 h-4 text-blue-600" />
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
          <span className="text-sm text-gray-500">Filtros ativos:</span>
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
