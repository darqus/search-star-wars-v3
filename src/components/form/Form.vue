<script setup lang="ts">
  import type { Item } from '@/types/api'
  import { computed, defineAsyncComponent, onMounted, onUnmounted, ref } from 'vue'
  import { useDisplay } from 'vuetify'
  import { API_ENDPOINTS } from '@/constants/api'
  import { useStarWarsStore } from '@/stores/starWars'
  import { useThemeStore } from '@/stores/theme'
  import './scss/form.scss'

  // Lazy loaded components with loading indicators
  const Dialog = defineAsyncComponent({
    loader: () => import('@/components/Dialog.vue'),
    delay: 200,
  })

  const Link = defineAsyncComponent({
    loader: () => import('@/components/Link.vue'),
    delay: 100,
  })

  const Logo = defineAsyncComponent({
    loader: () => import('@/components/Logo.vue'),
    delay: 100,
  })

  const Mandala = defineAsyncComponent({
    loader: () => import('@/components/Mandala.vue'),
    delay: 200,
  })

  interface Props {
    role: string
    side: string
  }

  defineProps<Props>()

  const display = useDisplay()
  const themeStore = useThemeStore()
  const starWarsStore = useStarWarsStore()

  const isDialogShow = ref(false)

  const density = 'compact' as const
  const HEADER_NAME_SHORT = 'Star Wars search'
  const HEADER_NAME_POSTFIX = 'in Galaxy'

  const isDark = computed(() => themeStore.isDark)
  const API_URL = import.meta.env.VITE_APP_API_BASE_URL

  // Computed properties для доступа к состоянию хранилища
  const items = computed(() => starWarsStore.filteredItems)
  const selectedApi = computed({
    get: () => starWarsStore.selectedApi,
    set: value => starWarsStore.setApiEndpoint(value),
  })
  const selectedItem = computed({
    get: () => starWarsStore.selectedItem,
    set: value => value && starWarsStore.selectItem(value),
  })
  const selectInput = computed({
    get: () => starWarsStore.selectInput,
    set: value => starWarsStore.setSearchTerm(value || ''),
  })
  const imgURL = computed(() => starWarsStore.imgURL)
  const result = computed(() => starWarsStore.result)
  const currentPage = computed({
    get: () => starWarsStore.currentPage,
    set: value => starWarsStore.setPage(value),
  })
  const totalPages = computed(() => starWarsStore.totalPages)
  const isLoading = computed(() => starWarsStore.isLoading)
  const error = computed(() => starWarsStore.error)

  // Additional state for text field search functionality
  const searchInput = ref('')
  const isShownDropDown = ref(false)

  // Computed for search results
  const searchAutocompleteItems = computed(() => starWarsStore.searchResults)

  // Debounced search function for text field
  let searchTimeout: ReturnType<typeof setTimeout>
  const onSearchInputChange = (event: Event) => {
    const value = (event.target as HTMLInputElement).value
    searchInput.value = value

    console.log('🔍 Search input changed:', value)

    if (!value || value.length < 3) {
      console.log('❌ Search cleared or too short, clearing results')
      starWarsStore.searchResults = []
      isShownDropDown.value = false
      return
    }

    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(async () => {
      try {
        console.log('🔍 Performing search for:', value)
        console.log('📡 Selected API:', starWarsStore.selectedApi)

        // Update store search term only when actually searching
        starWarsStore.setSearchTerm(value)

        // Fetch data with search term, no caching, and limit of 5 items
        await starWarsStore.fetchSearchResults(value)

        if (starWarsStore.searchResults.length > 0) {
          isShownDropDown.value = true
        }

        console.log('✅ Search completed, results:', starWarsStore.searchResults.length)
        console.log('📋 Search results:', starWarsStore.searchResults.map(item => item.name))
      } catch (error) {
        console.error('❌ Search failed:', error)
        isShownDropDown.value = false
      }
    }, 500)
  }

  // Handle blur event to hide dropdown
  const onSearchBlur = () => {
    // Use timeout to allow click on dropdown items before hiding
    setTimeout(() => {
      isShownDropDown.value = false
    }, 200)
  }

  // Handle selection from dropdown
  const onSelectFromDropList = async (selectedName: string) => {
    await starWarsStore.selectFromSearch(selectedName)
    searchInput.value = ''
    isShownDropDown.value = false
  }

  // Highlight matching text function
  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm) return text
    const regex = new RegExp(`(${searchTerm})`, 'gi')
    return text.replace(regex, '<span class="text-primary">$1</span>')
  }

  const onSelect = async (item: Item) => {
    if (item) await starWarsStore.selectItem(item)
  }

  const onPageChange = (page: number) => {
    starWarsStore.setPage(page)
  }

  const onApiSelect = () => {
    starWarsStore.setPage(1)
    // Clear search when API changes
    searchInput.value = ''
    isShownDropDown.value = false
  }

  const onDialog = (value: boolean) => {
    isDialogShow.value = value
  }

  onMounted(() => {
    starWarsStore.fetchItems()
  })

  onUnmounted(() => {
    // Clear search timeout when component is unmounted
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
  })
