export interface Item {
  id: string
  name: string
  description: string
  image: string
}

export interface ApiResponse {
  data: Item[]
  info: {
    total: number
    page: number
    limit: number
    next: string | null
    prev: string | null
  }
}

export interface SearchApiItem {
  api: string
  imgApiPath: string
}

export const IMAGE_BASE_URL = 'https://star-wars-api-v3.netlify.app'
