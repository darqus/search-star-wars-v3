<template>
  <v-app style="overflow: hidden;" :style="bg">
    <v-main>
      <Form :role="role" :side="side" />
    </v-main>
    <Footer :side="side" />
  </v-app>
</template>

<script setup lang="ts">
  import { computed, onMounted, watch } from 'vue'
  import { useTheme } from 'vuetify'
  import Footer from '@/components/footer/Footer.vue'
  import Form from '@/components/form/Form.vue'
  import getBrowserTheme from '@/utils/getBrowserTheme'
  import { getItem, setItem } from '@/utils/persistanceStorage'
  import setLinkIcons from '@/utils/setLinkIcons'
  import {
    BGS, ROLES, SIDES, THEMES,
  } from './state'

  const IS_THEME_DARK = 'isThemeDark'

  const theme = useTheme()

  const isDark = computed(() => theme.global.current.value.dark)

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

  onMounted(() => {
    const isLSDark = getItem<boolean>(IS_THEME_DARK)

    if (isLSDark === null) {
      const browserTheme = getBrowserTheme()
      const isBrowserThemeDark = browserTheme === THEMES.dark
      theme.global.name.value = isBrowserThemeDark ? 'dark' : 'light'
      setLinkIcons(isBrowserThemeDark)
    } else {
      theme.global.name.value = isLSDark ? 'dark' : 'light'
      setLinkIcons(isLSDark)
    }
  })

  watch(isDark, value => {
    setItem(IS_THEME_DARK, value)
    setLinkIcons(value)
  })
</script>
