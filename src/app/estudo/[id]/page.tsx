"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { Editor } from "@/components/Editor";
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getBookById } from "@/lib/mock-data";
import { useStudies, useTags, StudyWithContent } from "@/hooks";
import {
  Save,
  CheckCircle,
  Clock,
  Tag,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StudyPageProps {
  params: Promise<{ id: string }>;
}

export default function StudyPage({ params }: StudyPageProps) {
  const { id } = use(params);
  const router = useRouter();

  // Hooks Supabase
  const { getOrCreateStudy, saveStudy } = useStudies();
  const { tags: availableTags, loading: tagsLoading } = useTags();

  // Estado do estudo
  const [study, setStudy] = useState<StudyWithContent | null>(null);
  const [title, setTitle] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [currentContent, setCurrentContent] = useState<string | any>("");

  // Estado de edição
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Confirmação de saída
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  // Carregar estudo
  useEffect(() => {
    async function loadStudy() {
      setIsLoading(true);
      // Parse do ID: formato "bookId-chapter" (ex: "gen-1", "pro-16")
      const parts = id.split("-");
      const chapter = parseInt(parts.pop() || "1", 10);
      const bookId = parts.join("-");

      const book = getBookById(bookId);
      if (!book) {
        // Se livro não encontrado, redireciona para home
        router.push("/");
        return;
      }

      try {
        console.log("[ESTUDO] loadStudy - calling getOrCreateStudy:", book.name, chapter);
        const studyData = await getOrCreateStudy(book.name, chapter, `${book.name} ${chapter}`);
        console.log("[ESTUDO] loadStudy - study loaded:", studyData?.id);
        setStudy(studyData);
        setTitle(studyData.title);
        setSelectedTags(studyData.tags || []);
        setCurrentContent(studyData.content || "");
        setIsInitialLoad(true); // Marca que acabou de carregar
      } catch (error) {
        console.error("[ESTUDO] loadStudy ERROR:", error);
        setLoadError(error instanceof Error ? error.message : "Erro ao carregar estudo");
      } finally {
        setIsLoading(false);
      }
    }
    loadStudy();
  }, [id, router, getOrCreateStudy]);

  // Salvar automaticamente (debounced)
  // Ignora a primeira chamada (mount do editor)
  const handleContentChange = useCallback((content: string) => {
    if (isInitialLoad) {
      console.log("[ESTUDO] handleContentChange - ignoring initial load");
      setIsInitialLoad(false);
      setCurrentContent(content);
      return;
    }
    console.log("[ESTUDO] handleContentChange - marking unsaved");
    setCurrentContent(content);
    setHasUnsavedChanges(true);
  }, [isInitialLoad]);

  // Função de salvamento
  const handleSave = useCallback(async () => {
    if (!study) return;

    setIsSaving(true);

    try {
      // Parsear content de string JSON para objeto
      let contentToSave = currentContent;
      if (typeof currentContent === "string" && currentContent.trim().startsWith("{")) {
        try {
          contentToSave = JSON.parse(currentContent);
        } catch {
          // Se falhar, mantém como string (HTML)
        }
      }

      await saveStudy(study.id, {
        title,
        content: contentToSave,
        tags: selectedTags,
      });
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
    } catch (error) {
      console.error("Erro ao salvar estudo:", error);
    } finally {
      setIsSaving(false);
    }
  }, [study, title, currentContent, selectedTags, saveStudy]);

  // Auto-save a cada 30 segundos se houver alterações
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const timer = setTimeout(() => {
      handleSave();
    }, 30000);

    return () => clearTimeout(timer);
  }, [hasUnsavedChanges, handleSave]);

  // Interceptar navegação se houver mudanças não salvas
  const handleNavigate = useCallback(
    (href: string) => {
      if (hasUnsavedChanges) {
        setPendingNavigation(href);
        setShowExitConfirm(true);
      } else {
        router.push(href);
      }
    },
    [hasUnsavedChanges, router]
  );

  // Confirmar saída sem salvar
  const confirmExit = () => {
    setShowExitConfirm(false);
    if (pendingNavigation) {
      router.push(pendingNavigation);
    }
  };

  // Salvar e sair
  const saveAndExit = async () => {
    await handleSave();
    setShowExitConfirm(false);
    if (pendingNavigation) {
      router.push(pendingNavigation);
    }
  };

  // Cancelar saída
  const cancelExit = () => {
    setShowExitConfirm(false);
    setPendingNavigation(null);
  };

  // Toggle tag
  const toggleTag = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName]
    );
    setHasUnsavedChanges(true);
  };

  // Breadcrumbs
  const breadcrumbItems: BreadcrumbItem[] = study
    ? [
        { label: study.book_name, href: "/" },
        { label: `Capítulo ${study.chapter_number}` },
      ]
    : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="ml-3 text-gray-500">Carregando estudo...</span>
      </div>
    );
  }

  if (loadError || !study) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar estudo</h2>
          <p className="text-gray-600 mb-4">{loadError || "Estudo não encontrado"}</p>
          <Button onClick={() => router.push("/")}>Voltar para início</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modal de confirmação de saída */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Alterações não salvas
              </h2>
            </div>
            <p className="text-gray-600 mb-6">
              Você tem alterações não salvas neste estudo. Deseja salvar antes
              de sair?
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={cancelExit}>
                Cancelar
              </Button>
              <Button variant="outline" onClick={confirmExit}>
                Sair sem salvar
              </Button>
              <Button onClick={saveAndExit}>Salvar e sair</Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3">
          {/* Breadcrumbs */}
          <div className="mb-3">
            <Breadcrumbs items={breadcrumbItems} />
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              {/* Título editável */}
              <Input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                placeholder="Título do estudo..."
                className="text-lg font-semibold border-none shadow-none px-0 h-auto focus-visible:ring-0"
              />
            </div>

            <div className="flex items-center gap-3">
              {/* Indicador de status */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : hasUnsavedChanges ? (
                  <>
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span className="text-amber-600">Não salvo</span>
                  </>
                ) : lastSaved ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-green-600">Salvo</span>
                  </>
                ) : null}
              </div>

              {/* Botão de salvar */}
              <Button
                onClick={handleSave}
                disabled={!hasUnsavedChanges || isSaving}
                size="sm"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>

              {/* Botão de tags */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTagDropdown(!showTagDropdown)}
                >
                  <Tag className="w-4 h-4 mr-2" />
                  Tags
                  {selectedTags.length > 0 && (
                    <Badge className="ml-2" variant="secondary">
                      {selectedTags.length}
                    </Badge>
                  )}
                </Button>

                {showTagDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-2 max-h-64 overflow-y-auto">
                      {tagsLoading ? (
                        <div className="text-center py-4 text-gray-500 text-sm">Carregando...</div>
                      ) : availableTags.length === 0 ? (
                        <div className="text-center py-4 text-gray-500 text-sm">Nenhuma tag</div>
                      ) : (
                        availableTags.map((tag) => (
                          <button
                            key={tag.id}
                            onClick={() => toggleTag(tag.name)}
                            className={cn(
                              "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm",
                              "hover:bg-gray-50 transition-colors text-left",
                              selectedTags.includes(tag.name) && "bg-blue-50"
                            )}
                          >
                            <span
                              className="w-2 h-2 rounded-full"
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
                            {selectedTags.includes(tag.name) && (
                              <CheckCircle className="w-4 h-4 text-blue-600 ml-auto" />
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Botão voltar */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigate("/")}
              >
                Voltar
              </Button>
            </div>
          </div>

          {/* Tags selecionadas */}
          {selectedTags.length > 0 && (
            <div className="flex items-center gap-2 mt-3">
              {selectedTags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Editor */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <Editor
            initialContent={study.content || ""}
            onChange={handleContentChange}
          />
        </div>

        {/* Dicas */}
        <div className="mt-4 text-sm text-gray-500">
          <p>
            <strong>Dicas:</strong> Use{" "}
            <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">/</kbd>{" "}
            para adicionar ao backlog de estudos. Selecione texto e clique em
            &quot;Referenciar&quot; para criar links entre notas.
          </p>
        </div>
      </main>
    </div>
  );
}
