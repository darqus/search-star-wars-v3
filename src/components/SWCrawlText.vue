<script setup lang="ts">
import { computed } from 'vue'
import { useDisplay, useTheme } from 'vuetify'

import SWCTEXT from '@/state/swctext'

const display = useDisplay()
const theme = useTheme()

const text = SWCTEXT

const isDark = computed(() => theme.global.current.value.dark)

const color = computed(() => {
  const colorValue = isDark.value
    ? 'hsla(60, 100%, 50%, 0.308)'
    : 'hsla(0, 0%, 0%, 0.308)'

  return `color: ${colorValue}`
})
</script>

<template>
  <div
    :class="{ mobile: display.smAndDown.value }"
    :style="color"
    class="swct-mask"
  >
    <div class="shadow" />
    <div class="swct-container">
      <div class="swct-text -js-stop">{{ text }}</div>
    </div>
  </div>
</template>

<style scoped>
.swct-mask {
  position: absolute;
  right: 2vw;
  bottom: 15vh;
  left: 2vw;
  height: clamp(40vh, 50vh, 60vh);
  overflow: hidden;
  transform: perspective(150px) rotateX(20deg);
  transform-origin: 50% 100%;
}

.swct-mask .shadow {
  position: absolute;
  inset: 0;
  height: 300px;
  background: linear-gradient(to top, transparent, rgb(0 0 0 / 12%) 100%);
  filter: opacity(0.8);
}

.swct-mask.mobile {
  bottom: 25vh;
}

.swct-container {
  font-size: 4vh;
  text-align: justify;
}

.swct-text {
  padding-top: 5vh;
  animation: autoscroll 2000s linear;
}

.swct-text.js-stop {
  animation: initial;
}

@keyframes autoscroll {
  to {
    margin-top: -3000vh;
  }
}

:deep(.swct-mask ::selection) {
  color: v-bind(
    'isDark ? "hsl(60deg 100% 50% / 0.708)" : "hsl(60deg 100% 30% / 0.708)"'
  );
}
</style>
