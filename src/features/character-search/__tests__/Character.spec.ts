import { describe, expect, it } from 'vitest'

import { Character } from '../domain/entities/Character'

describe('Character Entity', () => {
  it('should create a valid character', () => {
    const character = new Character('1', 'Luke Skywalker', 'A young Jedi', 'luke.jpg', 'characters')

    expect(character.id).toBe('1')
    expect(character.name).toBe('Luke Skywalker')
    expect(character.description).toBe('A young Jedi')
    expect(character.image).toBe('luke.jpg')
    expect(character.endpoint).toBe('characters')
  })

  it('should throw error for empty id', () => {
    expect(() => {
      new Character('', 'Luke', 'Description', 'image.jpg', 'characters')
    }).toThrow('Character ID cannot be empty')
  })

  it('should throw error for empty name', () => {
    expect(() => {
      new Character('1', '', 'Description', 'image.jpg', 'characters')
    }).toThrow('Character name cannot be empty')
  })

  it('should return display name', () => {
    const character = new Character('1', 'Luke Skywalker', '', '', 'characters')

    expect(character.getDisplayName()).toBe('Luke Skywalker')
  })

  it('should check if has image', () => {
    const withImage = new Character('1', 'Luke', '', 'image.jpg', 'characters')
    const withoutImage = new Character('2', 'Leia', '', '', 'characters')

    expect(withImage.hasImage()).toBe(true)
    expect(withoutImage.hasImage()).toBe(false)
  })

  it('should build full image URL', () => {
    const character = new Character('1', 'Luke', '', 'luke.jpg', 'characters')
    const baseUrl = 'https://api.example.com'

    expect(character.getImageUrl(baseUrl)).toBe('https://api.example.com/characters/luke.jpg')
  })

  it('should handle absolute image URLs', () => {
    const character = new Character('1', 'Luke', '', 'https://cdn.example.com/luke.jpg', 'characters')
    const baseUrl = 'https://api.example.com'

    expect(character.getImageUrl(baseUrl)).toBe('https://cdn.example.com/luke.jpg')
  })

  it('should return empty string for missing image', () => {
    const character = new Character('1', 'Luke', '', '', 'characters')
    const baseUrl = 'https://api.example.com'

    expect(character.getImageUrl(baseUrl)).toBe('')
  })

  it('should compare characters by id', () => {
    const character1 = new Character('1', 'Luke', '', '', 'characters')
    const character2 = new Character('1', 'Different Name', '', '', 'characters')
    const character3 = new Character('2', 'Luke', '', '', 'characters')

    expect(character1.equals(character2)).toBe(true)
    expect(character1.equals(character3)).toBe(false)
  })

  it('should serialize to JSON', () => {
    const character = new Character('1', 'Luke', 'Jedi', 'luke.jpg', 'characters')
    const json = character.toJSON()

    expect(json).toEqual({
      id: '1',
      name: 'Luke',
      description: 'Jedi',
      image: 'luke.jpg',
      endpoint: 'characters',
    })
  })

  it('should create from API response', () => {
    const apiResponse = {
      id: '1',
      name: 'Luke Skywalker',
      description: 'A young Jedi',
      image: 'luke.jpg',
    }

    const character = Character.fromApiResponse(apiResponse, 'characters')

    expect(character.id).toBe('1')
    expect(character.name).toBe('Luke Skywalker')
    expect(character.description).toBe('A young Jedi')
    expect(character.image).toBe('luke.jpg')
    expect(character.endpoint).toBe('characters')
  })

  it('should handle missing fields in API response', () => {
    const apiResponse = {
      id: '1',
      name: 'Luke Skywalker',
    }

    const character = Character.fromApiResponse(apiResponse, 'characters')

    expect(character.description).toBe('')
    expect(character.image).toBe('')
  })
})
