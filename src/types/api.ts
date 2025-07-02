export interface Item {
  id: string
  name: string
  description: string
  image: string
}

export interface ApiResponse {
  results: Item[]
  total: number
  count: number
  limit: number
  page: number
  pages: number
}

export interface SearchApiItem {
  api: string
  imgApiPath: string
}
