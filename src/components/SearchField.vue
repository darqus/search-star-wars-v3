<template>
  <div style="position: relative">
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
      v-if="searchResults.length > 0 && isShownDropDown"
      class="search-dropdown"
      flat
    >
      <v-list>
        <v-list-item
          v-for="(item, i) in searchResults"
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
  </div>
</template>

<script setup lang="ts">
  import { useSearch } from '@/composables/useSearch'

  interface Props {
    selectedApi: string
    isLoading: boolean
    density?: 'default' | 'comfortable' | 'compact'
  }

  defineProps<Props>()

  const {
    searchInput,
    isShownDropDown,
    searchResults,
    onSearchInputChange,
    onSearchBlur,
    onSelectFromDropList,
    highlightText,
  } = useSearch()
</script>

<style scoped>
.search-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  left: 0;
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
}
</style>
