<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted } from 'vue'

import { useThemeStore } from '@/stores/theme'

import AsyncComponentWrapper from '@/components/AsyncComponentWrapper.vue'

import { BGS, ROLES, SIDES } from './state'

// Lazy loaded components with loading indicator
/* const CacheControls = defineAsyncComponent({
    loader: () => import('@/components/CacheControls.vue'),
    loadingComponent: AsyncComponentWrapper,
    delay: 300,
    timeout: 10_000,
  }) */

const Footer = defineAsyncComponent({
  loader: () => import('@/components/footer/Footer.vue'),
  loadingComponent: AsyncComponentWrapper,
  delay: 200,
  timeout: 10_000,
})

const Form = defineAsyncComponent({
  loader: () => import('@/components/form/AppForm.vue'),
  loadingComponent: AsyncComponentWrapper,
  delay: 200,
  timeout: 10_000,
})

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

  return `background-image: linear-gradient${currentGradient}, url("img/${currentBg}.webp");
  background-position: center;
  background-size: cover;`
})
</script>

<template>
  <v-app
    :style="bg"
    style="overflow: hidden"
  >
    <v-main>
      <!-- <v-container>
        <v-row>
          <v-col cols="12">
            <CacheControls />
          </v-col>
        </v-row>
      </v-container> -->
      <Form
        :role="role"
        :side="side"
      />
    </v-main>
    <Footer :side="side" />
  </v-app>
</template>
