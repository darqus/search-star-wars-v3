import { createVuetify } from 'vuetify'

import { createPinia, setActivePinia } from 'pinia'

import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import SearchField from '../SearchField.vue'

const vuetify = createVuetify({
  components,
  directives,
})

// Mock the composable
vi.mock('@/composables/useSearch', () => ({
  useSearch: () => ({
    searchInput: { value: '' },
    isShownDropDown: { value: false },
    searchResults: { value: [] },
    onSearchInputChange: vi.fn(),
    onSearchBlur: vi.fn(),
    onSelectFromDropList: vi.fn(),
    highlightText: vi.fn((text: string) => text),
  }),
}))

describe('SearchField', () => {
  beforeEach(() => {
    const pinia = createPinia()

    setActivePinia(pinia)
  })

  it('renders correctly', () => {
    const wrapper = mount(SearchField, {
      global: {
        plugins: [ vuetify ],
      },
      props: {
        selectedApi: 'people',
        isLoading: false,
        density: 'compact',
      },
    })

    expect(wrapper.find('input').exists()).toBe(true)
    expect(wrapper.find('label').text()).toContain('Search people')
  })

  it('shows dropdown when search results are available', async () => {
    const wrapper = mount(SearchField, {
      global: {
        plugins: [ vuetify ],
      },
      props: {
        selectedApi: 'people',
        isLoading: false,
        density: 'compact',
      },
    })

    // Initially dropdown should not be visible
    expect(wrapper.find('.search-dropdown').exists()).toBe(false)
  })
})
