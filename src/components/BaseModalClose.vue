<script setup>
import { computed } from 'vue'

const props = defineProps({
  className: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['click'])

const buttonClasses = computed(() => ['modal-close', props.className])
</script>

<template>
  <button :class="buttonClasses" @click="$emit('click')">
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M0.743563 0.757714C0.255401 1.24588 0.255401 2.03733 0.743563 2.52549L5.22499 7.00689L0.743563 11.4884C0.255401 11.9765 0.255401 12.768 0.743563 13.2561C1.23171 13.7443 2.02318 13.7443 2.51133 13.2561L6.99274 8.77464L11.4742 13.2561C11.9624 13.7443 12.7539 13.7443 13.242 13.2561C13.7301 12.768 13.7301 11.9765 13.242 11.4884L8.76049 7.00689L13.242 2.5255C13.7301 2.03735 13.7301 1.24589 13.242 0.757739C12.7537 0.269577 11.9624 0.269577 11.4742 0.757739L6.99274 5.23914L2.51133 0.757714C2.02318 0.269564 1.23171 0.269564 0.743563 0.757714Z"
        fill="#AE8BFF"
      />
    </svg>
  </button>
</template>

<style lang="scss" scoped>
.modal-close {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.7;
  }
}
</style>
