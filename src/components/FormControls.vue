<template>
  <v-row style="position: relative; z-index: 2">
    <v-col cols="12" sm="3" xs="12">
      <v-select
        v-model="selectedApi"
        :density="density"
        item-title="api"
        item-value="api"
        :items="apiEndpoints"
        :label="`What you search, ${role}? May the Force be with you`"
        :menu-props="{ scrim: true, scrollStrategy: 'close' }"
        @update:model-value="onApiSelectHandler"
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
        @click:clear="onClearSelection"
        @update:model-value="onSelect"
      />
    </v-col>
    <v-col cols="12" sm="3" style="position: relative" xs="12">
      <SearchField
        :density="density"
        :is-loading="isLoading"
        :selected-api="selectedApi"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
  import SearchField from '@/components/SearchField.vue'
  import { useSearch } from '@/composables/useSearch'
  import { useStarWarsForm } from '@/composables/useStarWarsForm'
  import { API_ENDPOINTS } from '@/constants/api'

  interface Props {
    role: string
    density?: 'default' | 'comfortable' | 'compact'
  }

  defineProps<Props>()

  const { clearSearch } = useSearch()
  const {
    items,
    selectedApi,
    selectedItem,
    selectInput,
    currentPage,
    totalPages,
    isLoading,
    onSelect,
    onPageChange,
    onApiSelect,
    onClearSelection,
  } = useStarWarsForm()

  const apiEndpoints = API_ENDPOINTS

  const onApiSelectHandler = () => {
    onApiSelect()
    clearSearch()
  }
</script>
