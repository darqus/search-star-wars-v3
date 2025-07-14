import { createVuetify } from 'vuetify'

import { createPinia, setActivePinia } from 'pinia'

import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import ThemeSwitcher from '../ThemeSwitcher.vue'

// Создаем моковое хранилище
const mockSetTheme = vi.fn()
const mockThemeStore = {
  isDark: false,
  setTheme: mockSetTheme,
}

// Мокаем функцию useThemeStore
vi.mock('@/stores/theme', () => ({
  useThemeStore: vi.fn(() => mockThemeStore),
}))

describe('ThemeSwitcher', () => {
  const vuetify = createVuetify({
    components,
    directives,
  })

  beforeEach(() => {
    // Создаем новый экземпляр Pinia перед каждым тестом
    setActivePinia(createPinia())
  })

  it('renders properly with default props', () => {
    const wrapper = mount(ThemeSwitcher, {
      global: {
        plugins: [ vuetify ],
      },
    })

    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true)
  })

  it('renders with custom label', () => {
    const wrapper = mount(ThemeSwitcher, {
      props: {
        label: 'Custom Label',
      },
      global: {
        plugins: [ vuetify ],
      },
    })

    expect(wrapper.text()).toContain('Custom Label')
  })

  it('changes theme when toggled', async () => {
    const wrapper = mount(ThemeSwitcher, {
      global: {
        plugins: [ vuetify ],
      },
    })

    // Симулируем клик на переключателе
    await wrapper.find('input[type="checkbox"]').setValue(true)

    // Проверяем, что метод setTheme был вызван с правильным аргументом
    expect(mockSetTheme).toHaveBeenCalledWith(true)
  })
})
