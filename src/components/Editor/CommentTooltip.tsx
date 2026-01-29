"use client";

/**
 * Tooltip para visualizar, editar e excluir comentarios inline
 *
 * - Desktop: aparece no hover sobre texto com mark 'comment'
 * - Mobile: aparece no tap
 * - Nao aparece quando BubbleMenu esta ativo (selecao de texto)
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { Pencil, Trash2, MessageSquare, X } from "lucide-react";
import type { Editor } from "@tiptap/react";
import { cn } from "@/lib/utils";
import { COLORS, BORDERS, SHADOW_CLASSES } from "@/lib/design-tokens";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface CommentData {
  commentId: string;
  commentText: string;
  createdAt: string;
  rect: DOMRect;
}

interface CommentTooltipProps {
  editor: Editor;
}

export function CommentTooltip({ editor }: CommentTooltipProps) {
  const [comment, setComment] = useState<CommentData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Limpar timeout ao desmontar
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  // Focus na textarea ao entrar em modo edicao
  useEffect(() => {
    if (isEditing) {
      editTextareaRef.current?.focus();
    }
  }, [isEditing]);

  // Detectar hover/click em elementos com comment-highlight
  useEffect(() => {
    const editorElement = editor.view.dom;

    const handleMouseEnter = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target.classList.contains("comment-highlight")) return;

      // Nao mostrar tooltip se ha selecao ativa (BubbleMenu tem prioridade)
      if (!editor.state.selection.empty) return;

      // Delay de 200ms para evitar flickering
      hoverTimeoutRef.current = setTimeout(() => {
        const commentId = target.getAttribute("data-comment-id");
        const commentText = target.getAttribute("data-comment-text");
        const createdAt = target.getAttribute("data-comment-created-at");

        if (commentId && commentText) {
          setComment({
            commentId,
            commentText,
            createdAt: createdAt || "",
            rect: target.getBoundingClientRect(),
          });
        }
      }, 200);
    };

    const handleMouseLeave = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target.classList.contains("comment-highlight")) return;

      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }

      // Verificar se mouse foi para o tooltip (nao fechar nesse caso)
      setTimeout(() => {
        if (tooltipRef.current?.matches(":hover")) return;
        if (!isEditing && !showDeleteConfirm) {
          setComment(null);
        }
      }, 100);
    };

    // Mobile: click em vez de hover
    const handleClick = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target.classList.contains("comment-highlight")) return;

      // Nao mostrar se ha selecao ativa
      if (!editor.state.selection.empty) return;

      const commentId = target.getAttribute("data-comment-id");
      const commentText = target.getAttribute("data-comment-text");
      const createdAt = target.getAttribute("data-comment-created-at");

      if (commentId && commentText) {
        e.preventDefault();
        e.stopPropagation();
        setComment({
          commentId,
          commentText,
          createdAt: createdAt || "",
          rect: target.getBoundingClientRect(),
        });
      }
    };

    editorElement.addEventListener("mouseover", handleMouseEnter);
    editorElement.addEventListener("mouseout", handleMouseLeave);
    editorElement.addEventListener("click", handleClick);

    return () => {
      editorElement.removeEventListener("mouseover", handleMouseEnter);
      editorElement.removeEventListener("mouseout", handleMouseLeave);
      editorElement.removeEventListener("click", handleClick);
    };
  }, [editor, isEditing, showDeleteConfirm]);

  // Fechar tooltip ao clicar fora (mobile)
  useEffect(() => {
    if (!comment) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        if (!isEditing && !showDeleteConfirm) {
          setComment(null);
        }
      }
    };

    // Delay para nao conflitar com o click que abriu o tooltip
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 50);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [comment, isEditing, showDeleteConfirm]);

  // Fechar ao mudar selecao (BubbleMenu vai aparecer)
  useEffect(() => {
    const handleSelectionUpdate = () => {
      if (!editor.state.selection.empty) {
        setComment(null);
        setIsEditing(false);
      }
    };

    editor.on("selectionUpdate", handleSelectionUpdate);
    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor]);

  // Encontrar posicao do mark no documento por commentId
  const findCommentRange = useCallback((commentId: string) => {
    let from = -1;
    let to = -1;

    editor.state.doc.descendants((node, pos) => {
      if (from !== -1) return false; // ja encontrou
      if (node.marks) {
        for (const mark of node.marks) {
          if (mark.type.name === "comment" && mark.attrs.commentId === commentId) {
            from = pos;
            to = pos + node.nodeSize;
            return false;
          }
        }
      }
    });

    return from !== -1 ? { from, to } : null;
  }, [editor]);

  // Editar comentario
  const handleEdit = useCallback(() => {
    if (!comment) return;
    setEditText(comment.commentText);
    setIsEditing(true);
  }, [comment]);

  // Salvar edicao
  const handleSaveEdit = useCallback(() => {
    if (!comment || !editText.trim()) return;

    const range = findCommentRange(comment.commentId);
    if (!range) return;

    // Selecionar o range do mark e atualizar attrs
    editor
      .chain()
      .focus()
      .setTextSelection(range)
      .updateAttributes("comment", { commentText: editText.trim() })
      .run();

    setComment((prev) =>
      prev ? { ...prev, commentText: editText.trim() } : null
    );
    setIsEditing(false);
  }, [comment, editText, editor, findCommentRange]);

  // Excluir comentario
  const handleDelete = useCallback(() => {
    if (!comment) return;

    const range = findCommentRange(comment.commentId);
    if (!range) return;

    // Selecionar range e remover mark (texto permanece)
    editor
      .chain()
      .focus()
      .setTextSelection(range)
      .unsetMark("comment")
      .run();

    setComment(null);
    setShowDeleteConfirm(false);
    setIsEditing(false);
  }, [comment, editor, findCommentRange]);

  if (!comment) return null;

  // Calcular posicao do tooltip
  const tooltipStyle: React.CSSProperties = {
    position: "fixed",
    left: `${comment.rect.left + comment.rect.width / 2}px`,
    top: `${comment.rect.top - 8}px`,
    transform: "translate(-50%, -100%)",
    zIndex: 50,
  };

  return (
    <>
      <div
        ref={tooltipRef}
        style={tooltipStyle}
        className={cn(
          "bg-white rounded-lg p-3 max-w-xs min-w-[200px]",
          SHADOW_CLASSES.lg,
          BORDERS.gray
        )}
        onMouseLeave={() => {
          if (!isEditing && !showDeleteConfirm) {
            setComment(null);
          }
        }}
      >
        {isEditing ? (
          // Modo edicao
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs font-medium text-gray-600">
                Editar comentario
              </span>
            </div>
            <textarea
              ref={editTextareaRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={3}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handleSaveEdit();
                }
                if (e.key === "Escape") {
                  setIsEditing(false);
                }
              }}
              className={cn(
                "w-full px-2 py-1.5 text-sm rounded resize-none focus:outline-none focus:ring-2 focus:ring-amber-500",
                BORDERS.gray
              )}
            />
            <div className="flex items-center justify-between mt-2">
              <button
                onClick={() => setIsEditing(false)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!editText.trim()}
                className={cn(
                  "px-3 py-1 text-xs text-white rounded transition-colors disabled:opacity-50",
                  "bg-amber-600 hover:bg-amber-700"
                )}
              >
                Salvar
              </button>
            </div>
          </div>
        ) : (
          // Modo visualizacao
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-xs text-gray-400">Comentario</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleEdit}
                  className="p-1 rounded hover:bg-gray-100 transition-colors"
                  title="Editar comentario"
                >
                  <Pencil className="w-3.5 h-3.5 text-gray-500" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-1 rounded hover:bg-red-50 transition-colors"
                  title="Excluir comentario"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                </button>
                <button
                  onClick={() => setComment(null)}
                  className="p-1 rounded hover:bg-gray-100 transition-colors"
                  title="Fechar"
                >
                  <X className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </div>
            </div>
            <p className={cn("text-sm leading-relaxed", COLORS.neutral.text.primary)}>
              {comment.commentText}
            </p>
            {comment.createdAt && (
              <p className="text-xs text-gray-400 mt-1.5">
                {new Date(comment.createdAt).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Modal de confirmacao de exclusao */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir comentario?</AlertDialogTitle>
            <AlertDialogDescription>
              O comentario sera removido permanentemente. O texto original do estudo sera preservado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteConfirm(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
