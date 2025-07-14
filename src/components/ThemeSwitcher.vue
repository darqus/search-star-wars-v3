<script setup lang="ts">
import { computed } from 'vue'

import { useThemeStore } from '@/stores/theme'

type Props = {
  label?: string
}

defineProps<Props>()

const themeStore = useThemeStore()

const isDark = computed({
  get: () => themeStore.isDark,
  set: (value: boolean) => {
    themeStore.setTheme(value)
  },
})
</script>

<template>
  <v-switch
    v-model="isDark"
    :label="label"
    hide-details
  />
</template>
