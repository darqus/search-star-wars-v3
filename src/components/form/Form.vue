<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { useDisplay, useTheme } from 'vuetify'
  import Dialog from '@/components/Dialog.vue'
  import {
    API_URL,
    getDataFromApi,
    SEARCH_API_LIST,
  } from '@/components/form/getDataFromApi'
  import Link from '@/components/Link.vue'
  import Logo from '@/components/Logo.vue'
  import Mandala from '@/components/Mandala.vue'
  import createJSON from '@/utils/createJSON'
  import './scss/form.scss'

  interface Props {
    role: string
    side: string
  }

  const props = defineProps<Props>()

  const theme = useTheme()
  const display = useDisplay()

  const INPUT_DELAY = 500

  const items = ref<any[]>([])
  const HEADER_NAME_SHORT = 'Star Wars search'
  const HEADER_NAME_POSTFIX = 'in Galaxy'
  const selectedApi = ref(SEARCH_API_LIST[0].api)
  const selectedField = ref(SEARCH_API_LIST[0].searchFields[0])
  const selectedFields = ref(SEARCH_API_LIST[0].searchFields)
  const search = ref('')
  const timeout = ref<NodeJS.Timeout | null>(null)
  const isLoading = ref(false)
  const isShownDropDown = ref(false)
  const isKeyupArrowDown = ref(false)
  const defaultResult = '{}'
  const imgURL = ref<string | null>(null)
  const isDialogShow = ref(false)
  const currentPage = ref(1)
  const totalPages = ref(1)

  const isDark = computed(() => theme.global.current.value.dark)

  const result = computed(() => {
    if (items.value.length === 0) {
      clearResult()
      return ''
    }

    const findedSelected = items.value.find(
      item => item[selectedField.value] === search.value,
    )

    if (!findedSelected) {
      clearIMGURL()
      return ''
    }

    setIMGURL(findedSelected.url)
    return createJSON(findedSelected)
  })

  watch(selectedApi, () => {
    setSearchField()
  })

  const setSearchField = () => {
    const searchField = SEARCH_API_LIST.find(
      ({ api }) => api === selectedApi.value,
    )!.searchFields

    selectedField.value = searchField[0]
    selectedFields.value = searchField
    clearSearch()
  }

  const onSelect = (select: string) => {
    search.value = select
    isShownDropDown.value = false
    timeout.value = null
  }

  const onInput = (event: Event) => {
    const target = event.target as HTMLInputElement
    if (!target.value) return clearSearch()

    isShownDropDown.value = true

    if (timeout.value) clearTimeout(timeout.value)
    timeout.value = setTimeout(() => getData(), INPUT_DELAY)
  }

  const onKeyup = (event: KeyboardEvent) => {
    if (event.code === 'ArrowDown') {
      isKeyupArrowDown.value = true
    }
  }

  const getData = async () => {
    isLoading.value = true
    const response = await getDataFromApi(selectedApi.value, search.value, currentPage.value)
    items.value = response?.data
    totalPages.value = response?.info?.total ?? 1
    isLoading.value = false
  }

  const onPageChange = (page: number) => {
    currentPage.value = page
    getData()
  }

  // TODO: ref
  const setIMGURL = (url: string) => {
    /* const id = getIDfromApiUrl(url)
    const { imgApiPath } = SEARCH_API_LIST.find(
      ({ api }) => api === selectedApi.value,
    )!

    imgURL.value = `${RESOURCE_URL}/assets/img/${imgApiPath}/${id}.jpg` */
  }

  const onDialog = (value: boolean) => {
    isDialogShow.value = value
  }

  const clearIMGURL = () => {
    imgURL.value = null
  }

  const clearResult = () => {
  // defaultResult is constant
  }

  const clearSearch = () => {
    search.value = ''
    items.value = []
    timeout.value = null
    currentPage.value = 1
    totalPages.value = 1
  }

  getData()
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
          <Link :link="`${API_URL}/${selectedApi}`" :text="selectedApi" />
          <span>&nbsp;</span>
          <span>{{ HEADER_NAME_POSTFIX }}</span>
        </h1>
      </v-col>
    </v-row>

    <v-row style="position: relative; z-index: 2">
      <v-col cols="12" sm="4" xs="12">
        <v-select
          v-model="selectedApi"
          density="compact"
          item-title="api"
          item-value="api"
          :items="SEARCH_API_LIST"
          :label="`What you search, ${role}? May the Force be with you`"
        />
        <v-pagination
          v-if="totalPages > 1"
          v-model="currentPage"
          :length="totalPages"
          @update:model-value="onPageChange"
        />
      </v-col>
      <v-col cols="12" sm="4" xs="12">
        <v-select
          v-model="selectedField"
          density="compact"
          :items="selectedFields"
          label="Selected Field"
        />
      </v-col>
      <v-col cols="12" sm="4" style="position: relative" xs="12">
        <v-autocomplete
          v-model="search"
          v-model:search-input="search"
          clearable
          density="compact"
          :item-title="selectedField"
          :items="items"
          :label="`Search ${selectedApi}`"
          :loading="isLoading"
          @keyup="onKeyup"
          @update:search="onInput"
        />
      </v-col>
    </v-row>

    <v-row style="position: relative">
      <v-col>
        <template v-if="items.length > 0 && result !== defaultResult">
          <template v-if="imgURL">
            <div class="wrapper">
              <div :aria-label="selectedApi" class="img" role="img">
                <a
                  href="#"
                  @click.prevent="isDialogShow = !isDialogShow"
                  @keyup="isDialogShow = !isDialogShow"
                >
                  <img
                    v-for="item in 2"
                    :key="item"
                    :alt="selectedApi"
                    :src="imgURL"
                  >
                </a>
              </div>
            </div>
            <Dialog
              class="my-5"
              :is-dialog-show="isDialogShow"
              :result="result"
              :search="search"
              @dialog="onDialog"
            />
          </template>
        </template>
        <template v-if="!display.smAndDown.value">
          <Mandala :side="side" />
          <Mandala class-name="right" :side="side" />
        </template>
      </v-col>
    </v-row>
  </v-container>
</template>
