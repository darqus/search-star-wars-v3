<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useDisplay, useTheme } from 'vuetify'
  import Dialog from '@/components/Dialog.vue'
  import {
    API_URL,
    getDataFromApi,
    type Item,
    SEARCH_API_LIST,
  } from '@/components/form/getDataFromApi'
  import Link from '@/components/Link.vue'
  import Logo from '@/components/Logo.vue'
  import Mandala from '@/components/Mandala.vue'
  import './scss/form.scss'

  interface Props {
    role: string
    side: string
  }

  defineProps<Props>()

  const theme = useTheme()
  const display = useDisplay()

  const items = ref<Item[]>([])
  const HEADER_NAME_SHORT = 'Star Wars search'
  const HEADER_NAME_POSTFIX = 'in Galaxy'
  const selectedApi = ref(SEARCH_API_LIST[0].api)
  const search = ref<Item>()
  const isLoading = ref(false)
  const imgURL = ref('')
  const result = ref('')
  const defaultResult = ref('')
  const isDialogShow = ref(false)
  const onDialog = (value: boolean) => (isDialogShow.value = value)

  const currentPage = ref(1)
  const totalPages = ref(1)
  const density = 'compact'

  const isDark = computed(() => theme.global.current.value.dark)

  const getData = async () => {
    isLoading.value = true
    const response = await getDataFromApi(selectedApi.value, currentPage.value)
    items.value = response?.data
    totalPages.value = response?.info.total
    if (items.value.length > 0) {
      search.value = items.value[0]
      onSelect(items.value[0])
    }
    isLoading.value = false
  }

  const onPageChange = (page: number) => {
    currentPage.value = page
    getData()
  }

  const onSelect = (selectedItem: Item) => {
    if (selectedItem?.image) {
      imgURL.value = selectedItem.image
      result.value = JSON.stringify(selectedItem, null, 2)
    }
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
          :items="SEARCH_API_LIST"
          :label="`What you search, ${role}? May the Force be with you`"
          @update:model-value="getData"
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
          v-model="search"
          v-model:search-input="search"
          clearable
          :density="density"
          :item-title="'name'"
          :items="items"
          :label="`Search ${selectedApi}`"
          :loading="isLoading"
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
          <template v-else-if="items.length > 0 && result !== defaultResult">
            <template v-if="imgURL && search">
              <transition mode="out-in" name="scale">
                <div :key="imgURL" :aria-label="selectedApi" class="img" role="img">
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
              </transition>
            </template>
          </template>
        </div>
        <Dialog
          v-if="imgURL && search"
          class="my-5"
          :is-dialog-show="isDialogShow"
          :result="result"
          :search="search"
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
  transition: transform 0.3s ease-in;
}

.scale-enter-from, .scale-leave-to {
  transform: scale(0);
}
</style>
