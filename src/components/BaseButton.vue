<script setup>
defineProps({
  className: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'button',
  },
  size: {
    type: String,
    default: 'big',
    validator: (value) => ['big', 'small'].includes(value),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['click'])

const handleClick = (event) => {
  emit('click', event)
}
</script>

<template>
  <button
    :type="type"
    :class="['base-button accentGrad', `base-button--${size}`, className]"
    :disabled="disabled"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.base-button {
  -webkit-tap-highlight-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.1s ease;
  border-radius: 16px;
  font-weight: 700;
  width: 100%;

  &:active {
    opacity: 0.7;
  }
  &--big {
    font-size: 20px;
    padding: 29px 15px;
    @media (max-width: $smallBreakpoint) {
      font-size: 18px;
      padding: 19px 10px;
    }
  }
  &--small {
    font-size: 16px;
    padding: 19px 15px;
    @media (max-width: $smallBreakpoint) {
      font-size: 14px;
      padding: 9px 10px;
    }
  }

  &:disabled {
    opacity: 0.5;
    background: $buttonBg;
    box-shadow: none;
    cursor: not-allowed;
  }
}
</style>
