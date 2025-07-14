import { THEMES } from '../state'

const getBrowserTheme = (): string =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? THEMES.dark : THEMES.light

export default getBrowserTheme
