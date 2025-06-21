<template>
  <a
    :href="link"
    :style="fontSizeRem > 0 ? `font-size: ${fontSizeRem}rem;` : ''"
    target="_blank"
  >
    {{ text }}
  </a>
</template>

<script setup lang="ts">
  interface Props {
    link?: string
    text?: string
    fontSizeRem?: number
  }

  withDefaults(defineProps<Props>(), {
    link: '#',
    text: '',
    fontSizeRem: -1,
  })
</script>
