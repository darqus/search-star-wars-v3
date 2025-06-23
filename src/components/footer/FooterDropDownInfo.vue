<script setup lang="ts">
  const VERSION = import.meta.env.VITE_APP_VERSION
  const BUILD_DATE = import.meta.env.VITE_APP_BUILD_DATE || new Date().toISOString().split('T')[0]

  const info = [`version: ${VERSION}`, `build: ${BUILD_DATE}`].join('<br>')
</script>

<template>
  <v-menu location="top" offset="8">
    <template #activator="{ props }">
      <a v-bind="props">SkyNet</a>
    </template>

    <v-list style="opacity: 0.5">
      <v-list-item>
        <v-list-item-title>
          <small v-html="info" />
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>
