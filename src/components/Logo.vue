<template>
  <svg
    class="logo"
    :class="isDark ? 'dark' : 'light'"
    height="77.265"
    version="1.1"
    viewBox="0 0 72.026 34.441"
    width="161.58"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g transform="translate(87.836 -91.787)">
      <path :d="logoSvgPath" />
    </g>
  </svg>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useTheme } from 'vuetify'
  import logoSvgPath from '@/state/svgPaths'

  const theme = useTheme()
  const isDark = computed(() => theme.global.current.value.dark)
</script>

<style scoped>
.logo {
  filter: invert(0.12) sepia(0.5) drop-shadow(0 10px 8px rgb(0 0 0 / 50%));
  transform: scale(0.65);
}

.logo.dark {
  filter: invert(0.12) sepia(0.5)
    drop-shadow(0 10px 8px rgb(255 255 255 / 40%));
}

.logo.light {
  filter: invert(0.12) sepia(0.5) drop-shadow(0 10px 8px rgb(0 0 0 / 50%));
}

.logo path {
  fill: #fff;
}
</style>
