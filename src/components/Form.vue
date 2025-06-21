<template>
  <v-container>
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
          :menu-props="{ auto: true, offsetY: true }"
        />
      </v-col>
      <v-col cols="12" sm="4" xs="12">
        <v-select
          v-model="selectedField"
          density="compact"
          :items="selectedFields"
          label="Selected Field"
          :menu-props="{ auto: true, offsetY: true }"
        />
      </v-col>
      <v-col cols="12" sm="4" style="position: relative" xs="12">
        <v-text-field
          v-model="search"
          clearable
          density="compact"
          :label="`Search ${selectedApi}`"
          :loading="isLoading"
          @input="onInput"
          @keyup="onKeyup"
        />
        <DropList
          v-if="items.length > 0 && isShownDropDown"
          class="drop-list"
          :is-keyup-arrow-down="isKeyupArrowDown"
          :items="items"
          :search="search"
          :selected-api="selectedApi"
          :selected-field="selectedField"
          @reset="isKeyupArrowDown = false"
          @select="onSelect"
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
                    :onerror="`this.onerror=null;this.src='${IMG_PLACEHOLDER}';`"
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

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { useDisplay, useTheme } from 'vuetify'
  import Dialog from '@/components/Dialog.vue'
  import DropList from '@/components/DropList.vue'
  import Link from '@/components/Link.vue'
  import Logo from '@/components/Logo.vue'
  import Mandala from '@/components/Mandala.vue'
  import createJSON from '@/utils/createJSON'
  import {
    API_URL,
    getDataFromApi,
    IMG_PLACEHOLDER,
    RESOURCE_URL,
    SEARCH_API_LIST,
    type SearchApiItem,
  } from '@/utils/getDataFromApi'
  import { getIDfromApiUrl } from '@/utils/transformData'

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
    const response = await getDataFromApi(selectedApi.value, search.value)
    const responseItems = response?.results?.map(item => ({ ...item.fields, url: item.fields.url }))
    if (responseItems?.length) {
      items.value = responseItems
    }
    isLoading.value = false
  }

  const setIMGURL = (url: string) => {
    const id = getIDfromApiUrl(url)
    const { imgApiPath } = SEARCH_API_LIST.find(
      ({ api }) => api === selectedApi.value,
    )!

    imgURL.value = `${RESOURCE_URL}/assets/img/${imgApiPath}/${id}.jpg`
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
  }
</script>

<style scoped>
.header-text {
  font-size: clamp(2vw, 2.5rem, 100%);
  font-weight: 700;
}

.header-text.dark {
  color: #fff;
  text-shadow: 3px -1px 14px rgb(255 255 255 / 60%);
}

.header-text.light {
  color: rgb(23 99 161);
  text-shadow: 1px 1px 4px rgb(0 0 0 / 50%);
}

.drop-list {
  position: absolute !important;
  right: 0.8rem;
  left: 0.8rem;
}

.wrapper {
  position: relative;
  inset: 0;
  z-index: 1;
  display: grid;
  place-content: center;
  place-items: center;
  width: 100%;
  height: 100%;
}

.img {
  position: relative;
  width: clamp(9vw, 60vh, 90vw);
  height: clamp(9vw, 60vh, 90vw);
  cursor: pointer;
  opacity: 0.6;
}

.img img {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  box-shadow: 0 5px 8px rgb(255 255 255 / 5%);
  opacity: 0.5;
  transition: 0.5s ease-in-out;
}

.img img:nth-child(2) {
  z-index: -1;
  opacity: 0.25;
  filter: blur(6px);
  transform: scale(1.15);
}

.img:hover img:nth-child(2) {
  filter: blur(4px);
  transform: scale(1.1);
}
</style>
