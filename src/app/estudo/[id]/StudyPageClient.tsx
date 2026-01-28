"use client";

import { useState, useEffect, useCallback, useRef, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { COLORS } from "@/lib/design-tokens";
import { Editor, EditorHandle } from "@/components/Editor";
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
  Plus,
  Pencil,
  Check,
  X,
  Trash2,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";
import { CreateTagModal } from "@/components/CreateTagModal";
import { ConfirmModal } from "@/components/ui/confirm-modal";

interface StudyPageProps {
  params: Promise<{ id: string }>;
}

export function StudyPageClient({ params }: StudyPageProps) {
  const { id } = use(params);
  const router = useRouter();

  // Hooks Supabase
  const { getStudyById, createStudy, saveStudy, updateStudyStatus, deleteStudy } = useStudies();
  const { tags: availableTags, loading: tagsLoading, createTag } = useTags();
  const searchParams = useSearchParams();

  // Estado do estudo
  const [study, setStudy] = useState<StudyWithContent | null>(null);
  const [title, setTitle] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(""); // Título temporário durante edição
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showCreateTagModal, setShowCreateTagModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // Sempre string JSON para consistência
  const [currentContent, setCurrentContent] = useState<string>("");

  // Estado de edição
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Confirmação de saída
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  // Confirmação de delete
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Undo/Redo state
  const editorRef = useRef<EditorHandle>(null);
  const [canUndo, setCanUndo] = useState(false);

  // Estado para guardar o bookId
  const [bookId, setBookId] = useState<string>("");
  // Estado para guardar info de novo estudo (quando id === 'new')
  const [newStudyInfo, setNewStudyInfo] = useState<{
    bookName: string;
    chapterNumber: number;
  } | null>(null);

  // Carregar estudo
  useEffect(() => {
    async function loadStudy() {
      setIsLoading(true);

      try {
        let studyData: StudyWithContent | null = null;
        let book = null;

        if (id === 'new') {
          // Rota de criação: /estudo/new?book=X&chapter=Y
          const bookParam = searchParams.get('book');
          const chapterParam = searchParams.get('chapter');

          if (!bookParam || !chapterParam) {
            console.error("[ESTUDO] Missing book or chapter params");
            router.push('/');
            return;
          }

          book = getBookById(bookParam);
          if (!book) {
            console.error("[ESTUDO] Book not found:", bookParam);
            router.push('/');
            return;
          }

          const chapter = parseInt(chapterParam, 10);
          console.log("[ESTUDO] Preparando novo estudo:", book.name, chapter);

          // NÃO criar estudo aqui - apenas preparar o estado
          // O estudo será criado no primeiro save com conteúdo
          setBookId(bookParam);
          setTitle(`${book.name} ${chapter}`);
          setNewStudyInfo({ bookName: book.name, chapterNumber: chapter });
          setStudy(null); // Explicitamente null para novo estudo
          setCurrentContent("");
          setIsLoading(false);
          setIsInitialLoad(true);
          return;
        } else {
          // Rota de edição: /estudo/{uuid}
          console.log("[ESTUDO] Loading study by ID:", id);
          studyData = await getStudyById(id);

          if (!studyData) {
            setLoadError("Estudo não encontrado");
            setIsLoading(false);
            return;
          }

          // Buscar o livro usando book_name do estudo
          const { getBookByName } = await import("@/lib/mock-data");
          book = getBookByName(studyData.book_name);

          if (book) {
            setBookId(book.id);
          }
        }

        if (!studyData) {
          setLoadError("Erro ao carregar estudo");
          return;
        }

        console.log("[ESTUDO] Study loaded:", studyData.id);
        setStudy(studyData);
        setTitle(studyData.title);
        setSelectedTags(studyData.tags || []);

        // Normalizar content para sempre ser string JSON
        const contentStr = studyData.content
          ? (typeof studyData.content === 'string'
              ? studyData.content
              : JSON.stringify(studyData.content))
          : "";
        setCurrentContent(contentStr);
        setIsInitialLoad(true);
      } catch (error) {
        console.error("[ESTUDO] loadStudy ERROR:", error);
        setLoadError(error instanceof Error ? error.message : "Erro ao carregar estudo");
      } finally {
        setIsLoading(false);
      }
    }
    loadStudy();
  }, [id, router, getStudyById, createStudy, searchParams]);

  // Resetar isInitialLoad quando editor estiver pronto (após carregar estudo OU novo estudo)
  useEffect(() => {
    // Para estudos existentes: esperar study carregar
    // Para novos estudos: esperar newStudyInfo estar definido
    const isReady = !isLoading && (study || newStudyInfo) && isInitialLoad;

    if (isReady) {
      // Aguardar próximo tick para garantir que Editor montou e aplicou conteúdo
      const timer = setTimeout(() => {
        console.log("[ESTUDO] Editor ready - resetting isInitialLoad");
        setIsInitialLoad(false);
      }, 100); // 100ms é suficiente para o editor aplicar o conteúdo

      return () => clearTimeout(timer);
    }
  }, [isLoading, study, newStudyInfo, isInitialLoad]);

  // Salvar automaticamente (debounced)
  const handleContentChange = useCallback((content: string) => {
    if (isInitialLoad) {
      console.log("[ESTUDO] handleContentChange - ignoring initial load (editor not ready yet)");
      setCurrentContent(content);
      return;
    }
    console.log("[ESTUDO] handleContentChange - marking unsaved");
    setCurrentContent(content);
    setHasUnsavedChanges(true);
  }, [isInitialLoad]);

  // Interceptar cliques em links internos (bible-graph:// e /estudo/)
  useEffect(() => {
    const handleLinkClick = (e: Event) => {
      if (!(e instanceof MouseEvent)) return;

      const target = e.target as HTMLElement;

      // Buscar elemento <a> mais próximo (pode estar em spans filhos)
      const link = target.closest('a[href^="/estudo/"]') ||
                   target.closest('a[href^="bible-graph://"]');

      if (link instanceof HTMLAnchorElement) {
        const href = link.getAttribute('href');
        console.log('🔗 Link clicado:', href);

        // Caso 1: Link interno novo (/estudo/{id})
        if (href?.startsWith('/estudo/')) {
          console.log('✅ Navegando para:', href);
          e.preventDefault();
          router.push(href);
          return;
        }

        // Caso 2: Link antigo (bible-graph://study/{id})
        if (href?.startsWith('bible-graph://study/')) {
          console.log('✅ Convertendo para:', href.replace('bible-graph://study/', ''));
          e.preventDefault();
          const studyId = href.replace('bible-graph://study/', '');
          router.push(`/estudo/${studyId}`);
          return;
        }
      }
    };

    // Tentar encontrar e registrar listener (com retry)
    let attempts = 0;
    const maxAttempts = 5;

    const tryRegisterListener = () => {
      const editorElement = document.querySelector('.tiptap');
      attempts++;

      if (editorElement) {
        editorElement.addEventListener('click', handleLinkClick);
        console.log('✅ [Tentativa', attempts + '] Listener registrado no .tiptap');
      } else if (attempts < maxAttempts) {
        console.log('⏳ [Tentativa', attempts + '] .tiptap não encontrado, retry em 500ms...');
        setTimeout(tryRegisterListener, 500);
      } else {
        console.warn('❌ .tiptap não encontrado após', maxAttempts, 'tentativas');
      }
    };

    tryRegisterListener();

    // Cleanup: quando component unmount, remover listeners de TODOS elementos .tiptap
    return () => {
      document.querySelectorAll('.tiptap').forEach((el) => {
        el.removeEventListener('click', handleLinkClick);
      });
    };
  }, [router]);

  // Função de salvamento
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    const toastId = toast.loading("Salvando...");

    try {
      // Verificar se o conteúdo está vazio (Story 3.8 validation)
      const isEmpty = !currentContent ||
                     currentContent === '""' ||
                     currentContent === '{}' ||
                     currentContent.trim() === '' ||
                     currentContent === '{"type":"doc","content":[]}';

      // Se for novo estudo (study === null) e não tem conteúdo, avisar usuário
      if (!study?.id && isEmpty) {
        toast.error("Estudo não pode estar vazio", { id: toastId });
        setIsSaving(false);
        return;
      }

      // Se for estudo existente e fica vazio após edição, rejeitar
      if (study?.id && isEmpty) {
        toast.error("Estudo não pode estar vazio", { id: toastId });
        setIsSaving(false);
        return;
      }

      // Parsear content de string JSON para objeto (currentContent é sempre string agora)
      let contentToSave: StudyWithContent["content"] | undefined;
      if (currentContent && currentContent.trim().startsWith("{")) {
        try {
          contentToSave = JSON.parse(currentContent) as StudyWithContent["content"];
        } catch (e) {
          console.error("[ESTUDO] JSON parse error:", e);
          // Se falhar, não atualiza content para evitar gravar dado inválido
        }
      }

      // Se é novo estudo (study?.id === null), criar primeiro
      if (!study?.id && newStudyInfo) {
        console.log("[ESTUDO] Criando novo estudo no primeiro save:", newStudyInfo.bookName, newStudyInfo.chapterNumber);
        const newStudy = await createStudy(
          newStudyInfo.bookName,
          newStudyInfo.chapterNumber,
          title
        );

        if (newStudy) {
          // Salvar conteúdo e tags no estudo recém-criado
          await saveStudy(newStudy.id, {
            title,
            ...(contentToSave ? { content: contentToSave } : {}),
            tags: selectedTags,
          });

          toast.success("Estudo criado com sucesso!", { id: toastId });
          console.log("[ESTUDO] Estudo criado e salvo. Redirecionando para:", newStudy.id);
          // Redirecionar para o estudo criado
          router.replace(`/estudo/${newStudy.id}`);
          return;
        } else {
          toast.error("Erro ao criar estudo. Tente novamente.", { id: toastId });
        }
      } else if (study?.id) {
        // Estudo já existe - save normal
        await saveStudy(study.id, {
          title,
          ...(contentToSave ? { content: contentToSave } : {}),
          tags: selectedTags,
        });
        setHasUnsavedChanges(false);
        setLastSaved(new Date());
        toast.success("Salvo com sucesso!", { id: toastId });
      }
    } catch (error) {
      console.error("Erro ao salvar estudo:", error);
      toast.error("Erro ao salvar. Tente novamente.", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  }, [study, title, currentContent, selectedTags, saveStudy, newStudyInfo, createStudy, router]);

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

  // Voltar para o livro
  const handleBackToBook = useCallback(() => {
    const backHref = bookId ? `/?book=${bookId}` : '/';
    handleNavigate(backHref);
  }, [bookId, handleNavigate]);

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

  // Deletar estudo
  const handleDeleteStudy = useCallback(async () => {
    if (!study?.id) return;

    setIsDeleting(true);
    const toastId = toast.loading("Deletando estudo...");

    try {
      const success = await deleteStudy(study.id);
      if (success) {
        toast.success("Estudo deletado com sucesso!", { id: toastId });
        setShowDeleteConfirm(false);
        // Redirecionar para o livro ou dashboard
        router.push(bookId ? `/?book=${bookId}` : "/");
      } else {
        toast.error("Erro ao deletar estudo. Tente novamente.", { id: toastId });
      }
    } catch (error) {
      console.error("[ESTUDO] deleteStudy ERROR:", error);
      toast.error("Erro ao deletar estudo. Tente novamente.", { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  }, [study?.id, deleteStudy, router, bookId]);

  // Undo ação
  const handleUndo = useCallback(() => {
    editorRef.current?.undo();
  }, []);

  // Toggle tag
  const toggleTag = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName]
    );
    setHasUnsavedChanges(true);
  };

  // Criar nova tag
  const handleCreateTag = async (
    name: string,
    type: 'Versículos' | 'Temas' | 'Princípios',
    color: string
  ) => {
    const newTag = await createTag(name, type, color);
    if (newTag) {
      // Adicionar automaticamente a tag ao estudo atual
      toggleTag(newTag.name);
    }
  };

  // Helper para buscar cor da tag
  const getTagColor = (tagName: string): string => {
    const tag = availableTags.find((t) => t.name === tagName);
    if (!tag) return "#6b7280"; // gray-500 default

    const colorMap: Record<string, string> = {
      blue: "#3b82f6",
      purple: "#8b5cf6",
      green: "#22c55e",
      orange: "#f97316",
      pink: "#ec4899",
      cyan: "#06b6d4",
      red: "#ef4444",
      yellow: "#eab308",
      "dark-green": "#15803d",
    };

    return colorMap[tag.color] || "#6b7280";
  };

  // Edição de título
  const startEditingTitle = () => {
    setTempTitle(title);
    setIsEditingTitle(true);
  };

  const saveTitle = () => {
    setTitle(tempTitle);
    setHasUnsavedChanges(true);
    setIsEditingTitle(false);
  };

  const cancelEditingTitle = () => {
    setTempTitle("");
    setIsEditingTitle(false);
  };

  // Breadcrumbs
  const breadcrumbItems: BreadcrumbItem[] = study
    ? [
        { label: study.book_name, href: bookId ? `/?book=${bookId}` : '/' },
        { label: `Capítulo ${study.chapter_number}` },
      ]
    : newStudyInfo
    ? [
        { label: newStudyInfo.bookName, href: bookId ? `/?book=${bookId}` : '/' },
        { label: `Capítulo ${newStudyInfo.chapterNumber}` },
      ]
    : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {/* TOKENS: COLORS.primary, COLORS.neutral */}
        <Loader2 className={cn("w-8 h-8 animate-spin", COLORS.primary.text)} />
        <span className={cn("ml-3", COLORS.neutral.text.muted)}>Carregando estudo...</span>
      </div>
    );
  }

  // Mostrar erro apenas se houver erro real OU se não tem study E não é novo estudo
  if (loadError || (!study && !newStudyInfo)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className={cn("text-lg font-semibold mb-2", COLORS.neutral.text.primary)}>Erro ao carregar estudo</h2>
          <p className={cn("mb-4", COLORS.neutral.text.secondary)}>{loadError || "Estudo não encontrado"}</p>
          <Button onClick={() => router.push("/")}>Voltar para início</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" key={id}>
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

      {/* Modal de confirmação de delete */}
      <ConfirmModal
        open={showDeleteConfirm}
        onConfirm={handleDeleteStudy}
        onCancel={() => setShowDeleteConfirm(false)}
        title="Deletar estudo?"
        description={`Tem certeza que deseja deletar "${study?.title || 'este estudo'}"? Esta ação não pode ser desfeita.`}
        confirmText="Deletar"
        cancelText="Cancelar"
        variant="destructive"
        isLoading={isDeleting}
      />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3">
          {/* Breadcrumbs */}
          <div className="mb-3">
            <Breadcrumbs items={breadcrumbItems} />
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              {/* Título - modo display ou edição */}
              {isEditingTitle ? (
                <>
                  <Input
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    placeholder="Título do estudo..."
                    className="text-lg font-semibold border-gray-300 shadow-sm px-3 h-10 focus-visible:ring-2 focus-visible:ring-blue-500"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={saveTitle}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={cancelEditingTitle}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <h1 className="text-lg font-semibold text-gray-900">
                    {title || "Sem título"}
                  </h1>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={startEditingTitle}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </>
              )}
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

              {/* Botão de undo */}
              <Button
                onClick={handleUndo}
                disabled={!canUndo}
                variant="ghost"
                size="sm"
                title="Desfazer (Ctrl+Z)"
              >
                <Undo2 className="w-4 h-4" />
              </Button>

              {/* Botão de salvar */}
              <Button
                onClick={handleSave}
                disabled={!hasUnsavedChanges || isSaving}
                size="sm"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>

              {/* Dropdown de status */}
              <div className="relative">
                <button
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  disabled={!study?.id}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-md font-medium transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-offset-2",
                    "text-white",
                    !study?.id && "bg-gray-300 cursor-not-allowed",
                    study?.status === 'estudar' && "bg-orange-500 hover:bg-orange-600 focus:ring-orange-500",
                    study?.status === 'estudando' && "bg-blue-500 hover:bg-blue-600 focus:ring-blue-500",
                    study?.status === 'revisando' && "bg-purple-500 hover:bg-purple-600 focus:ring-purple-500",
                    study?.status === 'concluído' && "bg-green-500 hover:bg-green-600 focus:ring-green-500"
                  )}
                >
                  {!study?.id && 'Novo'}
                  {study?.status === 'estudar' && 'Estudar'}
                  {study?.status === 'estudando' && 'Estudando'}
                  {study?.status === 'revisando' && 'Revisando'}
                  {study?.status === 'concluído' && 'Concluído'}
                </button>

                {showStatusDropdown && study && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-2">
                      <button
                        onClick={async () => {
                          await updateStudyStatus(study.id, 'estudar');
                          setStudy({ ...study, status: 'estudar' });
                          setShowStatusDropdown(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm",
                          "hover:bg-gray-50 transition-colors text-left",
                          study.status === 'estudar' && "bg-orange-50"
                        )}
                      >
                        <span className="w-3 h-3 rounded-full bg-orange-500" />
                        <span className="text-gray-900">Estudar</span>
                      </button>

                      <button
                        onClick={async () => {
                          await updateStudyStatus(study.id, 'estudando');
                          setStudy({ ...study, status: 'estudando' });
                          setShowStatusDropdown(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm",
                          "hover:bg-gray-50 transition-colors text-left",
                          study.status === 'estudando' && "bg-blue-50"
                        )}
                      >
                        <span className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-gray-900">Estudando</span>
                      </button>

                      <button
                        onClick={async () => {
                          await updateStudyStatus(study.id, 'revisando');
                          setStudy({ ...study, status: 'revisando' });
                          setShowStatusDropdown(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm",
                          "hover:bg-gray-50 transition-colors text-left",
                          study.status === 'revisando' && "bg-purple-50"
                        )}
                      >
                        <span className="w-3 h-3 rounded-full bg-purple-500" />
                        <span className="text-gray-900">Revisando</span>
                      </button>

                      <button
                        onClick={async () => {
                          await updateStudyStatus(study.id, 'concluído');
                          setStudy({ ...study, status: 'concluído' });
                          setShowStatusDropdown(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm",
                          "hover:bg-gray-50 transition-colors text-left",
                          study.status === 'concluído' && "bg-green-50"
                        )}
                      >
                        <span className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-gray-900">Concluído</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Botão de delete */}
              {study?.id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  disabled={isDeleting}
                  aria-label={`Deletar estudo "${study.title || 'sem título'}"`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}

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
                                    : tag.color === "orange"
                                    ? "#f97316"
                                    : tag.color === "pink"
                                    ? "#ec4899"
                                    : tag.color === "cyan"
                                    ? "#06b6d4"
                                    : tag.color === "red"
                                    ? "#ef4444"
                                    : tag.color === "yellow"
                                    ? "#eab308"
                                    : tag.color === "dark-green"
                                    ? "#15803d"
                                    : "#22c55e",
                              }}
                            />
                            <span className="text-gray-900">{tag.name}</span>
                            {selectedTags.includes(tag.name) && (
                              <CheckCircle className="w-4 h-4 text-blue-600 ml-auto" />
                            )}
                          </button>
                        ))
                      )}

                      {/* Botão "Nova Tag" */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowTagDropdown(false);
                          setShowCreateTagModal(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm mt-2 border-t border-gray-200 pt-3 hover:bg-gray-50 transition-colors text-blue-600 font-medium"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Nova Tag</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Botão voltar */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToBook}
              >
                Voltar
              </Button>
            </div>
          </div>

          {/* Tags selecionadas */}
          {selectedTags.length > 0 && (
            <div className="flex items-center gap-2 mt-3">
              {selectedTags.map((tag) => {
                const tagColor = getTagColor(tag);
                return (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium"
                    style={{
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: tagColor,
                      color: tagColor,
                      backgroundColor: 'transparent',
                    }}
                  >
                    #{tag}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </header>

      {/* Editor */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <Editor
            ref={editorRef}
            initialContent={study?.content || ""}
            onChange={handleContentChange}
            onUndoRedoChange={(canUndo) => setCanUndo(canUndo)}
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

      {/* Modal de criar tag */}
      <CreateTagModal
        isOpen={showCreateTagModal}
        onClose={() => setShowCreateTagModal(false)}
        onCreateTag={handleCreateTag}
      />
    </div>
  );
}
