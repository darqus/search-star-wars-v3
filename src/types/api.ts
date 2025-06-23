export interface Item {
  _id: string
  name: string
  description: string
  image: string
  __v: number
}

export interface ApiResponse {
  data: Item[]
  info: {
    total: number
    count: number
    pages: number
    next: string | null
    prev: string | null
  }
}

export interface SearchApiItem {
  api: string
  imgApiPath: string
}
