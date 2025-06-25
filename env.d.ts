/// <reference types="vite/client" />
/// <reference types="unplugin-vue-router/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string
  readonly VITE_APP_NAME_SHORT: string
  readonly VITE_APP_NAME_POSTFIX: string
  readonly VITE_APP_VERSION: string
  readonly VITE_APP_BUILD_DATE: string
  readonly VITE_APP_API_BASE_URL: string
  readonly VITE_APP_IMAGE_BASE_URL: string
  readonly VITE_APP_TITLE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
