<script setup lang="ts">
import { ref } from 'vue'

import { useStarWarsStore } from '@/stores/starWars'

import { DEFAULT_CACHE_ENABLED } from '@/constants/api'

const store = useStarWarsStore()
const cachingEnabled = ref(DEFAULT_CACHE_ENABLED)

const onToggleCaching = () => {
  store.toggleCaching(cachingEnabled.value)
}

const onInvalidateCache = () => {
  store.invalidateCache()
}

const onRefresh = async () => {
  try {
    await store.fetchItems(true) // skipCache=true
  } catch (error) {
    console.error('Failed to refresh items:', error)
  }
}
</script>

<template>
  <v-card class="pa-3 mb-4">
    <v-card-title class="text-subtitle-1">API Cache Controls</v-card-title>
    <v-card-text>
      <v-switch
        v-model="cachingEnabled"
        color="primary"
        label="Enable API caching"
        hide-details
        @change="onToggleCaching"
      />

      <v-row class="mt-2">
        <v-col>
          <v-btn
            color="warning"
            size="small"
            variant="outlined"
            @click="onInvalidateCache"
          >
            Invalidate Cache
          </v-btn>

          <v-btn
            class="ml-2"
            color="primary"
            size="small"
            variant="outlined"
            @click="onRefresh"
          >
            Refresh (Skip Cache)
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
