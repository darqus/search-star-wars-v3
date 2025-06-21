export const API_URL = 'https://swapi.dev/api'
export const RESOURCE_URL = 'https://starwars-visualguide.com'
export const IMG_PLACEHOLDER = `${RESOURCE_URL}/assets/img/placeholder.jpg`

export interface SearchApiItem {
  api: string
  searchFields: string[]
  imgApiPath: string
}

export const SEARCH_API_LIST: SearchApiItem[] = [
  {
    api: 'people',
    searchFields: ['name'],
    imgApiPath: 'characters',
  },
  {
    api: 'planets',
    searchFields: ['name'],
    imgApiPath: 'planets',
  },
  {
    api: 'films',
    searchFields: ['title'],
    imgApiPath: 'films',
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
  {
    api: 'starships',
    searchFields: [
      'name',
      'model',
    ],
    imgApiPath: 'starships',
  },
]

export interface ApiResponse {
  results: any[]
}

export const getDataFromApi = async (selectedApi: string): Promise<ApiResponse> => {
  const res = await fetch(`${API_URL}/${selectedApi}`)
  const data = await res.json()
  return data
}
