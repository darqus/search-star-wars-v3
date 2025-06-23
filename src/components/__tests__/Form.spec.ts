import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import Form from '../form/Form.vue'

// Мок компонентов
vi.mock('@/components/Dialog.vue', () => ({
  default: {
    name: 'Dialog',
    props: ['isDialogShow', 'result', 'search'],
    template: '<div data-testid="mock-dialog"></div>',
  },
}))

vi.mock('@/components/Link.vue', () => ({
  default: {
    name: 'Link',
    props: ['link', 'text'],
    template: '<a :href="link">{{ text }}</a>',
  },
}))

vi.mock('@/components/Logo.vue', () => ({
  default: {
    name: 'Logo',
    template: '<div data-testid="mock-logo"></div>',
  },
}))

vi.mock('@/components/Mandala.vue', () => ({
  default: {
    name: 'Mandala',
    props: ['side', 'className'],
    template: '<div data-testid="mock-mandala"></div>',
  },
}))

vi.mock('@/components/ThemeSwitcher.vue', () => ({
  default: {
    name: 'ThemeSwitcher',
    props: ['label'],
    template: '<div data-testid="mock-theme-switcher">{{ label }}</div>',
  },
}))

// Мок хранилища Star Wars
const mockStarWarsStore = {
  filteredItems: [
    {
      _id: '1',
      name: 'Luke Skywalker',
      description: 'Jedi Knight',
      image: 'luke.jpg',
      __v: 0,
    },
  ],
  selectedApi: 'characters',
  selectedItem: {
    _id: '1',
    name: 'Luke Skywalker',
    description: 'Jedi Knight',
    image: 'luke.jpg',
    __v: 0,
  },
  searchInput: '',
  imgURL: 'luke.jpg',
  imgLoaded: true,
  result: '{"name":"Luke Skywalker"}',
  currentPage: 1,
  totalPages: 5,
  isLoading: false,
  error: null,
  setApiEndpoint: vi.fn(),
  setPage: vi.fn(),
  setSearchTerm: vi.fn(),
  selectItem: vi.fn(),
  fetchItems: vi.fn(),
  resetSelection: vi.fn(),
}

vi.mock('@/stores/starWars', () => ({
  useStarWarsStore: vi.fn(() => mockStarWarsStore),
}))

// Мок хранилища темы
const mockThemeStore = {
  isDark: false,
  initTheme: vi.fn(),
  setTheme: vi.fn(),
  toggleTheme: vi.fn(),
}

vi.mock('@/stores/theme', () => ({
  useThemeStore: vi.fn(() => mockThemeStore),
}))

// Мокируем useDisplay из Vuetify
const mockDisplay = {
  xs: { value: false },
  smAndDown: { value: false },
  mdAndDown: { value: false },
}
vi.mock('vuetify', async () => {
  const actual = await vi.importActual('vuetify')
  return {
    ...actual,
    useDisplay: vi.fn(() => mockDisplay),
  }
})

// Mock CSS/SCSS imports
vi.mock('@/components/form/scss/form.scss', () => ({}))
vi.mock('vuetify/lib/components/VCode/VCode.css', () => ({}))
vi.mock('vuetify/styles', () => ({}))

