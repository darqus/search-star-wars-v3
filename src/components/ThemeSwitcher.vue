<template>
  <v-switch
    v-model="isDark"
    hide-details
    :label="label"
  />
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useTheme } from 'vuetify'

  interface Props {
    label?: string
  }

  defineProps<Props>()

  const theme = useTheme()

  const isDark = computed({
    get: () => theme.global.current.value.dark,
    set: (value: boolean) => {
      theme.global.name.value = value ? 'dark' : 'light'
    },
  })
</script>
