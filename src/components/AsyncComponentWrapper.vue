<script setup lang="ts">
  import { onErrorCaptured, ref } from 'vue'

  const loading = ref(true)
  const error = ref<Error | null>(null)

  // Set loading to false when component is mounted (after slot content is loaded)
  onErrorCaptured(err => {
    error.value = err as Error
    loading.value = false
    return true
  })

  // Use setTimeout to simulate async loading and prevent layout shifts
  setTimeout(() => {
    loading.value = false
  }, 300)
</script>

<template>
  <slot v-if="!loading" />
  <div v-else class="async-component-loader">
    <v-progress-circular
      color="primary"
      indeterminate
    />
  </div>
</template>

<style scoped>
.async-component-loader {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
}
</style>
