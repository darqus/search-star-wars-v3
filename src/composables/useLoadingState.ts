import { ref } from 'vue'

export function useLoadingState () {
  const isLoading = ref(false)
  const loadingStates = ref<Record<string, boolean>>({})

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  const setNamedLoading = (name: string, loading: boolean) => {
    loadingStates.value[name] = loading
  }

  const getNamedLoading = (name: string): boolean => {
    return loadingStates.value[name] || false
  }

  const isAnyLoading = (): boolean => {
    return isLoading.value || Object.values(loadingStates.value).some(Boolean)
  }

  const withLoading = async <T>(
    operation: () => Promise<T>,
    loadingName?: string,
  ): Promise<T> => {
    try {
      if (loadingName) {
        setNamedLoading(loadingName, true)
      } else {
        setLoading(true)
      }

      return await operation()
    } finally {
      if (loadingName) {
        setNamedLoading(loadingName, false)
      } else {
        setLoading(false)
      }
    }
  }

  const clearAllLoading = () => {
    isLoading.value = false
    loadingStates.value = {}
  }

  return {
    isLoading,
    loadingStates,
    setLoading,
    setNamedLoading,
    getNamedLoading,
    isAnyLoading,
    withLoading,
    clearAllLoading,
  }
}
