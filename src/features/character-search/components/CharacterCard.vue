<script setup lang="ts">
import { computed, inject } from 'vue'

import type { Character } from '../domain/entities/Character'

import { TOKENS } from '@/shared/di/Container'

/**
 * Component props
 */
type Props = {
  character: Character
  maxDescriptionLength?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxDescriptionLength: 100,
})

/**
 * Component emits
 */
type Emits = {
  click: []
}

defineEmits<Emits>()

/**
 * Inject dependencies
 */
const imageBaseUrl = inject<string>(TOKENS.IMAGE_BASE_URL, '')

/**
 * Computed properties
 */
const truncatedDescription = computed(() => {
  if (!props.character.description) {
    return ''
  }

  if (props.character.description.length <= props.maxDescriptionLength) {
    return props.character.description
  }

  return `${props.character.description.slice(0, props.maxDescriptionLength)}...`
})

const endpointLabel = computed(() => {
  const labels: Record<string, string> = {
    characters: 'Персонаж',
    creatures: 'Существо',
    droids: 'Дроид',
    locations: 'Локация',
    organizations: 'Организация',
    species: 'Вид',
    vehicles: 'Транспорт',
  }

  return labels[props.character.endpoint] ?? props.character.endpoint
})

const endpointColor = computed(() => {
  const colors: Record<string, string> = {
    characters: 'blue',
    creatures: 'green',
    droids: 'orange',
    locations: 'purple',
    organizations: 'red',
    species: 'teal',
    vehicles: 'brown',
  }

  return colors[props.character.endpoint] ?? 'grey'
})

/**
 * Handle image load error
 */
const onImageError = (): void => {
  console.warn(`Failed to load image for character: ${props.character.name}`)
}
</script>

<template>
  <v-card
    class="character-card"
    elevation="2"
    hover
    @click="$emit('click')"
  >
    <div
      v-if="character.hasImage()"
      class="character-image"
    >
      <v-img
        :alt="character.name"
        :src="character.getImageUrl(imageBaseUrl)"
        height="200"
        cover
        @error="onImageError"
      />
    </div>

    <div
      v-else
      class="character-placeholder"
    >
      <v-icon
        color="grey-lighten-1"
        icon="mdi-account-outline"
        size="64"
      />
    </div>

    <v-card-title class="character-name">
      {{ character.getDisplayName() }}
    </v-card-title>

    <v-card-text
      v-if="character.description"
      class="character-description"
    >
      {{ truncatedDescription }}
    </v-card-text>

    <v-card-actions class="character-actions">
      <v-chip
        :color="endpointColor"
        size="small"
        variant="tonal"
      >
        {{ endpointLabel }}
      </v-chip>

      <v-spacer />

      <v-btn
        icon="mdi-chevron-right"
        size="small"
        variant="text"
        @click.stop="$emit('click')"
      />
    </v-card-actions>
  </v-card>
</template>

<style scoped lang="scss">
.character-card {
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
}

.character-image {
  position: relative;
}

.character-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  background-color: rgba(var(--v-theme-surface-variant), 0.3);
}

.character-name {
  font-weight: 600;
  line-height: 1.2;
  padding-bottom: 0.5rem;
}

.character-description {
  font-size: 0.9rem;
  line-height: 1.4;
  color: rgba(var(--v-theme-on-surface), 0.8);
  padding-top: 0;
}

.character-actions {
  align-items: center;
  padding-top: 0.5rem;
}

@media (max-width: 768px) {
  .character-card {
    &:hover {
      transform: none;
    }
  }
}
</style>