describe('Form Component', () => {
  const vuetify = createVuetify({
    components,
    directives,
  })

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('renders properly with props', () => {
    const wrapper = mount(Form, {
      props: {
        role: 'Jedi',
        side: 'light',
      },
      global: {
        plugins: [vuetify],
      },
    })

    expect(wrapper.html()).toContain('Star Wars search')
    expect(wrapper.html()).toContain('Dark Mode')
  })

  it('shows pagination when totalPages > 1', () => {
    mockStarWarsStore.totalPages = 5

    const wrapper = mount(Form, {
      props: {
        role: 'Jedi',
        side: 'light',
      },
      global: {
        plugins: [vuetify],
      },
    })

    expect(wrapper.find('.v-pagination').exists()).toBe(true)
  })

  it('hides pagination when totalPages <= 1', () => {
    mockStarWarsStore.totalPages = 1

    const wrapper = mount(Form, {
      props: {
        role: 'Jedi',
        side: 'light',
      },
      global: {
        plugins: [vuetify],
      },
    })

    expect(wrapper.find('.v-pagination').exists()).toBe(false)
  })

  it('shows loading indicator when isLoading is true', () => {
    mockStarWarsStore.isLoading = true

    const wrapper = mount(Form, {
      props: {
        role: 'Jedi',
        side: 'light',
      },
      global: {
        plugins: [vuetify],
      },
    })

    expect(wrapper.find('.v-progress-circular').exists()).toBe(true)
  })

  it('shows error when error is present', () => {
    mockStarWarsStore.isLoading = false
    // @ts-ignore - Игнорируем несоответствие типов для теста
    mockStarWarsStore.error = 'API Error'
    mockStarWarsStore.filteredItems = []

    const wrapper = mount(Form, {
      props: {
        role: 'Jedi',
        side: 'light',
      },
      global: {
        plugins: [vuetify],
      },
    })

    expect(wrapper.find('.v-alert').exists()).toBe(true)
    expect(wrapper.html()).toContain('API Error')
  })

  it('calls fetchItems on mount', () => {
    mount(Form, {
      props: {
        role: 'Jedi',
        side: 'light',
      },
      global: {
        plugins: [vuetify],
      },
    })

    expect(mockStarWarsStore.fetchItems).toHaveBeenCalledTimes(1)
  })

  it('handles API change', async () => {
    const wrapper = mount(Form, {
      props: {
        role: 'Jedi',
        side: 'light',
      },
      global: {
        plugins: [vuetify],
      },
    })

    // Directly simulate the API endpoint change
    await wrapper.findComponent({ name: 'v-select' }).vm.$emit('update:modelValue', 'vehicles')
    // Trigger the update:model-value event which should call onApiSelect
    await wrapper.findComponent({ name: 'v-select' }).vm.$emit('update:model-value', 'vehicles')

    // Verify both setApiEndpoint and setPage were called
    expect(mockStarWarsStore.setApiEndpoint).toHaveBeenCalledWith('vehicles')
    expect(mockStarWarsStore.setPage).toHaveBeenCalledWith(1)
  })

  it('handles pagination change', async () => {
    mockStarWarsStore.totalPages = 5

    const wrapper = mount(Form, {
      props: {
        role: 'Jedi',
        side: 'light',
      },
      global: {
        plugins: [vuetify],
      },
    })

    // Simulate changing the page
    await wrapper.findComponent({ name: 'v-pagination' }).vm.$emit('update:modelValue', 3)
    // Trigger the event handler
    await wrapper.findComponent({ name: 'v-pagination' }).vm.$emit('update:model-value', 3)

    // Verify the page was changed
    expect(mockStarWarsStore.setPage).toHaveBeenCalledWith(3)
  })

  it('handles item selection', async () => {
    const testItem = {
      _id: '3',
      name: 'Obi-Wan Kenobi',
      description: 'Jedi Master',
      image: 'kenobi.jpg',
      __v: 0,
    }

    const wrapper = mount(Form, {
      props: {
        role: 'Jedi',
        side: 'light',
      },
      global: {
        plugins: [vuetify],
      },
    })

    // Simulate selecting an item
    await wrapper.findComponent({ name: 'v-autocomplete' }).vm.$emit('update:modelValue', testItem)

    // Verify the item was selected
    expect(mockStarWarsStore.selectItem).toHaveBeenCalledWith(testItem)
  })

  it('handles search input change', async () => {
    const wrapper = mount(Form, {
      props: {
        role: 'Jedi',
        side: 'light',
      },
      global: {
        plugins: [vuetify],
      },
    })

    // Simulate changing the search input
    const searchTerm = 'Skywalker'
    await wrapper.findComponent({ name: 'v-autocomplete' }).vm.$emit('update:search-input', searchTerm)

    // Verify the search term was set
    expect(mockStarWarsStore.setSearchTerm).toHaveBeenCalledWith(searchTerm)
  })
})
