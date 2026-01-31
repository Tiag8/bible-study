"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type { ForceGraphMethods, NodeObject } from "react-force-graph-2d";
import { cn } from "@/lib/utils";
import {
  PARCHMENT,
  PARCHMENT_HEX,
  SHADOW_WARM,
  TYPOGRAPHY,
} from "@/lib/design-tokens";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  mockBibleBooks,
  bookCategoryColors,
  BookCategory,
} from "@/lib/mock-data";
import { useGraph, GraphNode } from "@/hooks";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Home,
  Info,
  X,
  Loader2,
  Link2,
  Trash2,
  ExternalLink,
  Unlink,
  Search,
} from "lucide-react";
import { toast } from "sonner";

// Tipo do node no ForceGraph2D (NodeObject base + nossos campos custom)
type ForceGraphNode = NodeObject & GraphNode;

// Fontes para Canvas API (Lora carregada via next/font/google no layout)
const CANVAS_FONTS = {
  title: (size: number) => `600 ${size}px Lora, Georgia, serif`,
  meta: (size: number) => `${size}px Inter, system-ui, sans-serif`,
};

// Status visual config para nodes
const NODE_STATUS_STYLE: Record<string, { borderWidth: number; dash: number[]; borderAlpha: string }> = {
  estudar:    { borderWidth: 2, dash: [3, 3], borderAlpha: '60' },
  estudando:  { borderWidth: 1.5, dash: [], borderAlpha: '50' },
  revisando:  { borderWidth: 2, dash: [6, 3], borderAlpha: '70' },
  concluído:  { borderWidth: 2.5, dash: [], borderAlpha: '90' },
};

// Dynamic import para evitar SSR issues com canvas
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-parchment">
      <Loader2 className={cn("w-8 h-8 animate-spin", PARCHMENT.accent.text)} />
      <span className={cn("ml-3", PARCHMENT.text.muted)}>Carregando grafo...</span>
    </div>
  ),
});

// Legenda de categorias
const categoryLabels: Record<BookCategory, string> = {
  pentateuco: "Pentateuco",
  historicos: "Históricos",
  poeticos: "Poéticos",
  profetas_maiores: "Profetas Maiores",
  profetas_menores: "Profetas Menores",
  evangelhos: "Evangelhos",
  historico_nt: "Atos",
  cartas_paulinas: "Cartas Paulinas",
  cartas_gerais: "Cartas Gerais",
  apocaliptico: "Apocalipse",
};

