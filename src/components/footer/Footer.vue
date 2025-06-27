<script setup lang="ts">
  import { defineAsyncComponent } from 'vue'
  import { useDisplay } from 'vuetify'
  import { LINKS } from '@/state/'

  // Lazy loaded components with loading indicators
  const FooterDropDownInfo = defineAsyncComponent({
    loader: () => import('@/components/footer/FooterDropDownInfo.vue'),
    delay: 200,
  })

  const Link = defineAsyncComponent({
    loader: () => import('@/components/Link.vue'),
    delay: 100,
  })

  const SoundButton = defineAsyncComponent({
    loader: () => import('@/components/SoundButton.vue'),
    delay: 200,
  })

  const SWCrawlText = defineAsyncComponent({
    loader: () => import('@/components/SWCrawlText.vue'),
    delay: 300,
  })

  const ThemeSwitcher = defineAsyncComponent({
    loader: () => import('@/components/ThemeSwitcher.vue'),
    delay: 100,
  })

  interface Props {
    side: string
  }

  defineProps<Props>()

  const display = useDisplay()
  const links = LINKS
</script>

<template>
  <v-container class="footer-custom">
    <SWCrawlText />
    <div class="footer-row">
      <div>
        <ThemeSwitcher :label="`Toggle side: ${side}`" />
      </div>
      <div class="footer-links">
        <Link
          v-for="{ link, text } in links"
          :key="text"
          :font-size-rem="0.8"
          :link="link"
          :text="text"
        />
      </div>
      <div>
        <SoundButton />
      </div>
      <div>
        <small>
          <span>{{ `1977 — ${new Date().getFullYear()}` }}</span>
          <span style="margin-left: 1rem;">
            <span class="footer-icon">🌌</span>
            <span>&nbsp;</span>
            <FooterDropDownInfo />
            <span>&nbsp;</span>
            <span>inc.</span>
          </span>
        </small>
      </div>
    </div>
  </v-container>
</template>

<style>
.footer-custom {
  position: relative;

  .footer-row {
    display: flex;
    align-items: center;
    justify-content: space-between;

    @media (width <= 700px) {
      flex-direction: column;
      gap: 1rem;
      justify-content: center;
      text-align: center;
    }
  }

  .footer-links {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
    align-items: center;

    a {
      padding-right: v-bind(display.smAndDown ? '0' : '1rem');
      padding-left: v-bind(display.smAndDown ? '0' : '1rem');
      color: v-bind($vuetify.theme.current.dark ? 'lightblue' : 'rgb(23 99 161)');
    }
  }
}

:deep(.footer-icon) {
  filter: v-bind('$vuetify.theme.current.dark ? "invert(0.2) sepia(0.3) drop-shadow(0 4px 3px rgba(255, 255, 255, 0.5))" : "invert(0.2) sepia(0.3) blur(0.5px) drop-shadow(0 4px 3px rgba(0, 0, 0, 0.5))"');
}
</style>
