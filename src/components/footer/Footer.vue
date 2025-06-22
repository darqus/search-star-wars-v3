<script setup lang="ts">
  import { useDisplay } from 'vuetify'
  import FooterDropDownInfo from '@/components/footer/FooterDropDownInfo.vue'
  import Link from '@/components/Link.vue'
  import SoundButton from '@/components/SoundButton.vue'
  import SWCrawlText from '@/components/SWCrawlText.vue'
  import ThemeSwitcher from '@/components/ThemeSwitcher.vue'
  import { LINKS } from '@/state/'

  interface Props {
    side: string
  }

  defineProps<Props>()

  const display = useDisplay()
  const links = LINKS
</script>

<template>
  <v-footer class="footer-custom">
    <v-container
      class="d-grid align-center"
      :class="
        display.smAndDown.value ? 'grid-mobile' : 'grid-desktop'
      "
    >
      <SWCrawlText />
      <div
        class="d-flex"
        :class="
          display.smAndDown.value
            ? 'justify-center'
            : 'justify-start'
        "
      >
        <ThemeSwitcher :label="`Toggle side: ${side}`" />
      </div>
      <div
        class="d-flex align-center"
        :class="
          display.smAndDown.value
            ? 'justify-center'
            : 'justify-start'
        "
      >
        <div>
          <Link
            v-for="{ link, text } in links"
            :key="text"
            class="px-1"
            :font-size-rem="0.8"
            :link="link"
            :text="text"
          />
        </div>
      </div>
      <div
        class="d-flex"
        :class="
          display.smAndDown.value
            ? 'justify-center'
            : 'justify-end'
        "
      >
        <SoundButton />
      </div>
      <div
        class="d-flex align-center"
        :class="
          display.smAndDown.value
            ? 'justify-center'
            : 'justify-end'
        "
      >
        <small>
          <span>{{ `1977 — ${new Date().getFullYear()}` }}</span>
          <span class="ml-2">
            <span class="footer-icon">🌌</span>
            <span>&nbsp;</span>
            <FooterDropDownInfo />
            <span>&nbsp;</span>
            <span>inc.</span>
          </span>
        </small>
      </div>
    </v-container>
  </v-footer>
</template>

<style scoped>
.d-grid {
  display: grid;
}

.align-center {
  align-items: center;
}

.grid-desktop {
  grid-template-columns: repeat(4, 1fr);
}

.grid-mobile {
  grid-template-columns: initial;
  row-gap: 0.5rem;
}

.footer-custom {
  position: relative;
  flex: initial;
  padding: 0;
}

:deep(.footer-icon) {
  filter: v-bind('$vuetify.theme.current.dark ? "invert(0.2) sepia(0.3) drop-shadow(0 4px 3px rgba(255, 255, 255, 0.5))" : "invert(0.2) sepia(0.3) blur(0.5px) drop-shadow(0 4px 3px rgba(0, 0, 0, 0.5))"');
}
</style>
