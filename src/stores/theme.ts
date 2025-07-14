import { computed, ref } from 'vue'
import { useTheme } from 'vuetify'

import { defineStore } from 'pinia'

import getBrowserTheme from '@/utils/getBrowserTheme'
import { getItem, setItem } from '@/utils/persistenceStorage'
import setLinkIcons from '@/utils/setLinkIcons'

import { THEMES } from '@/state'

const STORAGE_THEME_KEY = 'isThemeDark'

export const useThemeStore = defineStore('theme', () => {
  const theme = useTheme()

  // State
  const isInitialized = ref(false)

  // Computed
  const isDark = computed(() => theme.global.current.value.dark)

  // Actions
  function initTheme() {
    if (isInitialized.value) {
      return
    }

    const storedTheme = getItem<boolean>(STORAGE_THEME_KEY)

    if (storedTheme === null) {
      const browserTheme = getBrowserTheme()
      const isBrowserThemeDark = browserTheme === THEMES.dark

      setTheme(isBrowserThemeDark)
    } else {
      setTheme(storedTheme)
    }

    isInitialized.value = true
  }

  function setTheme(dark: boolean) {
    theme.global.name.value = dark ? 'dark' : 'light'
    setItem(STORAGE_THEME_KEY, dark)
    setLinkIcons(dark)
  }

  function toggleTheme() {
    setTheme(!isDark.value)
  }

  return {
    isDark,
    initTheme,
    setTheme,
    toggleTheme,
  }
})
