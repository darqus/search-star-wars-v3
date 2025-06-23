<script setup lang="ts">
  import { computed } from 'vue'
  import { useThemeStore } from '@/stores/theme'

  interface Props {
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
    hide-details
    :label="label"
  />
</template>
