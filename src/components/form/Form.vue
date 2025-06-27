<script setup lang="ts">
  import { defineAsyncComponent, onMounted, onUnmounted, ref } from 'vue'
  import FormControls from '@/components/FormControls.vue'
  import ResultDisplay from '@/components/ResultDisplay.vue'
  import { useStarWarsForm } from '@/composables/useStarWarsForm'
  import { COMPONENT_DELAY_FAST, COMPONENT_DELAY_MEDIUM, FORM_DENSITY, HEADER_NAME_POSTFIX, HEADER_NAME_SHORT } from '@/constants/form'
  import { useThemeStore } from '@/stores/theme'
  import './scss/form.scss'

  // Lazy loaded components with loading indicators
  const Dialog = defineAsyncComponent({
    loader: () => import('@/components/Dialog.vue'),
    delay: COMPONENT_DELAY_MEDIUM,
  })

  const Link = defineAsyncComponent({
    loader: () => import('@/components/Link.vue'),
    delay: COMPONENT_DELAY_FAST,
  })

  const Logo = defineAsyncComponent({
    loader: () => import('@/components/Logo.vue'),
    delay: COMPONENT_DELAY_FAST,
  })

  const Mandala = defineAsyncComponent({
    loader: () => import('@/components/Mandala.vue'),
    delay: COMPONENT_DELAY_MEDIUM,
  })

  interface Props {
    role: string
    side: string
  }

  defineProps<Props>()

  const themeStore = useThemeStore()
  const {
    items,
    selectedApi,
    selectedItem,
    imgURL,
    result,
    isLoading,
    error,
    fetchItems,
  } = useStarWarsForm()

  const isDialogShow = ref(false)

  const density = FORM_DENSITY
  const API_URL = import.meta.env.VITE_APP_API_BASE_URL

  const isDark = () => themeStore.isDark

  const onDialog = (value: boolean) => {
    isDialogShow.value = value
  }

  const onShowDialog = () => {
    isDialogShow.value = !isDialogShow.value
  }

  onMounted(() => {
    fetchItems()
  })

  onUnmounted(() => {
    // Cleanup is handled in composables
  })
</script>

<template>
  <v-container class="search-form">
    <v-row style="align-items: center;">
      <v-col cols="12" sm="4" xs="12">
        <Logo />
      </v-col>
      <v-col cols="12" sm="8" xs="12">
        <div class="d-flex align-center justify-space-between">
          <h1 class="header-text" :class="isDark() ? 'dark' : 'light'">
            <span>{{ HEADER_NAME_SHORT }}</span>
            <span>&nbsp;</span>
            <Link class="header-links" :link="`${API_URL}/${selectedApi}`" :text="selectedApi" />
            <span>&nbsp;</span>
            <span>{{ HEADER_NAME_POSTFIX }}</span>
          </h1>
        </div>
      </v-col>
    </v-row>

    <FormControls
      :density="density"
      :role="role"
    />

    <v-row>
      <v-col>
        <ResultDisplay
          :error="error"
          :img-u-r-l="imgURL"
          :is-loading="isLoading"
          :items="items"
          :selected-item="selectedItem"
          @show-dialog="onShowDialog"
        />
        <Dialog
          v-if="imgURL && selectedItem"
          class="my-5"
          :is-dialog-show="isDialogShow"
          :result="result"
          :search="selectedItem!"
          @dialog="onDialog"
        />
        <template v-if="!$vuetify.display.smAndDown">
          <Mandala :side="side" />
          <Mandala class-name="right" :side="side" />
        </template>
      </v-col>
    </v-row>
  </v-container>
</template>

<style>
.header-links {
  color: v-bind('isDark() ? "lightblue" : "rgb(36, 125, 199)"');
}
</style>
