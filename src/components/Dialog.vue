<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { useDisplay } from 'vuetify'

  interface Props {
    search: Item
    result: string
    isDialogShow: boolean
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    dialog: [value: boolean]
  }>()

  const display = useDisplay()
  const dialog = ref(false)

  watch(dialog, value => {
    emit('dialog', value)
  })

  watch(() => props.isDialogShow, value => {
    dialog.value = value
  })
</script>

<template>
  <div class="d-flex justify-center">
    <v-dialog
      v-model="dialog"
      :max-width="display.smAndDown.value ? '100%' : 560"
    >
      <v-card>
        <v-card-title class="text-h5">{{ search.name }}</v-card-title>
        <v-card-text>
          <pre class="result">{{ result }}</pre>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            variant="text"
            @click="dialog = false"
            @keyup="dialog = false"
          >
            OK
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.result {
  max-height: clamp(30vh, 50vh, 70vh);
  overflow: auto;

  /* white-space: pre-wrap; */
}
</style>
