import { toast } from 'sonner'

export const showToast = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  warning: (message: string) => toast.warning(message),
  info: (message: string) => toast.info(message),
  loading: (message: string) => toast.loading(message),
  dismiss: (toastId?: string | number) => toast.dismiss(toastId),
}

// Exemplo de uso com promise
export const toastPromise = <T,>(
  promise: Promise<T>,
  messages: { loading: string; success: string; error: string }
) => toast.promise(promise, messages)

// Re-export toast for direct usage
export { toast }
