import { FAVICONS } from '../state/index'

const toggleFavicon = (icon: string): void => {
  const headTitle = document.querySelector('head')!
  const newFavicon = document.createElement('link')
  newFavicon.setAttribute('rel', 'icon')
  newFavicon.setAttribute('href', icon)
  headTitle.append(newFavicon)
}

const setLinkIcons = (isDark: boolean): void => {
  const favicon = isDark ? FAVICONS.dark : FAVICONS.light
  toggleFavicon(favicon)
}

export default setLinkIcons
