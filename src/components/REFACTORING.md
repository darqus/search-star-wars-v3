# Компоненты проекта

## Архитектура компонентов после рефакторинга

### Основные принципы

1. **Разделение ответственности** - каждый компонент имеет одну четко определенную задачу
2. **Композиция над наследованием** - используем композабли для переиспользования логики
3. **Типизация** - строгая типизация на TypeScript
4. **Тестируемость** - каждый компонент покрыт тестами

### Структура компонентов

```
src/components/
├── form/
│   ├── Form.vue              # Главный компонент формы (контейнер)
│   └── scss/form.scss        # Стили формы
├── FormControls.vue          # Компонент управления формой
├── SearchField.vue           # Компонент поля поиска
├── ResultDisplay.vue         # Компонент отображения результатов
├── AppDialog.vue                # Модальное окно
├── AppLink.vue                  # Компонент ссылки
├── AppLogo.vue                  # Логотип
├── Mandala.vue               # Анимированный фон
└── __tests__/                # Тесты компонентов
```

## Компоненты

### Form.vue

**Главный компонент формы**

- Композиция других компонентов
- Управление состоянием диалога
- Ленивая загрузка компонентов

**Props:**

- `role: string` - роль пользователя (для отображения в UI)
- `side: string` - сторона Force (light/dark)

### FormControls.vue

**Элементы управления формой**

- Выбор API endpoint
- Пагинация
- Автокомплит
- Поле поиска

**Props:**

- `role: string` - роль пользователя
- `density?: 'default' | 'comfortable' | 'compact'` - плотность элементов

### SearchField.vue

**Поле поиска с автодополнением**

- Дебаунс ввода
- Выпадающий список результатов
- Подсветка совпадений

**Props:**

- `selectedApi: string` - выбранный API endpoint
- `isLoading: boolean` - состояние загрузки
- `density?: 'default' | 'comfortable' | 'compact'` - плотность

### ResultDisplay.vue

**Отображение результатов поиска**

- Показ изображений
- Индикатор загрузки
- Обработка ошибок

**Props:**

- `items: Item[]` - элементы для отображения
- `imgURL: string` - URL изображения
- `selectedItem: Item | undefined` - выбранный элемент
- `isLoading: boolean` - состояние загрузки
- `error: string | null` - ошибка

**Events:**

- `show-dialog` - показать модальное окно

## Композабли (Composables)

### useStarWarsForm()

**Управление состоянием формы**

```typescript
const {
  items,
  selectedApi,
  selectedItem,
  // ... остальные свойства
  onSelect,
  onPageChange,
  // ... остальные методы
} = useStarWarsForm()
```

### useSearch()

**Логика поиска**

```typescript
const {
  searchInput,
  isShownDropDown,
  searchResults,
  onSearchInputChange,
  onSearchBlur,
  clearSearch,
} = useSearch()
```

### useErrorHandler()

**Обработка ошибок**

```typescript
const { error, handleError, clearError } = useErrorHandler({
  showToast: true,
  logError: true,
  defaultMessage: 'Something went wrong'
})
```

### useLoadingState()

**Управление состояниями загрузки**

```typescript
const {
  isLoading,
  setLoading,
  withLoading
} = useLoadingState()
```

## Константы

### form.ts

**Константы формы**

- `FORM_DENSITY` - плотность элементов формы
- `SEARCH_MIN_LENGTH` - минимальная длина для поиска
- `SEARCH_DEBOUNCE_DELAY` - задержка дебаунса
- `COMPONENT_DELAY_*` - задержки для ленивой загрузки

## Утилиты

### storeHelpers.ts

**Помощники для работы с хранилищем**

- `createComputedProperty()` - создание типизированных computed свойств
- `createSafeComputed()` - безопасные computed с дефолтными значениями
- `createStoreActions()` - типизированные действия хранилища

## Тестирование

Каждый компонент и композабл покрыт unit-тестами:

- `SearchField.spec.ts` - тесты поля поиска
- `useSearch.spec.ts` - тесты логики поиска
- `Form.spec.ts` - тесты основной формы (обновлен)

## Преимущества рефакторинга

1. **Модульность** - каждый компонент можно использовать независимо
2. **Переиспользование** - логика вынесена в композабли
3. **Тестируемость** - мелкие компоненты легче тестировать
4. **Читаемость** - код стал более понятным и структурированным
5. **Производительность** - ленивая загрузка компонентов
6. **Типизация** - строгая типизация уменьшает количество ошибок
