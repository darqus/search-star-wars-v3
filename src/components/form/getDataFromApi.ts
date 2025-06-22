export const API_URL = import.meta.env.VITE_APP_API_BASE_URL

export interface SearchApiItem {
  api: string
  searchFields: string[]
  imgApiPath: string
}

export const SEARCH_API_LIST: SearchApiItem[] = [
  {
    api: 'characters',
    searchFields: ['name'],
    imgApiPath: 'characters',
  },
  {
    api: 'creatures',
    searchFields: ['name'],
    imgApiPath: 'creatures',
  },
  {
    api: 'droids',
    searchFields: ['name'],
    imgApiPath: 'droids',
  },
  {
    api: 'locations',
    searchFields: ['name'],
    imgApiPath: 'locations',
  },
  {
    api: 'organizations',
    searchFields: ['name'],
    imgApiPath: 'organizations',
  },
  {
    api: 'species',
    searchFields: ['name'],
    imgApiPath: 'species',
  },
  {
    api: 'vehicles',
    searchFields: [
      'name',
      'model',
    ],
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
  info?: {
    total: number
    page: number
    limit: number
    next: string
    prev: string
  }
}

export const getDataFromApi = async (
  selectedApi: string,
  search?: string,
  page = 1,
  limit = 10,
): Promise<ApiResponse> => {
  const params = new URLSearchParams()
  if (search) {
    params.append('name', search)
  }
  params.append('page', page.toString())
  params.append('limit', limit.toString())

  const url = `${API_URL}/${selectedApi}${search ? '/search' : ''}?${params}`
  const res = await fetch(url)
  const data = await res.json()
  return data
}
