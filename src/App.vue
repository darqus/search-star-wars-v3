<script setup lang="ts">
  import { computed, onMounted } from 'vue'
  import Footer from '@/components/footer/Footer.vue'
  import Form from '@/components/form/Form.vue'
  import { useThemeStore } from '@/stores/theme'
  import {
    BGS, ROLES, SIDES,
  } from './state'

  // Use theme store
  const themeStore = useThemeStore()

  // Initialize theme on mount
  onMounted(() => {
    themeStore.initTheme()
  })

  const isDark = computed(() => themeStore.isDark)

  const side = computed(() => {
    return isDark.value ? SIDES.dark : SIDES.light
  })

  const role = computed(() => {
    return isDark.value ? ROLES.dark : ROLES.light
  })

  const bg = computed(() => {
    const currentBg = isDark.value ? BGS.dark : BGS.light

    const currentGradient = isDark.value
      ? '(rgba(0, 20, 40, 0.95), rgba(30, 10, 20, 0.9))'
      : '(rgba(200, 220, 240, 0.95), rgba(230, 210, 220, 0.9))'

    return `background-image: linear-gradient${currentGradient}, url("img/${currentBg}.jpg");
  background-position: center;
  background-size: cover;`
  })
</script>

<template>
  <v-app style="overflow: hidden;" :style="bg">
    <v-main>
      <Form :role="role" :side="side" />
    </v-main>
    <Footer :side="side" />
  </v-app>
</template>
