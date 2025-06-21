<template>
  <div class="d-flex align-center ga-2">
    <v-btn icon @click="onToggle">
      <v-icon>{{ icon }}</v-icon>
    </v-btn>
    <v-checkbox
      v-model="isLoop"
      class="ma-0"
      density="compact"
      hide-details
      label="loop"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue'
  import { AUDIO_ICONS } from '@/state/'

  const sound = new Audio('snd/star-wars-theme.m4a')

  const isPlayed = ref(false)
  const isLoop = ref(false)

  const icon = computed(() => {
    return isPlayed.value ? AUDIO_ICONS.stop : AUDIO_ICONS.play
  })

  onMounted(() => {
    sound.addEventListener('ended', () => onToggle(), false)
  })

  watch(isLoop, value => {
    sound.loop = value
  })

  const onPlaySound = () => {
    sound.play()
  }

  const onPauseSound = () => {
    sound.pause()
  }

  const onToggle = () => {
    isPlayed.value = !isPlayed.value
    if (isPlayed.value) {
      onPlaySound()
    } else {
      onPauseSound()
    }
  }
</script>
