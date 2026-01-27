"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { COLORS, BORDERS } from "@/lib/design-tokens";
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

// Dynamic import para evitar SSR issues com canvas
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      {/* TOKENS: COLORS.primary, COLORS.neutral */}
      <Loader2 className={cn("w-8 h-8 animate-spin", COLORS.primary.text)} />
      <span className={cn("ml-3", COLORS.neutral.text.muted)}>Carregando grafo...</span>
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

export default function GrafoPage() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const graphRef = useRef<any>(null);

  // Hook Supabase
  const { graphData, loading } = useGraph();

  // Estado
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

  // Handlers
  const handleNodeClick = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (node: any) => {
      // Node já contém book e chapter do graphData
      const book = mockBibleBooks.find((b) => b.name === node.book);
      if (book) {
        router.push(`/estudo/${book.id}-${node.chapter}`);
      }
    },
    [router]
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleNodeHover = useCallback((node: any | null) => {
    setHoveredNode(node);
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
      <div className="flex h-screen" style={{ backgroundColor: '#030712' }}>
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <div className="flex-1 flex items-center justify-center">
          {/* TOKENS: COLORS.primary, COLORS.neutral */}
          <Loader2 className={cn("w-12 h-12 animate-spin", COLORS.primary.text)} />
          <span className={cn("ml-4 text-xl", COLORS.neutral.text.muted)}>Carregando grafo...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#030712' }}>
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-[#030712] via-[#030712]/90 to-transparent">
          <div className="px-6 py-4">
            {/* TOKENS: COLORS.neutral, COLORS.primary */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/")}
                  className={cn(COLORS.neutral.text.muted, `hover:${COLORS.neutral.text.primary}`, "hover:bg-gray-800")}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
                <div>
                  <h1 className={cn("text-xl font-bold", COLORS.neutral.text.primary)}>
                    Segundo Cérebro
                  </h1>
                  <p className={cn("text-sm", COLORS.neutral.text.muted)}>
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
                  className={cn(COLORS.neutral.text.muted, `hover:${COLORS.neutral.text.primary}`, "hover:bg-gray-800")}
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
          {/* TOKENS: COLORS.neutral, BORDERS */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomIn}
            className={cn("bg-gray-900", BORDERS.gray, COLORS.neutral.text.secondary, `hover:${COLORS.neutral[800]}`, "hover:text-white")}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomOut}
            className={cn("bg-gray-900", BORDERS.gray, COLORS.neutral.text.secondary, `hover:${COLORS.neutral[800]}`, "hover:text-white")}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleCenter}
            className={cn("bg-gray-900", BORDERS.gray, COLORS.neutral.text.secondary, `hover:${COLORS.neutral[800]}`, "hover:text-white")}
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Legend Panel */}
        {showLegend && (
          <div className={cn("absolute top-20 right-6 z-20 bg-gray-900/95 backdrop-blur-sm rounded-lg p-4 w-64", BORDERS.gray)}>
            {/* TOKENS: COLORS.neutral, BORDERS */}
            <div className="flex items-center justify-between mb-3">
              <h3 className={cn("text-sm font-medium", COLORS.neutral.text.primary)}>
                Categorias Bíblicas
              </h3>
              <button
                onClick={() => setShowLegend(false)}
                className={cn(COLORS.neutral.text.muted, `hover:${COLORS.neutral.text.primary}`)}
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
                  <span className={cn("text-sm", COLORS.neutral.text.secondary)}>
                    {categoryLabels[category]}
                  </span>
                </div>
              ))}
            </div>
            <div className={cn("mt-4 pt-3", BORDERS.gray)}>
              <p className={cn("text-xs", COLORS.neutral.text.muted)}>
                Clique em um nó para abrir o estudo
              </p>
            </div>
          </div>
        )}

        {/* Hover Info */}
        {hoveredNode && (
          <div className={cn("absolute bottom-6 right-6 z-20 bg-gray-900/95 backdrop-blur-sm rounded-lg p-4 max-w-xs", BORDERS.gray)}>
            {/* TOKENS: COLORS.neutral */}
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: hoveredNode.color }}
              />
              <span className={cn("text-sm font-medium", COLORS.neutral.text.primary)}>
                {hoveredNode.name}
              </span>
            </div>
            <p className={cn("text-xs", COLORS.neutral.text.muted)}>
              {hoveredNode.book} {hoveredNode.chapter}
            </p>
            <Badge
              variant="secondary"
              className={cn("mt-2", COLORS.neutral[800], COLORS.neutral.text.secondary)}
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            nodeColor={(node: any) => node.color}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            nodeVal={(node: any) => node.val}
            nodeRelSize={4}
            linkColor={() => "rgba(100, 116, 139, 0.3)"}
            linkWidth={1.5}
            linkDirectionalParticles={2}
            linkDirectionalParticleWidth={2}
            linkDirectionalParticleColor={() => "rgba(148, 163, 184, 0.6)"}
            backgroundColor="#030712"
            onNodeClick={handleNodeClick}
            onNodeHover={handleNodeHover}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
              const label = node.name;
              const fontSize = 12 / globalScale;
              const nodeSize = node.val;

              // Desenhar nó
              ctx.beginPath();
              ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI);
              ctx.fillStyle = node.color;
              ctx.fill();

              // Borda do nó
              ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
              ctx.lineWidth = 1 / globalScale;
              ctx.stroke();

              // Label (só mostra em zoom adequado)
              if (globalScale > 0.5) {
                ctx.font = `${fontSize}px Inter, sans-serif`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
                ctx.fillText(label, node.x, node.y + nodeSize + fontSize);
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
