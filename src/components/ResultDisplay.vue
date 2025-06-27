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
  import { onMounted, ref, watch } from 'vue'
  import { useDisplay } from 'vuetify'

  interface Props {
    items: Item[]
    imgURL: string
    selectedItem: Item | undefined
    isLoading: boolean
    error: string | null
  }

  const props = defineProps<Props>()

  defineEmits<{
    'show-dialog': []
  }>()

  const display = useDisplay()
  const sounds = ref<HTMLAudioElement[]>([])

  // Массив путей к звуковым файлам
  const soundPaths = [
    'snd/kotor-animal-sms.mp3',
    'snd/r2-d2-sms.mp3',
    'snd/r2d2-noise.mp3',
    'snd/r2-d2-laugh.mp3',
    'snd/r5-d4-star-wars.mp3',
    'snd/star-wars-r2d2-1.mp3',
    'snd/bb-8-hihi.mp3',
    'snd/bb-8-sound-2.mp3',
  ]

  onMounted(() => {
    // Создаем объекты Audio для каждого звукового файла
    sounds.value = soundPaths.map(path => {
      const audio = new Audio(path)
      audio.volume = 0.3 // Устанавливаем громкость на 30%
      return audio
    })
  })

  // Функция для получения случайного звука
  const getRandomSound = () => {
    const randomIndex = Math.floor(Math.random() * sounds.value.length)
    return sounds.value[randomIndex]
  }

  // Отслеживаем изменения URL картинки и воспроизводим случайный звук
  watch(() => props.imgURL, (newImgURL, oldImgURL) => {
    if (newImgURL && oldImgURL && newImgURL !== oldImgURL && sounds.value.length > 0) {
      const randomSound = getRandomSound()
      // Останавливаем предыдущее воспроизведение если оно есть
      randomSound.currentTime = 0
      randomSound.play().catch(() => {
        // Игнорируем ошибки воспроизведения (например, если пользователь еще не взаимодействовал со страницей)
      })
    }
  })
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
