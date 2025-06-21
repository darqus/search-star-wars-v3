export const isMatchesStringFromPhrase = (phrase: string, string: string): boolean => phrase
  .toLowerCase()
  .split(' ')
  .some(it => it.startsWith(string.toLowerCase()))

const getFirstLettersOfWord = (phrase: string, string: string): string => phrase
  .split(' ')
  .find(it => it.toLowerCase().startsWith(string.toLowerCase()))!
  .slice(0, Math.max(0, string.length))

export const getHighlightedStringFromPhrase = (phrase: string, string: string): string[] => {
  if (!phrase && !string) {
    return []
  }

  const firstLettersOfWord = getFirstLettersOfWord(phrase, string)
  const slpittedPhrase = phrase.split(firstLettersOfWord)
  const result = [slpittedPhrase[0], firstLettersOfWord, slpittedPhrase[1]]

  return result
}

export const getIDfromApiUrl = (url: string): number => +url.split('/').reverse()[1]
