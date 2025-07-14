import { computed } from 'vue'

/**
 * Type-safe computed property creator for store properties
 * Упрощает создание computed свойств с getter/setter
 */
export function createComputedProperty<T>(getter: () => T, setter?: (value: T) => void) {
  if (setter) {
    return computed({
      get: getter,
      set: setter,
    })
  }

  return computed(getter)
}

/**
 * Helper для создания безопасных computed свойств с дефолтными значениями
 */
export function createSafeComputed<T>(getter: () => T | undefined, defaultValue: T) {
  return computed(() => getter() ?? defaultValue)
}

/**
 * Создает типизированный объект методов для работы с хранилищем
 */
export function createStoreActions<T extends Record<string, (...args: any[]) => any>>(actions: T): T {
  return actions
}
