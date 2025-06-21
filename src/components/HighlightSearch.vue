<template>
  <span>
    <span v-if="search[0]">{{ search[0] }}</span>
    <span
      :class="
        isDark
          ? 'text-light-blue-darken-1'
          : 'text-light-blue-lighten-3'
      "
    >
      {{ search[1] }}
    </span>
    <span>{{ search[2] }}</span>
  </span>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useTheme } from 'vuetify'

  interface Props {
    search: string[]
  }

  defineProps<Props>()

  const theme = useTheme()
  const isDark = computed(() => theme.global.current.value.dark)
</script>
