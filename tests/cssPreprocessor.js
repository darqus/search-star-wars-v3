// Preprocessor for CSS files
import type { Preprocessor } from 'vitest/config'

export default {
  transform(code, id) {
    // Handle CSS or SCSS files
    if (id.endsWith('.css') || id.endsWith('.scss') || id.endsWith('.sass')) {
      return {
        code: 'export default {}',
        map: null
      }
    }

    // Return null to let other preprocessors handle it
    return null
  }
} as Preprocessor
