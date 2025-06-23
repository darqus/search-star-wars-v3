<script setup lang="ts">
  import { ref } from 'vue'
  import { DEFAULT_CACHE_ENABLED } from '@/constants/api'
  import { useStarWarsStore } from '@/stores/starWars'

  const store = useStarWarsStore()
  const cachingEnabled = ref(DEFAULT_CACHE_ENABLED)

  const onToggleCaching = () => {
    store.toggleCaching(cachingEnabled.value)
  }

  const onInvalidateCache = () => {
    store.invalidateCache()
  }

  const onRefresh = () => {
    store.fetchItems(true) // skipCache=true
  }
</script>

<template>
  <v-card class="pa-3 mb-4">
    <v-card-title class="text-subtitle-1">API Cache Controls</v-card-title>
    <v-card-text>
      <v-switch
        v-model="cachingEnabled"
        color="primary"
        hide-details
        label="Enable API caching"
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
