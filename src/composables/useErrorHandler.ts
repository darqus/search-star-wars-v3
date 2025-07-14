import { ref } from 'vue'

export type ErrorHandlerOptions = {
  showToast?: boolean
  logError?: boolean
  defaultMessage?: string
}

export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const { showToast = true, logError = true, defaultMessage = 'An error occurred' } = options

  const error = ref<string | null>(null)
  const isError = ref(false)

  const handleError = (err: unknown, customMessage?: string) => {
    const message = customMessage || getErrorMessage(err) || defaultMessage

    if (logError) {
      console.error('Error occurred:', err)
    }

    error.value = message
    isError.value = true

    if (showToast) {
      // В будущем можно добавить интеграцию с toast системой
      console.warn('Toast notification:', message)
    }

    return message
  }

  const clearError = () => {
    error.value = null
    isError.value = false
  }

  const getErrorMessage = (err: unknown): string => {
    if (typeof err === 'string') {
      return err
    }

    if (err instanceof Error) {
      return err.message
    }

    if (err && typeof err === 'object' && 'message' in err) {
      return String(err.message)
    }

    return ''
  }

  return {
    error,
    isError,
    handleError,
    clearError,
  }
}
