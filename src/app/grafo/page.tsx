"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
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
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      <span className="ml-3 text-gray-400">Carregando grafo...</span>
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
      <div className="flex h-screen bg-gray-950">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <span className="ml-4 text-xl text-gray-400">Carregando grafo...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-950">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-gray-950 via-gray-950/90 to-transparent">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/")}
                  className="text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
                <div>
                  <h1 className="text-xl font-bold text-white">
                    Segundo Cérebro
                  </h1>
                  <p className="text-sm text-gray-400">
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
                  className="text-gray-400 hover:text-white hover:bg-gray-800"
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
            className="bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomOut}
            className="bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleCenter}
            className="bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Legend Panel */}
        {showLegend && (
          <div className="absolute top-20 right-6 z-20 bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-800 p-4 w-64">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-white">
                Categorias Bíblicas
              </h3>
              <button
                onClick={() => setShowLegend(false)}
                className="text-gray-400 hover:text-white"
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
                  <span className="text-sm text-gray-300">
                    {categoryLabels[category]}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-800">
              <p className="text-xs text-gray-500">
                Clique em um nó para abrir o estudo
              </p>
            </div>
          </div>
        )}

        {/* Hover Info */}
        {hoveredNode && (
          <div className="absolute bottom-6 right-6 z-20 bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-800 p-4 max-w-xs">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: hoveredNode.color }}
              />
              <span className="text-sm font-medium text-white">
                {hoveredNode.name}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              {hoveredNode.book} {hoveredNode.chapter}
            </p>
            <Badge
              variant="secondary"
              className="mt-2 bg-gray-800 text-gray-300"
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
