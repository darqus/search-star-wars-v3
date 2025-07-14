const renderJSON = (data: unknown, params: [null, number] = [ null, 2 ]): string => JSON.stringify(data, ...params)

const filteredBoolean = <T extends Record<string, unknown>>(data: T): Partial<T> =>
  Object.entries(data).reduce((acc, [ key, value ]) => (value ? { ...acc, [key]: value } : acc), {})

const createJSON = <T extends Record<string, unknown>>(data: T): string => renderJSON(filteredBoolean(data))

export default createJSON
