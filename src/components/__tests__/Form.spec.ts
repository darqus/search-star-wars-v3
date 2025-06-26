import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import Form from '../form/Form.vue'

// Simplified Vue component mocks to avoid __isTeleport issues
vi.mock('@/components/Dialog.vue', () => ({
  __esModule: true,
  default: {
    name: 'MockDialog',
    template: '<div data-testid="mock-dialog" />',
    props: ['isDialogShow', 'result', 'search'],
    __isTeleport: false,
    __isKeepAlive: false,
    __asyncResolved: true,
  },
}))

vi.mock('@/components/Link.vue', () => ({
  __esModule: true,
  default: {
    name: 'MockLink',
    template: '<a data-testid="mock-link" />',
    props: ['link', 'text'],
    __isTeleport: false,
    __isKeepAlive: false,
    __asyncResolved: true,
  },
}))

vi.mock('@/components/Logo.vue', () => ({
  __esModule: true,
  default: {
    name: 'MockLogo',
    template: '<div data-testid="mock-logo" />',
    __isTeleport: false,
    __isKeepAlive: false,
    __asyncResolved: true,
  },
}))

vi.mock('@/components/Mandala.vue', () => ({
  __esModule: true,
  default: {
    name: 'MockMandala',
    template: '<div data-testid="mock-mandala" />',
    props: ['side', 'className'],
    __isTeleport: false,
    __isKeepAlive: false,
    __asyncResolved: true,
  },
}))

vi.mock('@/components/ThemeSwitcher.vue', () => ({
  __esModule: true,
  default: {
    name: 'MockThemeSwitcher',
    template: '<div data-testid="mock-theme-switcher" />',
    props: ['label'],
    __isTeleport: false,
    __isKeepAlive: false,
    __asyncResolved: true,
  },
}))

vi.mock('@/components/CacheControls.vue', () => ({
  __esModule: true,
  default: {
    name: 'MockCacheControls',
    template: '<div data-testid="mock-cache-controls" />',
    props: ['cachedEndpoints', 'currentEndpoint'],
    __isTeleport: false,
    __isKeepAlive: false,
    __asyncResolved: true,
  },
}))

// Мок хранилища Star Wars
const mockStarWarsStore = {
  filteredItems: [
    {
      id: '1',
      name: 'Luke Skywalker',
      description: 'Jedi Knight',
      image: 'https://star-wars-api-v3.netlify.app/image/characters/luke.webp',
    },
  ],
  selectedApi: 'characters',
  selectedItem: {
    id: '1',
    name: 'Luke Skywalker',
    description: 'Jedi Knight',
    image: 'https://star-wars-api-v3.netlify.app/image/characters/luke.webp',
  },
  selectInput: '',
  searchResults: [],
  searchTerm: '',
  imgURL: 'https://star-wars-api-v3.netlify.app/image/characters/luke.webp',
  imgLoaded: true,
  result: '{"name":"Luke Skywalker"}',
  currentPage: 1,
  totalPages: 5,
  isLoading: false,
  error: null,
  cachedEndpoints: new Set(['characters']),
  setApiEndpoint: vi.fn(),
  setPage: vi.fn(),
  setSearchTerm: vi.fn(),
  selectItem: vi.fn(),
  fetchItems: vi.fn(),
  fetchSearchResults: vi.fn(),
  selectFromSearch: vi.fn(),
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
        stubs: {
          'async-component-wrapper': true,
          'transition': true,
        },
      },
    })

    expect(wrapper.html()).toContain('Star Wars search')
    expect(wrapper.html()).toContain('What you search, Jedi? May the Force be with you')
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
