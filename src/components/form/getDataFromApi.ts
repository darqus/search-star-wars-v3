export const API_URL = import.meta.env.VITE_APP_API_BASE_URL

export interface SearchApiItem {
  api: string
  imgApiPath: string
}

export const SEARCH_API_LIST: SearchApiItem[] = [
  {
    api: 'characters',
    imgApiPath: 'characters',
  },
  {
    api: 'creatures',
    imgApiPath: 'creatures',
  },
  {
    api: 'droids',
    imgApiPath: 'droids',
  },
  {
    api: 'locations',
    imgApiPath: 'locations',
  },
  {
    api: 'organizations',
    imgApiPath: 'organizations',
  },
  {
    api: 'species',
    imgApiPath: 'species',
  },
  {
    api: 'vehicles',
    imgApiPath: 'vehicles',
  },
]

export type Item = {
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

export const getDataFromApi = async (
  selectedApi: string,
  page = 1,
  limit = 10,
): Promise<ApiResponse> => {
  const params = new URLSearchParams()
  params.append('page', page.toString())
  params.append('limit', limit.toString())

  const url = `${API_URL}/${selectedApi}?${params}`
  const res = await fetch(url)
  const data = await res.json()
  return data
}
