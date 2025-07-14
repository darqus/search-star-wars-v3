<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import { AUDIO_ICONS } from '@/state/'

const sound = new Audio('snd/star-wars-theme.m4a')

const isPlayed = ref(false)
const isLoop = ref(false)

const icon = computed(() => {
  return isPlayed.value ? AUDIO_ICONS.stop : AUDIO_ICONS.play
})

const buttonColor = computed(() => {
  return isPlayed.value ? 'info' : 'primary'
})

const buttonVariant = computed(() => {
  return isPlayed.value ? 'elevated' : 'tonal'
})

onMounted(() => {
  sound.addEventListener('ended', () => onToggle(), false)
})

watch(isLoop, (value) => {
  sound.loop = value
})

const onPlaySound = async () => {
  try {
    await sound.play()
  } catch (error) {
    console.error('Audio playback failed:', error)
  }
}

const onPauseSound = () => {
  sound.pause()
}

const onToggle = () => {
  isPlayed.value = !isPlayed.value
  if (isPlayed.value) {
    void onPlaySound()
  } else {
    onPauseSound()
  }
}
</script>

<template>
  <v-row dense>
    <v-col cols="auto">
      <v-btn
        :aria-label="isPlayed ? 'Stop audio' : 'Play audio'"
        :color="buttonColor"
        :variant="buttonVariant"
        size="small"
        icon
        @click="onToggle"
      >
        <v-icon :size="28">{{ icon }}</v-icon>
      </v-btn>
    </v-col>

    <v-col cols="auto">
      <v-checkbox
        v-model="isLoop"
        color="primary"
        density="compact"
        label="loop"
        hide-details
      />
    </v-col>
  </v-row>
</template>
