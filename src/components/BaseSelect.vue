<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  options: {
    type: Array,
    required: true,
  },
  placement: {
    type: String,
    default: 'bottom',
  },
  className: {
    type: String,
    default: '',
  },
  optionsClass: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'select'])

const isOpen = ref(false)
const selectRef = ref(null)
const dropdownRef = ref(null)
const isMounted = ref(false)

const selectedOption = computed(() => {
  return props.options.find((option) => option.value === props.modelValue) || props.options[0]
})

const toggle = () => {
  isOpen.value = !isOpen.value
}

const handleClickOutside = (event) => {
  if (!isMounted.value) return
  if (selectRef.value && !selectRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

const handleEscape = (event) => {
  if (event.key === 'Escape') {
    isOpen.value = false
  }
}

const select = (option) => {
  emit('update:modelValue', option.value)
  emit('select', option)
  isOpen.value = false
}

const getDropdownPosition = () => {
  if (!selectRef.value || !dropdownRef.value) return {}

  const rect = selectRef.value.getBoundingClientRect()
  const dropdownRect = dropdownRef.value.getBoundingClientRect()
  const viewportHeight = window.innerHeight
  const viewportWidth = window.innerWidth
  const margin = 8

  // Получаем элемент #app и его прокрутку
  const appElement = document.querySelector('#app')
  const scrollY = appElement?.scrollTop || 0

  // Получаем элемент .navigation и его размеры
  const navigationElement = document.querySelector('.navigation')
  const navigationElementHeight = navigationElement.getBoundingClientRect().height

  // Проверяем, поместится ли дропдаун снизу
  const spaceBelow = viewportHeight - (rect.bottom + margin + navigationElementHeight)
  const spaceAbove = rect.top + scrollY
  const dropdownHeight = dropdownRect.height + margin

  // Проверяем поместится ли дропдаун в ширину экрана
  const spaceRight = viewportWidth - rect.left - dropdownRect.width - margin

  // Определяем, нужно ли открывать вверх
  const shouldOpenUpward = spaceBelow < dropdownHeight && spaceAbove > dropdownHeight
  const shouldOpenLeft = spaceRight < 0

  const positions = {
    bottom: shouldOpenUpward
      ? {
          top: `${rect.top + scrollY - dropdownHeight}px`,
          left: `${shouldOpenLeft ? rect.left - spaceRight : rect.left}px`,
        }
      : {
          top: `${rect.bottom + scrollY + margin}px`,
          left: `${shouldOpenLeft ? rect.left + spaceRight : rect.left}px`,
        },
    left: shouldOpenUpward
      ? {
          top: `${rect.top + scrollY - dropdownHeight}px`,
          left: `${rect.left - dropdownRect.width + rect.width}px`,
        }
      : {
          top: `${rect.bottom + scrollY + margin}px`,
          left: `${rect.left - dropdownRect.width + rect.width}px`,
        },
  }

  return positions[props.placement] || positions.bottom
}

onMounted(() => {
  isMounted.value = true
  document.addEventListener('mousedown', handleClickOutside)
  document.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
  isMounted.value = false
  document.removeEventListener('mousedown', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
})
</script>

<template>
  <div :class="['select', className]" ref="selectRef">
    <div @click="toggle">
      <slot name="trigger" :isOpen="isOpen" :selected="selectedOption">
        <button class="select__trigger">
          {{ selectedOption?.label }}
        </button>
      </slot>
    </div>

    <Teleport to="#app">
      <Transition name="fade">
        <ul
          v-if="isOpen"
          ref="dropdownRef"
          :class="['select__options', optionsClass]"
          :style="{
            position: 'absolute',
            ...getDropdownPosition(),
          }"
        >
          <slot name="options" :options="options" :select="select">
            <li
              v-for="option in options"
              :key="option.value"
              :class="[
                'select__option',
                // { 'select__option--selected': option.value === modelValue },
              ]"
              @click="select(option)"
            >
              <slot name="option" :option="option">
                {{ option.label }}
              </slot>
            </li>
          </slot>
        </ul>
      </Transition>
    </Teleport>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.select {
  position: relative;
  display: inline-block;

  &__options {
    z-index: 15;
    min-width: 140px;
    border-radius: 10px;
    backdrop-filter: blur(15px);
    background: rgba(42, 38, 60, 0.75);
    box-shadow: 0px 15px 30px 0px rgba(0, 0, 0, 0.25);
  }

  &__option {
    cursor: pointer;
    background: transparent;
    transition: all 0.2s ease;
    padding: 18px 20px;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 500;
    line-height: 1.5;
    opacity: 0.4;
    &:hover {
      background: $gray;
      opacity: 1;
    }
    &--selected {
      background: $gray;
      opacity: 1;
    }

    @media (max-width: $smallBreakpoint) {
      padding: 10px 20px;
      font-size: 14px;
    }
  }
}

// Анимации
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
