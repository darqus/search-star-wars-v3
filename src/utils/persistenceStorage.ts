export const getItem = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key)

    return item ? JSON.parse(item) : null
  } catch (error) {
    console.error('Error getting data from localStorage', error)

    return null
  }
}

export const setItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Error setting data to localStorage', error)
  }
}

export const removeItem = (key: string): void => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Error removing data from localStorage', error)
  }
}