</script>

<template>
  <v-container class="search-form">
    <v-row align="center">
      <v-col cols="12" sm="4" xs="12">
        <Logo />
      </v-col>
      <v-col cols="12" sm="8" xs="12">
        <div class="d-flex align-center justify-space-between">
          <h1 class="header-text" :class="isDark ? 'dark' : 'light'">
            <span>{{ HEADER_NAME_SHORT }}</span>
            <span>&nbsp;</span>
            <Link class="links" :link="`${API_URL}/${selectedApi}`" :text="selectedApi" />
            <span>&nbsp;</span>
            <span>{{ HEADER_NAME_POSTFIX }}</span>
          </h1>
        </div>
      </v-col>
    </v-row>

    <v-row style="position: relative; z-index: 2">
      <v-col cols="12" sm="3" xs="12">
        <v-select
          v-model="selectedApi"
          :density="density"
          item-title="api"
          item-value="api"
          :items="API_ENDPOINTS"
          :label="`What you search, ${role}? May the Force be with you`"
          :menu-props="{ scrim: true, scrollStrategy: 'close' }"
          @update:model-value="onApiSelect"
        />
      </v-col>
      <v-col cols="12" sm="3" style="position: relative" xs="12">
        <v-pagination
          v-if="totalPages > 1"
          v-model="currentPage"
          :density="density"
          :length="totalPages"
          @update:model-value="onPageChange"
        />
      </v-col>
      <v-col cols="12" sm="3" style="position: relative" xs="12">
        <v-autocomplete
          v-model="selectedItem"
          v-model:search-input="selectInput"
          clearable
          :density="density"
          :item-title="'name'"
          :items="items"
          :label="`Select ${selectedApi}`"
          :loading="isLoading"
          :menu-props="{ scrim: true, scrollStrategy: 'close' }"
          return-object
          @update:model-value="onSelect"
        />
      </v-col>
      <v-col cols="12" sm="3" style="position: relative" xs="12">
        <v-text-field
          v-model="searchInput"
          clearable
          :density="density"
          :label="`Search ${selectedApi}`"
          :loading="isLoading"
          :menu-props="{ scrim: true, scrollStrategy: 'close' }"
          @blur="onSearchBlur"
          @input="onSearchInputChange"
        />
        <v-card
          v-if="searchAutocompleteItems.length > 0 && isShownDropDown"
          class="search-dropdown"
          flat
        >
          <v-list>
            <v-list-item
              v-for="(item, i) in searchAutocompleteItems"
              :key="i"
              density="compact"
              @click="onSelectFromDropList(item.name)"
            >
              <v-list-item-title>
                <span v-html="highlightText(item.name, searchInput)" />
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <div class="wrapper">
          <template v-if="isLoading">
            <v-progress-circular indeterminate :size="display.smAndDown.value ? 400 : 600" />
          </template>
          <template v-else-if="items.length > 0 && imgURL && selectedItem">
            <transition mode="out-in" name="scale">
              <div :key="imgURL" :aria-label="selectedItem.name" class="img" role="img">
                <a
                  href="#"
                  @click.prevent="isDialogShow = !isDialogShow"
                  @keyup="isDialogShow = !isDialogShow"
                >
                  <img
                    v-for="item in 2"
                    :key="item"
                    :alt="selectedItem.name"
                    :src="imgURL"
                  >
                </a>
              </div>
            </transition>
          </template>
          <template v-else-if="error">
            <v-alert type="error">{{ error }}</v-alert>
          </template>
        </div>
        <Dialog
          v-if="imgURL && selectedItem"
          class="my-5"
          :is-dialog-show="isDialogShow"
          :result="result"
          :search="selectedItem!"
          @dialog="onDialog"
        />
        <template v-if="!display.smAndDown.value">
          <Mandala :side="side" />
          <Mandala class-name="right" :side="side" />
        </template>
      </v-col>
    </v-row>
  </v-container>
</template>

<style>
.links {
  color: v-bind(isDark ? 'lightblue' : 'rgb(36, 125, 199)');
}

.search-dropdown {
  position: absolute;
  top: -20px;
  right: 0;
  left: 0;
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
}

.scale-enter-active, .scale-leave-active {
  transition: transform 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.scale-enter-from, .scale-leave-to {
  transform: scale(0);
}
</style>
