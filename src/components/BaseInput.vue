<template>
  <div class="base-input plateBg" :class="containerClasses">
    <div class="base-input__wrapper">
      <input
        :id="id"
        ref="inputRef"
        :value="modelValue"
        v-bind="$attrs"
        class="base-input__field"
        :class="[className, { 'base-input__field--error': hasError }]"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :type="type"
        @input="onInput"
        @blur="onBlur"
        @focus="onFocus"
      />

      <label v-if="label" :for="id" class="base-input__label">
        {{ label }}
      </label>
    </div>

    <span v-if="hasError && errorMessage" class="base-input__error">
      {{ errorMessage }}
    </span>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
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
  type: {
    type: String,
    default: 'text',
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
    default: () => `input-${Math.random().toString(36).slice(2, 11)}`,
  },
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

const inputRef = ref(null)
const isFocused = ref(false)

const containerClasses = computed(() => ({
  'base-input--disabled': props.disabled,
  'base-input--error': props.hasError,
  'base-input--focused': isFocused.value,
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

// Метод для программного фокуса на инпут
const focus = () => {
  inputRef.value?.focus()
}

// Экспортируем метод focus для использования через template ref
defineExpose({ focus })
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.base-input {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 20px 12px 12px;
  border-radius: 16px;
  position: relative;
  margin-bottom: 10px;

  &__label {
    font-size: 16px;
    font-weight: 700;
    line-height: 150%;
    @media (max-width: $smallBreakpoint) {
      font-size: 10px;
      opacity: 0.8;
    }
  }

  &__wrapper {
    display: flex;
    align-items: center;
    gap: 16px;

    @media (max-width: $smallBreakpoint) {
      align-items: stretch;
      flex-direction: column-reverse;
      gap: 12px;
    }
  }

  &__field {
    width: auto;
    flex: 1 1 auto;
    color: $mainColor;
    padding: 0 16px;
    height: 56px;
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
      height: 40px;
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
