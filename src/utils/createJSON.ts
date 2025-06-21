const renderJSON = (data: any, params: [null, number] = [null, 2]): string => JSON.stringify(data, ...params)

const filteredBoolean = (data: Record<string, any>): Record<string, any> => Object
  .entries(data)
  .reduce((acc, [key, value]) => (value ? { ...acc, [key]: value } : acc), {})

const createJSON = (data: Record<string, any>): string => renderJSON(filteredBoolean(data))

export default createJSON
