<template>
  <v-card v-if="filteredItems.length > 0 && search">
    <v-list>
      <v-list-item-group>
        <v-list-item
          v-for="(item, i) in filteredItems"
          :key="i"
          :ref="(el) => setItemRef(el, i)"
          density="compact"
          @click="$emit('select', item[selectedField])"
        >
          <v-list-item-title>
            <HighlightSearch :search="getSearch(item[selectedField])" />
          </v-list-item-title>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-card>
</template>

<script setup lang="ts">
  import { computed, nextTick, ref, watch } from 'vue'
  import { getHighlightedStringFromPhrase, isMatchesStringFromPhrase } from '@/utils/transformData'
  import HighlightSearch from './HighlightSearch.vue'

  interface Props {
    items: any[]
    selectedApi: string
    selectedField: string
    search: string
    isKeyupArrowDown: boolean
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    select: [value: string]
    reset: []
  }>()

  const LIMIT_AUTOCOMPLETE_ITEMS = 5
  const itemRefs = ref<any[]>([])

  const filteredItems = computed(() => {
    return props.items
      .filter(item => isMatchesStringFromPhrase(item[props.selectedField], props.search))
      .filter((it, idx) => idx < LIMIT_AUTOCOMPLETE_ITEMS)
  })

  watch(() => props.isKeyupArrowDown, () => {
    onDropDown()
  })

  const setItemRef = (el: any, index: number) => {
    if (el) {
      itemRefs.value[index] = el
    }
  }

  const getSearch = (phrase: string): string[] => {
    return getHighlightedStringFromPhrase(phrase, props.search)
  }

  const onDropDown = () => {
    nextTick(() => {
      if (itemRefs.value[0]) {
        itemRefs.value[0].$el?.focus()
        emit('reset')
      }
    })
  }
</script>
