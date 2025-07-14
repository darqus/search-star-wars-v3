// Специальная конфигурация для проверки сортировки атрибутов Vue
module.exports = {
  extends: ['plugin:vue/vue3-recommended'],
  rules: {
    'vue/attributes-order': [
      'error',
      {
        order: [
          'DEFINITION', // is, v-is
          'LIST_RENDERING', // v-for item in items
          'CONDITIONALS', // v-if, v-else-if, v-else, v-show, v-cloak
          'RENDER_MODIFIERS', // v-pre, v-once
          'GLOBAL', // id
          ['UNIQUE', 'SLOT'], // ref, key, v-slot, slot
          'TWO_WAY_BINDING', // v-model
          'OTHER_DIRECTIVES', // v-custom-directive
          'OTHER_ATTR', // custom-prop="foo", src="bar"
          'EVENTS', // @click="functionCall", v-on="event"
          'CONTENT', // v-text, v-html
        ],
        alphabetical: true,
      },
    ],
  },
}
