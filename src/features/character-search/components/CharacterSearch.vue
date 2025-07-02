<template>
  <div class="character-search">
    <div class="search-header">
      <h2 class="search-title">
        Поиск {{ endpointTitle }}
      </h2>

      <v-text-field
        clearable
        :error-messages="error"
        label="Введите поисковый запрос"
        :loading="isLoading"
        :model-value="searchQuery"
        :placeholder="`Минимум ${minQueryLength} символа`"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        @click:clear="clearSearch"
        @keyup.enter="searchImmediate(searchQuery)"
        @update:model-value="onSearchInput"
      />
    </div>

    <div v-if="isLoading" class="search-loading">
      <v-progress-circular
        color="primary"
        indeterminate
        size="64"
      />
      <p class="text-center mt-4">
        Поиск персонажей...
      </p>
    </div>

    <div v-else-if="error" class="search-error">
      <v-alert
        closable
        type="error"
        variant="tonal"
        @click:close="clearResults"
      >
        {{ error }}

        <template #append>
          <v-btn
            size="small"
            variant="outlined"
            @click="retrySearch"
          >
            Повторить
          </v-btn>
        </template>
      </v-alert>
    </div>

    <div v-else-if="isEmpty && searchQuery" class="search-empty">
      <v-empty-state
        icon="mdi-magnify"
        :text="`По запросу '${searchQuery}' не найдено результатов`"
        title="Ничего не найдено"
      >
        <template #actions>
          <v-btn
            variant="outlined"
            @click="clearSearch"
          >
            Очистить поиск
          </v-btn>
        </template>
      </v-empty-state>
    </div>

    <div v-else-if="searchResults.length > 0" class="search-results">
      <div class="results-header">
        <p class="results-count">
          Найдено {{ totalCount }} результатов
          <span v-if="totalCount > searchResults.length">
            (показано {{ searchResults.length }})
          </span>
        </p>

        <v-btn
          size="small"
          variant="outlined"
          @click="clearSearch"
        >
          Очистить
        </v-btn>
      </div>

      <div class="results-grid">
        <CharacterCard
          v-for="character in searchResults"
          :key="character.id"
          :character="character"
          @click="onCharacterSelect(character)"
        />
      </div>

      <div v-if="totalCount > searchResults.length" class="results-pagination">
        <v-pagination
          :disabled="isLoading"
          :length="totalPages"
          :model-value="currentPage"
          @update:model-value="goToPage"
        />
      </div>
    </div>

    <div v-else-if="!searchQuery" class="search-prompt">
      <v-empty-state
        icon="mdi-file-search-outline"
        :text="`Введите минимум ${minQueryLength} символа для поиска ${endpointTitle.toLowerCase()}`"
        title="Начните поиск"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { Character } from '../domain/entities/Character'

  import { computed, onMounted, onUnmounted, watchEffect } from 'vue'
  import { characterSearchFeature, createCharacterSearch } from '../index'

  import CharacterCard from './CharacterCard.vue'

  /**
   * Component props
   */
  interface Props {
    endpoint: string
    pageSize?: number
    minQueryLength?: number
    debounceMs?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    pageSize: 20,
    minQueryLength: 3,
    debounceMs: 500,
  })

  /**
   * Component emits
   */
  interface Emits {
    'character-select': [character: Character]
    'search-state-change': [state: { isLoading: boolean, hasResults: boolean }]
  }

  const emit = defineEmits<Emits>()

  /**
   * Setup character search feature
   */
  onMounted(() => {
    try {
      characterSearchFeature.setup()
    } catch (error) {
      console.error('Failed to setup character search:', error)
    }
  })

  onUnmounted(() => {
    characterSearchFeature.cleanup()
  })

  /**
   * Create search composable with configuration
   */
  const {
    searchQuery,
    isLoading,
    searchResults,
    error,
    isEmpty,
    totalCount,
    currentPage,
    onSearchInput,
    searchImmediate,
    goToPage,
    clearSearch,
    clearResults,
    retrySearch,
  } = createCharacterSearch(props.endpoint, {
    minQueryLength: props.minQueryLength,
    debounceMs: props.debounceMs,
    pageSize: props.pageSize,
  })

  /**
   * Computed properties
   */
  const endpointTitle = computed(() => {
    const titles: Record<string, string> = {
      characters: 'персонажей',
      creatures: 'существ',
      droids: 'дроидов',
      locations: 'локаций',
      organizations: 'организаций',
      species: 'видов',
      vehicles: 'транспорта',
    }
    return titles[props.endpoint] || props.endpoint
  })

  const totalPages = computed(() => {
    return Math.ceil(totalCount.value / props.pageSize)
  })

  /**
   * Handle character selection
   */
  const onCharacterSelect = (character: Character): void => {
    emit('character-select', character)
  }

  /**
   * Watch search state changes
   */
  watchEffect(() => {
    emit('search-state-change', {
      isLoading: isLoading.value,
      hasResults: searchResults.value.length > 0,
    })
  })
</script>

<style scoped lang="scss">
.character-search {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.search-header {
  margin-bottom: 2rem;
}

.search-title {
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: 600;
}

.search-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.search-error {
  margin-bottom: 2rem;
}

.search-empty,
.search-prompt {
  padding: 3rem;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.results-count {
  font-size: 0.9rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
  margin: 0;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.results-pagination {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .character-search {
    padding: 0.5rem;
  }

  .results-grid {
    grid-template-columns: 1fr;
  }

  .results-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
}
</style>
