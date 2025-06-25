<template>
  <v-card
    v-if="filteredItems.length > 0 && search"
    class="drop-list-card"
    elevation="8"
  >
    <v-list>
      <v-list-item
        v-for="(item, i) in limitedItems"
        :key="i"
        :ref="`item-${i}`"
        density="compact"
        @click="$emit('select', item.name)"
      >
        <v-list-item-title>
          <span v-html="highlightText(item.name, search)" />
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script setup lang="ts">
  import type { Item } from '@/types/api'
  import { computed } from 'vue'

  interface Props {
    items: Item[]
    selectedApi: string
    selectedField: string
    search: string
    isKeyupArrowDown: boolean
  }

  const props = defineProps<Props>()

  defineEmits<{
    select: [name: string]
    reset: []
  }>()

  const LIMIT_AUTOCOMPLETE_ITEMS = 5

  // Filter items based on search
  const filteredItems = computed(() => {
    if (!props.search) return []

    const searchTerm = props.search.toLowerCase()
    return props.items.filter(item =>
      item.name.toLowerCase().includes(searchTerm),
    )
  })

  // Limit the number of items shown
  const limitedItems = computed(() =>
    filteredItems.value.slice(0, LIMIT_AUTOCOMPLETE_ITEMS),
  )

  // Highlight matching text
  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm) return text
    const regex = new RegExp(`(${searchTerm})`, 'gi')
    return text.replace(regex, '<span class="text-primary">$1</span>')
  }
</script>

<style scoped>
.drop-list-card {
  position: absolute;
  top: 100%;
  right: 0;
  left: 0;
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
}
</style>
