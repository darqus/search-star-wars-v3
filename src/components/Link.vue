<script setup lang="ts">
type Props = {
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

<template>
  <a
    :href="link"
    :style="fontSizeRem > 0 ? `font-size: ${fontSizeRem}rem;` : ''"
    target="_blank"
  >
    {{ text }}
  </a>
</template>
