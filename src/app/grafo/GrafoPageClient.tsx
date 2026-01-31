"use client";

import { useState, useCallback, useRef, useEffect } from "react";
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
} from "lucide-react";

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
  const { graphData, loading } = useGraph();

  // Estado
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [hoveredNode, setHoveredNode] = useState<ForceGraphNode | null>(null);
  const [fontsReady, setFontsReady] = useState(false);

  // Aguardar fontes carregadas para Canvas rendering
  useEffect(() => {
    document.fonts.ready.then(() => setFontsReady(true));
  }, []);

  // Handlers
  const handleNodeClick = useCallback(
    (node: NodeObject) => {
      const n = node as ForceGraphNode;
      const book = mockBibleBooks.find((b) => b.name === n.book);
      if (book) {
        router.push(`/estudo/${book.id}-${n.chapter}`);
      }
    },
    [router]
  );

  const handleNodeHover = useCallback((node: NodeObject | null) => {
    setHoveredNode(node ? (node as ForceGraphNode) : null);
    document.body.style.cursor = node ? "pointer" : "default";
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

  // Categorias ativas no grafo
  const activeCategories = [...new Set(graphData.nodes.map((n) => n.category))];

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
                    {graphData.nodes.length} estudos • {graphData.links.length}{" "}
                    conexões
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
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

        {/* Zoom Controls */}
        <div className="absolute bottom-6 left-6 z-20 flex flex-col gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomIn}
            className={cn(
              PARCHMENT.bg.card, PARCHMENT.border.default, PARCHMENT.text.subheading,
              "hover:bg-warm-white hover:text-espresso", SHADOW_WARM.sm
            )}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomOut}
            className={cn(
              PARCHMENT.bg.card, PARCHMENT.border.default, PARCHMENT.text.subheading,
              "hover:bg-warm-white hover:text-espresso", SHADOW_WARM.sm
            )}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleCenter}
            className={cn(
              PARCHMENT.bg.card, PARCHMENT.border.default, PARCHMENT.text.subheading,
              "hover:bg-warm-white hover:text-espresso", SHADOW_WARM.sm
            )}
          >
            <Maximize2 className="w-4 h-4" />
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
                className={cn(PARCHMENT.text.muted, "hover:text-espresso")}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {activeCategories.map((category) => (
                <div key={category} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: bookCategoryColors[category] }}
                  />
                  <span className={cn(TYPOGRAPHY.sizes.sm, PARCHMENT.text.subheading)}>
                    {categoryLabels[category]}
                  </span>
                </div>
              ))}
            </div>
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
            <div className={cn("mt-3 pt-3 border-t", PARCHMENT.border.default)}>
              <p className={cn(TYPOGRAPHY.sizes.xs, PARCHMENT.text.muted)}>
                Clique em um nó para abrir o estudo
              </p>
            </div>
          </div>
        )}

        {/* Hover Info */}
        {hoveredNode && (
          <div className={cn(
            "absolute bottom-6 right-6 z-20 backdrop-blur-sm rounded-lg p-4 max-w-xs border",
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

        {/* Graph */}
        <div className="flex-1">
          <ForceGraph2D
            ref={graphRef}
            graphData={graphData}
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