export function GrafoPageClient() {
  const router = useRouter();
  const graphRef = useRef<ForceGraphMethods | undefined>(undefined);

  // Hook Supabase
  const { graphData, loading, createLink, deleteLink, getStudyLinks } = useGraph();

  // Estado
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [hoveredNode, setHoveredNode] = useState<ForceGraphNode | null>(null);
  const [fontsReady, setFontsReady] = useState(false);
  const [hiddenCategories, setHiddenCategories] = useState<Set<BookCategory>>(new Set());

  // Link management state
  const [linkingSource, setLinkingSource] = useState<ForceGraphNode | null>(null);
  const [contextMenu, setContextMenu] = useState<{ node: ForceGraphNode; x: number; y: number } | null>(null);
  const [selectedNode, setSelectedNode] = useState<ForceGraphNode | null>(null);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);
  const [hiddenStatuses, setHiddenStatuses] = useState<Set<string>>(new Set());
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Aguardar fontes carregadas para Canvas rendering
  useEffect(() => {
    document.fonts.ready.then(() => setFontsReady(true));
  }, []);

  // Navegar para estudo
  const navigateToStudy = useCallback((node: ForceGraphNode) => {
    const book = mockBibleBooks.find((b) => b.name === node.book);
    if (book) {
      router.push(`/estudo/${book.id}-${node.chapter}`);
    }
  }, [router]);

  // Handlers
  const handleNodeClick = useCallback(
    (node: NodeObject) => {
      const n = node as ForceGraphNode;
      setContextMenu(null);

      // Se estamos no modo de criação de link
      if (linkingSource) {
        if (linkingSource.id === n.id) {
          toast.info("Selecione um nó diferente para criar a conexão");
          return;
        }
        createLink(linkingSource.id, n.id).then((result) => {
          if (result) {
            toast.success(`Conexão criada: ${linkingSource.name} ↔ ${n.name}`);
          } else {
            toast.error("Erro ao criar conexão (pode já existir)");
          }
          setLinkingSource(null);
        });
        return;
      }

      // Click normal: selecionar node para ver links
      setSelectedNode(prev => prev?.id === n.id ? null : n);
    },
    [linkingSource, createLink]
  );

  // Right-click context menu
  const handleNodeRightClick = useCallback((node: NodeObject, event: MouseEvent) => {
    event.preventDefault();
    const n = node as ForceGraphNode;
    setContextMenu({ node: n, x: event.clientX, y: event.clientY });
    setSelectedNode(null);
    setLinkingSource(null);
  }, []);

  // Close context menu on click anywhere
  const handleBackgroundClick = useCallback(() => {
    setContextMenu(null);
    if (!linkingSource) {
      setSelectedNode(null);
    }
  }, [linkingSource]);

  const handleNodeHover = useCallback((node: NodeObject | null) => {
    setHoveredNode(node ? (node as ForceGraphNode) : null);
    document.body.style.cursor = node ? "pointer" : "default";
  }, []);

  // Iniciar modo de criação de link
  const startLinking = useCallback((node: ForceGraphNode) => {
    setLinkingSource(node);
    setContextMenu(null);
    toast.info(`Clique em outro nó para conectar com "${node.name}"`, { duration: 5000 });
  }, []);

  // Deletar link
  const handleDeleteLink = useCallback(async (linkId: string) => {
    const success = await deleteLink(linkId);
    if (success) {
      toast.success("Conexão removida");
    } else {
      toast.error("Erro ao remover conexão");
    }
  }, [deleteLink]);

  // Links do node selecionado
  const selectedNodeLinks = useMemo(() => {
    if (!selectedNode) return [];
    return getStudyLinks(selectedNode.id);
  }, [selectedNode, getStudyLinks]);

  // Busca - resultados filtrados
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return graphData.nodes.filter(n =>
      n.name.toLowerCase().includes(q) ||
      n.book.toLowerCase().includes(q) ||
      `${n.book} ${n.chapter}`.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [searchQuery, graphData.nodes]);

  // Focalizar node com animação
  const focusNode = useCallback((node: GraphNode) => {
    if (!graphRef.current) return;
    // D3 atribui x, y em runtime nos objetos do graphData.nodes
    const fgNode = graphData.nodes.find(n => n.id === node.id) as ForceGraphNode | undefined;
    if (fgNode && fgNode.x !== undefined && fgNode.y !== undefined) {
      graphRef.current.centerAt(fgNode.x, fgNode.y, 600);
      graphRef.current.zoom(3, 600);
    }
    setHighlightedNodeId(node.id);
    setSearchQuery("");
    setTimeout(() => setHighlightedNodeId(null), 3000);
  }, [graphData.nodes]);

  // Toggle status filter
  const toggleStatus = useCallback((status: string) => {
    setHiddenStatuses(prev => {
      const next = new Set(prev);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      return next;
    });
  }, []);

  const handleZoomIn = () => {
    if (graphRef.current) {
      const currentZoom = graphRef.current.zoom();
      graphRef.current.zoom(currentZoom * 1.3, 400);
    }
  };

  const handleZoomOut = () => {
    if (graphRef.current) {
      const currentZoom = graphRef.current.zoom();
      graphRef.current.zoom(currentZoom / 1.3, 400);
    }
  };

  const handleCenter = () => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400, 50);
    }
  };

  // Centralizar no início
  useEffect(() => {
    const timer = setTimeout(() => {
      if (graphRef.current) {
        graphRef.current.zoomToFit(400, 50);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Toggle visibilidade de categoria
  const toggleCategory = useCallback((category: BookCategory) => {
    setHiddenCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }, []);

  // Categorias presentes no grafo
  const activeCategories = [...new Set(graphData.nodes.map((n) => n.category))];

  // Dados filtrados por categorias e status visíveis
  const filteredGraphData = useMemo(() => {
    const visibleNodes = graphData.nodes.filter(n =>
      !hiddenCategories.has(n.category) && !hiddenStatuses.has(n.status)
    );
    const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
    const visibleLinks = graphData.links.filter(l => {
      const sourceId = typeof l.source === 'object' ? (l.source as ForceGraphNode).id : l.source;
      const targetId = typeof l.target === 'object' ? (l.target as ForceGraphNode).id : l.target;
      return visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId);
    });
    return { nodes: visibleNodes, links: visibleLinks };
  }, [graphData, hiddenCategories, hiddenStatuses]);

  // Estatísticas
  const stats = {
    totalStudies: graphData.nodes.length,
    visibleStudies: filteredGraphData.nodes.length,
    totalLinks: graphData.links.length,
    visibleLinks: filteredGraphData.links.length,
    categoriesActive: activeCategories.length - hiddenCategories.size,
  };

  // Estado de carregamento
  if (loading) {
    return (
      <div className={cn("flex h-screen", PARCHMENT.bg.page)}>
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className={cn("w-12 h-12 animate-spin", PARCHMENT.accent.text)} />
          <span className={cn("ml-4 text-xl", PARCHMENT.text.muted)}>Carregando grafo...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex h-screen", PARCHMENT.bg.page)}>
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-parchment via-parchment/90 to-transparent">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/")}
                  className={cn(PARCHMENT.text.secondary, "hover:text-espresso hover:bg-warm-white")}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
                <div>
                  <h1 className={cn("text-xl", TYPOGRAPHY.weights.bold, TYPOGRAPHY.families.serif, PARCHMENT.text.heading)}>
                    Segundo Cérebro
                  </h1>
                  <p className={cn(TYPOGRAPHY.sizes.sm, PARCHMENT.text.secondary)}>
                    {stats.visibleStudies} estudos • {stats.visibleLinks} conexões
                    {(hiddenCategories.size > 0 || hiddenStatuses.size > 0) && (
                      <span className={cn(PARCHMENT.text.muted)}> (filtrado)</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <div className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg border w-56",
                    PARCHMENT.bg.input, PARCHMENT.border.default,
                    "focus-within:border-amber-light"
                  )}>
                    <Search className={cn("w-4 h-4 shrink-0", PARCHMENT.text.muted)} />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar estudo..."
                      className={cn(
                        "bg-transparent outline-none w-full",
                        TYPOGRAPHY.sizes.sm, PARCHMENT.text.heading,
                        "placeholder:text-sand"
                      )}
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery("")} className="text-stone hover:text-espresso">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  {/* Search results dropdown */}
                  {searchResults.length > 0 && (
                    <div className={cn(
                      "absolute top-full left-0 right-0 mt-1 rounded-lg border py-1 max-h-60 overflow-y-auto",
                      PARCHMENT.bg.card, PARCHMENT.border.default, SHADOW_WARM.lg, "z-50"
                    )}>
                      {searchResults.map((node) => (
                        <button
                          key={node.id}
                          onClick={() => focusNode(node)}
                          className={cn(
                            "flex items-center gap-2 w-full px-3 py-2 text-left transition-colors",
                            "hover:bg-warm-white"
                          )}
                        >
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: node.color }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className={cn(TYPOGRAPHY.sizes.sm, PARCHMENT.text.heading, "truncate")}>
                              {node.name}
                            </p>
                            <p className={cn(TYPOGRAPHY.sizes.xs, PARCHMENT.text.muted)}>
                              {node.book} {node.chapter}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status filter pills */}
                <div className="flex items-center gap-1">
                  {(['estudar', 'estudando', 'revisando', 'concluído'] as const).map((status) => {
                    const isHidden = hiddenStatuses.has(status);
                    const count = graphData.nodes.filter(n => n.status === status).length;
                    if (count === 0) return null;
                    return (
                      <button
                        key={status}
                        onClick={() => toggleStatus(status)}
                        className={cn(
                          "px-2 py-1 rounded-md border transition-colors",
                          TYPOGRAPHY.sizes.xs,
                          isHidden
                            ? cn("opacity-40", PARCHMENT.border.default, PARCHMENT.text.muted)
                            : cn(PARCHMENT.border.default, PARCHMENT.text.subheading, "hover:bg-warm-white")
                        )}
                        title={isHidden ? `Mostrar ${status}` : `Ocultar ${status}`}
                      >
                        {status === 'concluído' ? 'concl.' : status}
                      </button>
                    );
                  })}
                </div>

                {linkingSource && (
                  <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg border", PARCHMENT.bg.hover, "border-amber-light")}>
                    <Link2 className="w-4 h-4 text-amber" />
                    <span className={cn(TYPOGRAPHY.sizes.sm, PARCHMENT.text.heading)}>
                      Conectando: {linkingSource.name}
                    </span>
                    <button
                      onClick={() => { setLinkingSource(null); toast.dismiss(); }}
                      className="text-stone hover:text-espresso"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLegend(!showLegend)}
                  className={cn(PARCHMENT.text.secondary, "hover:text-espresso hover:bg-warm-white")}
                >
                  <Info className="w-4 h-4 mr-2" />
                  Legenda
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Zoom Controls - 44px min touch target */}
        <div className="absolute bottom-6 left-6 z-20 flex flex-col gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomIn}
            className={cn(
              "w-11 h-11",
              PARCHMENT.bg.card, PARCHMENT.border.default, PARCHMENT.text.subheading,
              "hover:bg-warm-white hover:text-espresso", SHADOW_WARM.sm
            )}
          >
            <ZoomIn className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomOut}
            className={cn(
              "w-11 h-11",
              PARCHMENT.bg.card, PARCHMENT.border.default, PARCHMENT.text.subheading,
              "hover:bg-warm-white hover:text-espresso", SHADOW_WARM.sm
            )}
          >
            <ZoomOut className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleCenter}
            className={cn(
              "w-11 h-11",
              PARCHMENT.bg.card, PARCHMENT.border.default, PARCHMENT.text.subheading,
              "hover:bg-warm-white hover:text-espresso", SHADOW_WARM.sm
            )}
          >
            <Maximize2 className="w-5 h-5" />
          </Button>
        </div>

        {/* Legend Panel */}
        {showLegend && (
          <div className={cn(
            "absolute top-20 right-6 z-20 backdrop-blur-sm rounded-lg p-4 w-64",
            PARCHMENT.bg.card, PARCHMENT.border.default, "border", SHADOW_WARM.md
          )}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={cn(TYPOGRAPHY.sizes.sm, TYPOGRAPHY.weights.semibold, TYPOGRAPHY.families.serif, PARCHMENT.text.heading)}>
                Categorias Bíblicas
              </h3>
              <button
                onClick={() => setShowLegend(false)}
                className={cn("w-7 h-7 flex items-center justify-center rounded", PARCHMENT.text.muted, "hover:text-espresso hover:bg-warm-white")}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Categorias interativas */}
            <div className="space-y-1">
              {activeCategories.map((category) => {
                const isHidden = hiddenCategories.has(category);
                const nodeCount = graphData.nodes.filter(n => n.category === category).length;
                return (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={cn(
                      "flex items-center gap-2 w-full px-2 py-1.5 rounded transition-colors text-left",
                      isHidden
                        ? "opacity-40 hover:opacity-70"
                        : "hover:bg-warm-white"
                    )}
                  >
                    <div
                      className={cn("w-3 h-3 rounded-full shrink-0", isHidden && "grayscale")}
                      style={{ backgroundColor: bookCategoryColors[category] }}
                    />
                    <span className={cn(TYPOGRAPHY.sizes.sm, isHidden ? PARCHMENT.text.muted : PARCHMENT.text.subheading, "flex-1")}>
                      {categoryLabels[category]}
                    </span>
                    <span className={cn(TYPOGRAPHY.sizes.xs, PARCHMENT.text.muted)}>
                      {nodeCount}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Botão reset filtros */}
            {hiddenCategories.size > 0 && (
              <button
                onClick={() => setHiddenCategories(new Set())}
                className={cn(
                  "w-full mt-2 px-2 py-1.5 rounded text-center transition-colors",
                  TYPOGRAPHY.sizes.xs, PARCHMENT.text.secondary,
                  "hover:bg-warm-white hover:text-espresso"
                )}
              >
                Mostrar todas ({hiddenCategories.size} ocultas)
              </button>
            )}

            {/* Status */}
            <div className={cn("mt-3 pt-3 border-t", PARCHMENT.border.default)}>
              <h4 className={cn(TYPOGRAPHY.sizes.xs, TYPOGRAPHY.weights.semibold, PARCHMENT.text.heading, "mb-2")}>
                Status
              </h4>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border-2 border-dashed" style={{ borderColor: PARCHMENT_HEX.walnut }} />
                  <span className={cn(TYPOGRAPHY.sizes.xs, PARCHMENT.text.secondary)}>Estudar</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border" style={{ borderColor: PARCHMENT_HEX.walnut }} />
                  <span className={cn(TYPOGRAPHY.sizes.xs, PARCHMENT.text.secondary)}>Estudando</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: PARCHMENT_HEX.walnut, borderStyle: 'dashed' }} />
                  <span className={cn(TYPOGRAPHY.sizes.xs, PARCHMENT.text.secondary)}>Revisando</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full border-2 ring-2 ring-sand ring-offset-1" style={{ borderColor: PARCHMENT_HEX.walnut }} />
                  <span className={cn(TYPOGRAPHY.sizes.xs, PARCHMENT.text.secondary)}>Concluído</span>
                </div>
              </div>
            </div>

            {/* Estatísticas */}
            <div className={cn("mt-3 pt-3 border-t", PARCHMENT.border.default)}>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className={cn(TYPOGRAPHY.sizes.lg, TYPOGRAPHY.weights.semibold, TYPOGRAPHY.families.serif, PARCHMENT.text.heading)}>
                    {stats.visibleStudies}
                  </p>
                  <p className={cn(TYPOGRAPHY.sizes.xs, PARCHMENT.text.muted)}>
                    {stats.visibleStudies !== stats.totalStudies ? `de ${stats.totalStudies} ` : ''}estudos
                  </p>
                </div>
                <div>
                  <p className={cn(TYPOGRAPHY.sizes.lg, TYPOGRAPHY.weights.semibold, TYPOGRAPHY.families.serif, PARCHMENT.text.heading)}>
                    {stats.visibleLinks}
                  </p>
                  <p className={cn(TYPOGRAPHY.sizes.xs, PARCHMENT.text.muted)}>
                    {stats.visibleLinks !== stats.totalLinks ? `de ${stats.totalLinks} ` : ''}conexões
                  </p>
                </div>
              </div>
            </div>

            {/* Dica */}
            <div className={cn("mt-3 pt-3 border-t", PARCHMENT.border.default)}>
              <p className={cn(TYPOGRAPHY.sizes.xs, PARCHMENT.text.muted)}>
                Clique = ver conexões. Direito = menu. Categorias = filtrar.
              </p>
            </div>
          </div>
        )}

        {/* Hover Info - only when no context menu or selected node */}
        {hoveredNode && !contextMenu && !selectedNode && (
          <div className={cn(
            "absolute bottom-6 right-6 z-20 backdrop-blur-sm rounded-lg p-4 max-w-xs border pointer-events-none",
            PARCHMENT.bg.card, PARCHMENT.border.default, SHADOW_WARM.md
          )}>
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: hoveredNode.color }}
              />
              <span className={cn(TYPOGRAPHY.sizes.sm, TYPOGRAPHY.weights.medium, PARCHMENT.text.heading)}>
                {hoveredNode.name}
              </span>
            </div>
            <p className={cn(TYPOGRAPHY.sizes.xs, PARCHMENT.text.secondary)}>
              {hoveredNode.book} {hoveredNode.chapter}
            </p>
            <Badge
              variant="secondary"
              className={cn("mt-2", PARCHMENT.bg.hover, PARCHMENT.text.subheading, PARCHMENT.border.default, "border")}
            >
              {categoryLabels[hoveredNode.category]}
            </Badge>
          </div>
        )}

        {/* Context Menu (right-click) */}
        {contextMenu && (
          <div
            className={cn(
              "fixed z-50 rounded-lg border py-1 min-w-[180px]",
              PARCHMENT.bg.card, PARCHMENT.border.default, SHADOW_WARM.lg
            )}
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              onClick={() => { startLinking(contextMenu.node); }}
              className={cn(
                "flex items-center gap-2 w-full px-3 py-2 text-left transition-colors",
                TYPOGRAPHY.sizes.sm, PARCHMENT.text.subheading,
                "hover:bg-warm-white"
              )}
            >
              <Link2 className="w-4 h-4" />
              Criar conexão
            </button>
            <button
              onClick={() => { setSelectedNode(contextMenu.node); setContextMenu(null); }}
              className={cn(
                "flex items-center gap-2 w-full px-3 py-2 text-left transition-colors",
                TYPOGRAPHY.sizes.sm, PARCHMENT.text.subheading,
                "hover:bg-warm-white"
              )}
            >
              <Unlink className="w-4 h-4" />
              Ver conexões ({getStudyLinks(contextMenu.node.id).length})
            </button>
            <div className={cn("my-1 border-t", PARCHMENT.border.default)} />
            <button
              onClick={() => { navigateToStudy(contextMenu.node); setContextMenu(null); }}
              className={cn(
                "flex items-center gap-2 w-full px-3 py-2 text-left transition-colors",
                TYPOGRAPHY.sizes.sm, PARCHMENT.text.subheading,
                "hover:bg-warm-white"
              )}
            >
              <ExternalLink className="w-4 h-4" />
              Abrir estudo
            </button>
          </div>
        )}

        {/* Selected Node - Links Panel */}
        {selectedNode && !contextMenu && (
          <div className={cn(
            "absolute bottom-6 right-6 z-20 backdrop-blur-sm rounded-lg p-4 w-72 border",
            PARCHMENT.bg.card, PARCHMENT.border.default, SHADOW_WARM.md
          )}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: selectedNode.color }}
                />
                <span className={cn(TYPOGRAPHY.sizes.sm, TYPOGRAPHY.weights.semibold, PARCHMENT.text.heading, "truncate")}>
                  {selectedNode.name}
                </span>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className={cn("w-7 h-7 flex items-center justify-center rounded shrink-0", PARCHMENT.text.muted, "hover:text-espresso hover:bg-warm-white")}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className={cn(TYPOGRAPHY.sizes.xs, PARCHMENT.text.secondary, "mb-3")}>
              {selectedNode.book} {selectedNode.chapter} • {categoryLabels[selectedNode.category]}
            </p>

            {/* Ações */}
            <div className="flex gap-2 mb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => startLinking(selectedNode)}
                className={cn(PARCHMENT.border.default, PARCHMENT.text.subheading, "hover:bg-warm-white hover:text-espresso", "flex-1")}
              >
                <Link2 className="w-3.5 h-3.5 mr-1.5" />
                Conectar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { navigateToStudy(selectedNode); }}
                className={cn(PARCHMENT.border.default, PARCHMENT.text.subheading, "hover:bg-warm-white hover:text-espresso", "flex-1")}
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                Abrir
              </Button>
            </div>

            {/* Lista de links */}
            <div className={cn("border-t pt-3", PARCHMENT.border.default)}>
              <h4 className={cn(TYPOGRAPHY.sizes.xs, TYPOGRAPHY.weights.semibold, PARCHMENT.text.heading, "mb-2")}>
                Conexões ({selectedNodeLinks.length})
              </h4>
              {selectedNodeLinks.length === 0 ? (
                <p className={cn(TYPOGRAPHY.sizes.xs, PARCHMENT.text.muted)}>
                  Nenhuma conexão. Use &quot;Conectar&quot; para criar.
                </p>
              ) : (
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {selectedNodeLinks.map((link) => {
                    const isSource = link.source_study_id === selectedNode.id;
                    const connectedId = isSource ? link.target_study_id : link.source_study_id;
                    const connectedNode = graphData.nodes.find(n => n.id === connectedId);
                    if (!connectedNode) return null;
                    return (
                      <div key={link.id} className={cn("flex items-center gap-2 px-2 py-1.5 rounded group", "hover:bg-warm-white")}>
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: connectedNode.color }}
                        />
                        <span className={cn(TYPOGRAPHY.sizes.xs, PARCHMENT.text.subheading, "flex-1 truncate")}>
                          {connectedNode.name}
                        </span>
                        <button
                          onClick={() => handleDeleteLink(link.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-stone hover:text-red-600"
                          title="Remover conexão"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Graph */}
        <div className="flex-1">
          <ForceGraph2D
            ref={graphRef}
            graphData={filteredGraphData}
            nodeLabel=""
            nodeColor={(node: NodeObject) => (node as ForceGraphNode).color}
            nodeVal={(node: NodeObject) => (node as ForceGraphNode).val}
            nodeRelSize={4}
            linkColor={() => `${PARCHMENT_HEX.stone}4D`}
            linkWidth={1.5}
            linkDirectionalParticles={2}
            linkDirectionalParticleWidth={2}
            linkDirectionalParticleColor={() => `${PARCHMENT_HEX.walnut}66`}
            backgroundColor={PARCHMENT_HEX.parchment}
            onNodeClick={handleNodeClick}
            onNodeRightClick={handleNodeRightClick}
            onBackgroundClick={handleBackgroundClick}
            onNodeHover={handleNodeHover}
            nodeCanvasObject={(node: NodeObject, ctx: CanvasRenderingContext2D, globalScale: number) => {
              const n = node as ForceGraphNode;
              const x = node.x ?? 0;
              const y = node.y ?? 0;
              const nodeSize = n.val;
              const statusStyle = NODE_STATUS_STYLE[n.status] || NODE_STATUS_STYLE.estudando;

              // Desenhar nó
              ctx.beginPath();
              ctx.arc(x, y, nodeSize, 0, 2 * Math.PI);
              ctx.fillStyle = n.color;
              ctx.fill();

              // Borda diferenciada por status
              ctx.strokeStyle = `${PARCHMENT_HEX.walnut}${statusStyle.borderAlpha}`;
              ctx.lineWidth = statusStyle.borderWidth / globalScale;
              ctx.setLineDash(statusStyle.dash.map(d => d / globalScale));
              ctx.stroke();
              ctx.setLineDash([]);

              // Highlight do node encontrado pela busca (glow pulsante)
              if (highlightedNodeId === n.id) {
                ctx.beginPath();
                ctx.arc(x, y, nodeSize + 5 / globalScale, 0, 2 * Math.PI);
                ctx.strokeStyle = PARCHMENT_HEX.amber;
                ctx.lineWidth = 3 / globalScale;
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(x, y, nodeSize + 8 / globalScale, 0, 2 * Math.PI);
                ctx.strokeStyle = `${PARCHMENT_HEX.amber}40`;
                ctx.lineWidth = 2 / globalScale;
                ctx.stroke();
              }

              // Destaque do node source durante link creation
              if (linkingSource && linkingSource.id === n.id) {
                ctx.beginPath();
                ctx.arc(x, y, nodeSize + 3 / globalScale, 0, 2 * Math.PI);
                ctx.strokeStyle = PARCHMENT_HEX.amber;
                ctx.lineWidth = 2 / globalScale;
                ctx.setLineDash([4 / globalScale, 4 / globalScale]);
                ctx.stroke();
                ctx.setLineDash([]);
              }

              // Destaque do node selecionado
              if (selectedNode && selectedNode.id === n.id && !linkingSource) {
                ctx.beginPath();
                ctx.arc(x, y, nodeSize + 3 / globalScale, 0, 2 * Math.PI);
                ctx.strokeStyle = `${PARCHMENT_HEX.walnut}80`;
                ctx.lineWidth = 2 / globalScale;
                ctx.stroke();
              }

              // Anel externo para concluídos (destaque visual)
              if (n.status === 'concluído') {
                ctx.beginPath();
                ctx.arc(x, y, nodeSize + 2 / globalScale, 0, 2 * Math.PI);
                ctx.strokeStyle = `${n.color}50`;
                ctx.lineWidth = 1.5 / globalScale;
                ctx.stroke();
              }

              // Labels com escala dinâmica e hierarquia tipográfica
              if (globalScale > 0.4) {
                // Titulo - Lora serif, escala com zoom mas com min/max
                const titleSize = Math.min(Math.max(10 / globalScale, 8), 18);
                ctx.font = fontsReady ? CANVAS_FONTS.title(titleSize) : `600 ${titleSize}px Georgia, serif`;
                ctx.textAlign = "center";
                ctx.textBaseline = "top";
                ctx.fillStyle = PARCHMENT_HEX.espresso;

                // Truncar label se muito longo
                const maxLabelWidth = 100 / globalScale;
                let displayLabel = n.name;
                if (ctx.measureText(displayLabel).width > maxLabelWidth) {
                  while (ctx.measureText(displayLabel + '…').width > maxLabelWidth && displayLabel.length > 3) {
                    displayLabel = displayLabel.slice(0, -1);
                  }
                  displayLabel += '…';
                }

                ctx.fillText(displayLabel, x, y + nodeSize + 3 / globalScale);

                // Metadados - Inter sans, menor e mais suave (só em zoom > 0.8)
                if (globalScale > 0.8) {
                  const metaSize = Math.min(Math.max(8 / globalScale, 6), 12);
                  ctx.font = fontsReady ? CANVAS_FONTS.meta(metaSize) : `${metaSize}px system-ui, sans-serif`;
                  ctx.fillStyle = PARCHMENT_HEX.stone;
                  ctx.fillText(`${n.book} ${n.chapter}`, x, y + nodeSize + 3 / globalScale + titleSize + 2 / globalScale);
                }
              }
            }}
            nodeCanvasObjectMode={() => "replace"}
            d3AlphaDecay={0.02}
            d3VelocityDecay={0.3}
            warmupTicks={100}
            cooldownTicks={100}
          />
        </div>
      </div>
    </div>
  );
}
