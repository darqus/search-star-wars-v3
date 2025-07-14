export type Item = {
  id: string
  name: string
  description: string
  image: string
}

export type ApiResponse = {
  results: Item[]
  total: number
  count: number
  limit: number
  page: number
  pages: number
}

export type SearchApiItem = {
  api: string
  imgApiPath: string
}
