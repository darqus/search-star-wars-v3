import { computed, ref } from 'vue'

import { useStarWarsStore } from '@/stores/starWars'

import { SEARCH_DEBOUNCE_DELAY, SEARCH_DROPDOWN_DELAY, SEARCH_MIN_LENGTH } from '@/constants/form'

export function useSearch() {
  const starWarsStore = useStarWarsStore()

  const searchInput = ref('')
  const isShownDropDown = ref(false)

  let searchTimeout: ReturnType<typeof setTimeout>

  const searchResults = computed(() => starWarsStore.searchResults)

  const performSearch = (value: string) => {
    // console.log('🔍 Search input changed:', value)

    if (!value || value.length < SEARCH_MIN_LENGTH) {
      // console.log('❌ Search cleared or too short, clearing results')
      starWarsStore.searchResults = []
      isShownDropDown.value = false

      return
    }

    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(async () => {
      try {
        // console.log('🔍 Performing search for:', value)
        // console.log('📡 Selected API:', starWarsStore.selectedApi)

        starWarsStore.setSearchTerm(value)
        await starWarsStore.fetchSearchResults(value)

        if (starWarsStore.searchResults.length > 0) {
          isShownDropDown.value = true
        }

        // console.log('✅ Search completed, results:', starWarsStore.searchResults.length)
        // console.log('📋 Search results:', starWarsStore.searchResults.map(item => item.name))
      } catch {
        // console.error('❌ Search failed:', error)
        isShownDropDown.value = false
      }
    }, SEARCH_DEBOUNCE_DELAY)
  }

  const onSearchInputChange = (event: Event) => {
    const { value } = event.target as HTMLInputElement

    searchInput.value = value
    performSearch(value)
  }

  const onSearchBlur = () => {
    setTimeout(() => {
      isShownDropDown.value = false
    }, SEARCH_DROPDOWN_DELAY)
  }

  const onSelectFromDropList = async (selectedName: string) => {
    await starWarsStore.selectFromSearch(selectedName)
    searchInput.value = ''
    isShownDropDown.value = false
  }

  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm) {
      return text
    }

    const regex = new RegExp(`(${searchTerm})`, 'gi')

    return text.replace(regex, '<span class="text-primary">$1</span>')
  }

  const clearSearch = () => {
    searchInput.value = ''
    isShownDropDown.value = false
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
  }

  return {
    searchInput,
    isShownDropDown,
    searchResults,
    onSearchInputChange,
    onSearchBlur,
    onSelectFromDropList,
    highlightText,
    clearSearch,
  }
}
