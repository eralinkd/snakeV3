<template>
  <div class="base-textarea plateBg" :class="containerClasses">
    <div class="base-textarea__wrapper">
      <label v-if="label" :for="id" class="base-textarea__label">
        {{ label }}
      </label>
      <textarea
        :id="id"
        ref="textareaRef"
        :value="modelValue"
        v-bind="$attrs"
        class="base-textarea__field"
        :class="[className, { 'base-textarea__field--error': hasError }]"
        :placeholder="placeholder"
        :disabled="disabled"
        @input="onInput"
        @blur="onBlur"
        @focus="onFocus"
      />
    </div>

    <span v-if="hasError && errorMessage" class="base-textarea__error">
      {{ errorMessage }}
    </span>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  hasError: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  className: {
    type: String,
    default: '',
  },
  id: {
    type: String,
    default: () => `textarea-${Math.random().toString(36).slice(2, 11)}`,
  },
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

const textareaRef = ref(null)
const isFocused = ref(false)

const containerClasses = computed(() => ({
  'base-textarea--disabled': props.disabled,
  'base-textarea--error': props.hasError,
  'base-textarea--focused': isFocused.value,
}))

const onInput = (event) => {
  emit('update:modelValue', event.target.value)
}

const onBlur = (event) => {
  isFocused.value = false
  emit('blur', event)
}

const onFocus = (event) => {
  isFocused.value = true
  emit('focus', event)
}

// Метод для программного фокуса на textarea
const focus = () => {
  textareaRef.value?.focus()
}

// Экспортируем метод focus для использования через template ref
defineExpose({ focus })
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.base-textarea {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 17px 20px;
  border-radius: 16px;
  position: relative;
  margin-bottom: 10px;

  &__label {
    font-size: 10px;
    line-height: 150%;
    opacity: 0.8;
  }

  &__wrapper {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__field {
    width: 100%;
    min-height: 80px;
    resize: none;
    color: $mainColor;
    padding: 16px;
    font-size: 16px;
    font-weight: 700;
    background: $bgColor;
    border-radius: 10px;
    transition: all 0.3s ease 0s;
    border: 1px solid transparent;

    &::placeholder {
      color: rgba(255, 255, 255, 0.3);
    }

    &:focus {
      outline: none;
      border-color: $accent;
    }

    &--error {
      border-color: $warning;
    }

    &:disabled {
      cursor: not-allowed;
    }

    @media (max-width: $smallBreakpoint) {
      min-height: 60px;
      font-size: 14px;
    }
  }

  &__error {
    position: absolute;
    bottom: 0;
    left: 0;
    transform: translate(5px, calc(100% + 4px));
    color: $warning;
  }

  &--disabled {
    opacity: 0.6;
  }

  @media (max-width: $smallBreakpoint) {
    padding: 10px 14px 10px 10px;
  }
}
</style>
