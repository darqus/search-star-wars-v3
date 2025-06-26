<template>
  <div class="wrapper">
    <template v-if="isLoading">
      <v-progress-circular
        indeterminate
        :size="display.smAndDown.value ? 400 : 600"
      />
    </template>
    <template v-else-if="items.length > 0 && imgURL && selectedItem">
      <transition mode="out-in" name="scale">
        <div
          :key="imgURL"
          :aria-label="selectedItem.name"
          class="img"
          role="img"
        >
          <a
            href="#"
            @click.prevent="$emit('show-dialog')"
            @keyup="$emit('show-dialog')"
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
      <v-alert type="error">
        {{ error }}
      </v-alert>
    </template>
  </div>
</template>

<script setup lang="ts">
  import type { Item } from '@/types/api'
  import { useDisplay } from 'vuetify'

  interface Props {
    items: Item[]
    imgURL: string
    selectedItem: Item | undefined
    isLoading: boolean
    error: string | null
  }

  defineProps<Props>()

  defineEmits<{
    'show-dialog': []
  }>()

  const display = useDisplay()
</script>

<style scoped>
.scale-enter-active, .scale-leave-active {
  transition: transform 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.scale-enter-from, .scale-leave-to {
  transform: scale(0);
}

.wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.img {
  cursor: pointer;
}

.img img {
  transition: transform 0.3s ease;
}

.img:hover img {
  transform: scale(1.05);
}
</style>
