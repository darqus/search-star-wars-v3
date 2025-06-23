<script setup lang="ts">
  import type { Item } from '@/types/api'
  import { computed, onMounted, ref } from 'vue'
  import { useDisplay, useTheme } from 'vuetify'
  import Dialog from '@/components/Dialog.vue'
  import Link from '@/components/Link.vue'
  import Logo from '@/components/Logo.vue'
  import Mandala from '@/components/Mandala.vue'
  import { useStarWarsApi } from '@/composables/useStarWarsApi'
  import { API_ENDPOINTS, DEFAULT_PAGE_SIZE } from '@/constants/api'
  import './scss/form.scss'

  interface Props {
    role: string
    side: string
  }

  defineProps<Props>()

  const theme = useTheme()
  const display = useDisplay()
  const { isLoading, error, fetchData, preloadImage } = useStarWarsApi()

  const items = ref<Item[]>([])
  const selectedApi = ref(API_ENDPOINTS[0].api)
  const selectedItem = ref<Item>()
  const searchInput = ref<string>()
  const imgURL = ref('')
  const imgLoaded = ref(false)
  const result = ref('')
  const isDialogShow = ref(false)
  const currentPage = ref(1)
  const totalPages = ref(1)

  const density = 'compact' as const
  const HEADER_NAME_SHORT = 'Star Wars search'
  const HEADER_NAME_POSTFIX = 'in Galaxy'

  const isDark = computed(() => theme.global.current.value.dark)
  const API_URL = import.meta.env.VITE_APP_API_BASE_URL

  const onSelect = async (item: Item) => {
    if (!item) {
      imgURL.value = ''
      result.value = ''
      imgLoaded.value = false
      return
    }
    if (!item.image) return

    try {
      imgLoaded.value = false
      await preloadImage(item.image)
      imgURL.value = item.image
      imgLoaded.value = true
      result.value = JSON.stringify(item, null, 2)
    } catch (error_) {
      console.error('Failed to load image:', error_)
    }
  }

  const getData = async () => {
    try {
      const response = await fetchData(selectedApi.value, currentPage.value, DEFAULT_PAGE_SIZE)
      items.value = response.data
      totalPages.value = response.info.total

      if (items.value.length > 0) {
        selectedItem.value = items.value[0]
        await onSelect(items.value[0])
      } else {
        selectedItem.value = undefined
        imgURL.value = ''
        result.value = ''
        imgLoaded.value = false
      }
    } catch (error_) {
      console.error('Failed to fetch data:', error_)
    }
  }

  const onPageChange = (page: number) => {
    currentPage.value = page
    getData()
  }

  const onApiSelect = () => {
    currentPage.value = 1
    getData()
  }

  const onDialog = (value: boolean) => {
    isDialogShow.value = value
  }

  onMounted(() => {
    getData()
  })
</script>

<template>
  <v-container class="search-form">
    <v-row align="center">
      <v-col cols="12" sm="4" xs="12">
        <Logo />
      </v-col>
      <v-col cols="12" sm="8" xs="12">
        <h1 class="header-text" :class="isDark ? 'dark' : 'light'">
          <span>{{ HEADER_NAME_SHORT }}</span>
          <span>&nbsp;</span>
          <Link class="links" :link="`${API_URL}/${selectedApi}`" :text="selectedApi" />
          <span>&nbsp;</span>
          <span>{{ HEADER_NAME_POSTFIX }}</span>
        </h1>
      </v-col>
    </v-row>

    <v-row style="position: relative; z-index: 2">
      <v-col cols="12" sm="4" xs="12">
        <v-select
          v-model="selectedApi"
          :density="density"
          item-title="api"
          item-value="api"
          :items="API_ENDPOINTS"
          :label="`What you search, ${role}? May the Force be with you`"
          :menu-props="{ scrim: true, scrollStrategy: 'close' }"
          @update:model-value="onApiSelect"
        />
      </v-col>
      <v-col cols="12" sm="4" style="position: relative" xs="12">
        <v-pagination
          v-if="totalPages > 1"
          v-model="currentPage"
          :density="density"
          :length="totalPages"
          @update:model-value="onPageChange"
        />
      </v-col>
      <v-col cols="12" sm="4" style="position: relative" xs="12">
        <v-autocomplete
          v-model="selectedItem"
          v-model:search-input="searchInput"
          clearable
          :density="density"
          :item-title="'name'"
          :items="items"
          :label="`Search ${selectedApi}`"
          :loading="isLoading"
          :menu-props="{ scrim: true, scrollStrategy: 'close' }"
          return-object
          @update:model-value="onSelect"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <div class="wrapper">
          <template v-if="isLoading">
            <v-progress-circular indeterminate :size="display.smAndDown.value ? 400 : 600" />
          </template>
          <template v-else-if="items.length > 0 && imgURL && selectedItem && imgLoaded">
            <transition mode="out-in" name="scale">
              <div :key="imgURL" :aria-label="selectedItem.name" class="img" role="img">
                <a
                  href="#"
                  @click.prevent="isDialogShow = !isDialogShow"
                  @keyup="isDialogShow = !isDialogShow"
                >
                  <img
                    v-for="item in 2"
                    :key="item"
                    :alt="selectedItem.name"
                    :src="imgURL"
                  >
                </a>
              </div>
            </transition>
          </template>
          <template v-else-if="error">
            <v-alert type="error">{{ error }}</v-alert>
          </template>
        </div>
        <Dialog
          v-if="imgURL && selectedItem"
          class="my-5"
          :is-dialog-show="isDialogShow"
          :result="result"
          :search="selectedItem"
          @dialog="onDialog"
        />
        <template v-if="!display.smAndDown.value">
          <Mandala :side="side" />
          <Mandala class-name="right" :side="side" />
        </template>
      </v-col>
    </v-row>
  </v-container>
</template>

<style>
.links {
  color: v-bind(isDark ? 'lightblue' : 'rgb(36, 125, 199)');
}

.scale-enter-active, .scale-leave-active {
  transition: transform 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.scale-enter-from, .scale-leave-to {
  transform: scale(0);
}
</style>
