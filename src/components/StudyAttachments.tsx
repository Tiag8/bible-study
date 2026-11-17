'use client';

import { useState, type ChangeEvent } from 'react';
import { FileText, Loader2, Paperclip, Plus, RotateCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { PARCHMENT } from '@/lib/design-tokens';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { useAttachments } from '@/hooks/useAttachments';
import {
  ATTACHMENT_ACCEPT,
  formatFileSize,
  isPreviewableImage,
  type Attachment,
} from '@/lib/attachments';

interface StudyAttachmentsProps {
  studyId: string;
}

/** Files and images stored with a study (review PDFs, photos of notes, etc.). */
export function StudyAttachments({ studyId }: StudyAttachmentsProps) {
  const { attachments, loading, uploading, error, uploadAttachments, removeAttachment, refetch } =
    useAttachments(studyId);
  const [toDelete, setToDelete] = useState<Attachment | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    // Reset so choosing the same file again fires onChange.
    event.target.value = '';
    if (files.length === 0) return;

    const { uploaded, errors } = await uploadAttachments(files);
    if (uploaded > 0) {
      toast.success(uploaded === 1 ? 'Arquivo anexado' : `${uploaded} arquivos anexados`);
    }
    errors.forEach((message) => toast.error(message));
  };

  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    const success = await removeAttachment(toDelete);
    setDeleting(false);
    if (success) {
      toast.success('Anexo removido');
      setToDelete(null);
    } else {
      toast.error('Erro ao remover o anexo');
    }
  };

  return (
    <section
      aria-labelledby="attachments-title"
      className="mt-6 bg-cream rounded-lg shadow-sm border border-linen p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          id="attachments-title"
          className={cn('flex items-center gap-2 text-base font-lora font-semibold', PARCHMENT.text.heading)}
        >
          <Paperclip className="w-4 h-4" aria-hidden="true" />
          Anexos
          {attachments.length > 0 && (
            <span className={cn('text-sm font-normal', PARCHMENT.text.muted)}>({attachments.length})</span>
          )}
        </h2>

        <label
          className={cn(
            'inline-flex items-center justify-center gap-2 rounded-md border px-3 min-h-[44px] text-sm font-medium transition-colors',
            PARCHMENT.border.default,
            PARCHMENT.text.subheading,
            'hover:bg-warm-white focus-within:ring-2 focus-within:ring-amber focus-within:ring-offset-1',
            uploading ? 'opacity-60 cursor-wait' : 'cursor-pointer'
          )}
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          ) : (
            <Plus className="w-4 h-4" aria-hidden="true" />
          )}
          {uploading ? 'Enviando...' : 'Anexar'}
          <input
            type="file"
            multiple
            accept={ATTACHMENT_ACCEPT}
            className="sr-only"
            onChange={handleFiles}
            disabled={uploading}
            aria-label="Anexar arquivos ou imagens a este estudo"
          />
        </label>
      </div>

      <div className="mt-3">
        {loading ? (
          <p className={cn('text-sm', PARCHMENT.text.muted)}>Carregando anexos...</p>
        ) : error ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-red-700">Não foi possível carregar os anexos.</p>
            <button
              type="button"
              onClick={refetch}
              className={cn(
                'inline-flex items-center gap-2 rounded-md border px-3 min-h-[44px] text-sm',
                PARCHMENT.border.default,
                'hover:bg-warm-white focus:outline-none focus:ring-2 focus:ring-amber'
              )}
            >
              <RotateCw className="w-4 h-4" aria-hidden="true" />
              Tentar de novo
            </button>
          </div>
        ) : attachments.length === 0 ? (
          <p className={cn('text-sm', PARCHMENT.text.muted)}>
            Nenhum anexo ainda. Guarde aqui PDFs, imagens e outros arquivos deste estudo.
          </p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {attachments.map((attachment) => (
              <li
                key={attachment.path}
                className="flex items-center gap-1 rounded-md border border-linen bg-warm-white pl-2"
              >
                <a
                  href={attachment.url ?? undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 min-w-0 items-center gap-3 py-2 min-h-[56px] rounded focus:outline-none focus:ring-2 focus:ring-amber"
                  aria-label={`Abrir ${attachment.name}`}
                >
                  {isPreviewableImage(attachment.mimeType) && attachment.url ? (
                    // Signed Storage URL: next/image would need a remote pattern and adds nothing here.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={attachment.url}
                      alt=""
                      loading="lazy"
                      className="w-10 h-10 shrink-0 rounded object-cover border border-linen"
                    />
                  ) : (
                    <span className="flex w-10 h-10 shrink-0 items-center justify-center rounded bg-amber-light">
                      <FileText className="w-5 h-5 text-amber-dark" aria-hidden="true" />
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className={cn('block truncate text-sm font-medium', PARCHMENT.text.primary)}>
                      {attachment.name}
                    </span>
                    <span className={cn('block text-xs', PARCHMENT.text.secondary)}>
                      {formatFileSize(attachment.size)}
                    </span>
                  </span>
                </a>
                <button
                  type="button"
                  onClick={() => setToDelete(attachment)}
                  className="flex shrink-0 items-center justify-center min-h-[44px] min-w-[44px] rounded text-stone hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-600"
                  aria-label={`Remover ${attachment.name}`}
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmModal
        open={toDelete !== null}
        onConfirm={handleConfirmDelete}
        onCancel={() => setToDelete(null)}
        title="Remover anexo?"
        description={`Tem certeza que deseja remover "${toDelete?.name ?? ''}"? Esta ação não pode ser desfeita.`}
        confirmText="Remover"
        cancelText="Cancelar"
        variant="destructive"
        isLoading={deleting}
      />
    </section>
  );
}
