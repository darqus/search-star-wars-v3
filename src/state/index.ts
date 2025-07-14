export const IS_DEV = import.meta.env.DEV

export const THEMES = {
  light: 'light',
  dark: 'dark',
} as const

export const FAVICONS = {
  dark: 'darth_vader.png',
  light: 'storm_trooper.png',
} as const

export const SIDES = {
  light: 'Light',
  dark: 'Dark',
} as const

export const ROLES = {
  light: 'Jedi',
  dark: 'Sith',
} as const

export const BGS = {
  light: 'jedi',
  dark: 'sith',
} as const

export const LINKS = [
  {
    link: 'https://vuetifyjs.com/en/',
    text: 'Vuetify',
  },
  {
    link: 'https://star-wars-api-v3.netlify.app/',
    text: 'API',
  },
  {
    link: 'https://starwars.fandom.com/',
    text: 'Wiki',
  },
  {
    link: 'https://meloboom.com/en/tags/star%20wars',
    text: 'Music',
  },
  {
    link: 'https://www.softicons.com/search?search=star+wars&x=13&y=10',
    text: 'Icons',
  },
]

export const AUDIO_ICONS = {
  play: 'mdi-play',
  stop: 'mdi-stop',
} as const

export const NON_BREAKING_SPACE = String.fromCodePoint(160)

export type Theme = (typeof THEMES)[keyof typeof THEMES]

export type Side = (typeof SIDES)[keyof typeof SIDES]

export type Role = (typeof ROLES)[keyof typeof ROLES]
