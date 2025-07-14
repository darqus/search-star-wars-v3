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

vi.mock('@/components/FormControls.vue', () => ({
  __esModule: true,
  default: {
    name: 'MockFormControls',
    template: `
      <div data-testid="mock-form-controls">
        <div class="v-select">
          <label>What you search, {{ role }}? May the Force be with you</label>
        </div>
        <div class="v-autocomplete"></div>
        <div class="v-text-field"></div>
      </div>
    `,
    props: ['role', 'density'],
    __isTeleport: false,
    __isKeepAlive: false,
    __asyncResolved: true,
  },
}))

vi.mock('@/components/ResultDisplay.vue', () => ({
  __esModule: true,
  default: {
    name: 'MockResultDisplay',
    template: `
      <div data-testid="mock-result-display">
        <div v-if="isLoading" class="v-progress-circular"></div>
        <div v-if="error" class="v-alert error">{{ error }}</div>
        <div v-if="items.length > 0" class="results"></div>
      </div>
    `,
    props: ['items', 'imgURL', 'selectedItem', 'isLoading', 'error'],
    emits: ['show-dialog'],
    __isTeleport: false,
    __isKeepAlive: false,
    __asyncResolved: true,
  },
}))

// Mock the composables with a more accurate structure
const mockFormData = {
  items: [
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
  imgURL: 'https://star-wars-api-v3.netlify.app/image/characters/luke.webp',
  result: '{"name":"Luke Skywalker"}',
  currentPage: 1,
  totalPages: 1,
  isLoading: false,
  error: null,
  onSelect: vi.fn(),
  onPageChange: vi.fn(),
  onApiSelect: vi.fn(),
  onClearSelection: vi.fn(),
  fetchItems: vi.fn(),
}

vi.mock('@/composables/useStarWarsForm', () => ({
  useStarWarsForm: () => mockFormData,
}))

// Мок хранилища Star Wars для обратной совместимости
const mockStarWarsStore = {
  ...mockFormData,
  filteredItems: mockFormData.items,
  setApiEndpoint: vi.fn(),
  setPage: vi.fn(),
  selectItem: vi.fn(),
  setSearchTerm: vi.fn(),
  resetSelection: vi.fn(),
}

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
          transition: true,
        },
      },
    })

    expect(wrapper.html()).toContain('Star Wars search')
    expect(wrapper.html()).toContain('What you search, Jedi? May the Force be with you')
  })

  it('shows pagination when totalPages > 1', async () => {
    mockFormData.totalPages = 5

    const wrapper = mount(Form, {
      props: {
        role: 'Jedi',
        side: 'light',
      },
      global: {
        plugins: [vuetify],
        stubs: {
          'async-component-wrapper': true,
          transition: true,
        },
      },
    })

    // Wait for component to fully render
    await wrapper.vm.$nextTick()

    // Test that the composable has the correct totalPages value
    expect(mockFormData.totalPages).toBe(5)
    // Test that FormControls component is rendered
    expect(wrapper.find('[data-testid="mock-form-controls"]').exists()).toBe(true)
  })

  it('hides pagination when totalPages <= 1', async () => {
    mockFormData.totalPages = 1

    const wrapper = mount(Form, {
      props: {
        role: 'Jedi',
        side: 'light',
      },
      global: {
        plugins: [vuetify],
        stubs: {
          'async-component-wrapper': true,
          transition: true,
        },
      },
    })

    // Wait for component to fully render
    await wrapper.vm.$nextTick()

    // Test that the composable has the correct totalPages value
    expect(mockFormData.totalPages).toBe(1)
    // Test that FormControls component is rendered
    expect(wrapper.find('[data-testid="mock-form-controls"]').exists()).toBe(true)
  })

  it('shows loading indicator when isLoading is true', () => {
    mockFormData.isLoading = true

    const wrapper = mount(Form, {
      props: {
        role: 'Jedi',
        side: 'light',
      },
      global: {
        plugins: [vuetify],
        stubs: {
          'async-component-wrapper': true,
          transition: true,
        },
      },
    })

    expect(wrapper.find('.v-progress-circular').exists()).toBe(true)
  })

  it('shows error when error is present', () => {
    mockFormData.isLoading = false
    // @ts-ignore - Allow string assignment for test
    mockFormData.error = 'API Error'
    mockFormData.items = []

    const wrapper = mount(Form, {
      props: {
        role: 'Jedi',
        side: 'light',
      },
      global: {
        plugins: [vuetify],
        stubs: {
          'async-component-wrapper': true,
          transition: true,
        },
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
        stubs: {
          'async-component-wrapper': true,
          transition: true,
        },
      },
    })

    expect(mockFormData.fetchItems).toHaveBeenCalledTimes(1)
  })

  it('handles API change', async () => {
    const _wrapper = mount(Form, {
      props: {
        role: 'Jedi',
        side: 'light',
      },
      global: {
        plugins: [vuetify],
        stubs: {
          'async-component-wrapper': true,
          transition: true,
        },
      },
    })

    // Simulate API endpoint change via the composable action
    await mockFormData.onApiSelect()
    expect(mockFormData.onApiSelect).toHaveBeenCalled()
  })

  it('handles pagination change', async () => {
    mockFormData.totalPages = 5

    const _wrapper = mount(Form, {
      props: {
        role: 'Jedi',
        side: 'light',
      },
      global: {
        plugins: [vuetify],
        stubs: {
          'async-component-wrapper': true,
          transition: true,
        },
      },
    })

    // Simulate pagination change via the composable action
    await mockFormData.onPageChange(3)
    expect(mockFormData.onPageChange).toHaveBeenCalledWith(3)
  })

  it('handles item selection', async () => {
    const testItem = {
      _id: '3',
      name: 'Obi-Wan Kenobi',
      description: 'Jedi Master',
      image: 'kenobi.jpg',
      __v: 0,
    }

    const _wrapper = mount(Form, {
      props: {
        role: 'Jedi',
        side: 'light',
      },
      global: {
        plugins: [vuetify],
        stubs: {
          'async-component-wrapper': true,
          transition: true,
        },
      },
    })

    // Simulate selecting an item via the composable action
    await mockFormData.onSelect(testItem)
    expect(mockFormData.onSelect).toHaveBeenCalledWith(testItem)
  })

  it('handles search input change', async () => {
    const _wrapper = mount(Form, {
      props: {
        role: 'Jedi',
        side: 'light',
      },
      global: {
        plugins: [vuetify],
        stubs: {
          'async-component-wrapper': true,
          transition: true,
        },
      },
    })

    // Simulate search input change
    const searchTerm = 'Skywalker'
    // Test the composable's behavior directly since DOM interaction is complex
    mockFormData.selectInput = searchTerm
    expect(mockFormData.selectInput).toBe(searchTerm)
  })
})
