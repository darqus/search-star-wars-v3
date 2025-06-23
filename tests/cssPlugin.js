// CSS mock plugin for Vitest
export default {
  name: 'vitest-css-mock',
  enforce: 'pre',
  resolveId (id) {
    if (id.endsWith('.css') || id.endsWith('.scss') || id.endsWith('.sass')) {
      return id
    }
    return null
  },
  load (id) {
    if (id.endsWith('.css') || id.endsWith('.scss') || id.endsWith('.sass')) {
      return 'export default {}'
    }
    return null
  },
}
