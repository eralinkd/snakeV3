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
})

const emit = defineEmits(['update:modelValue', 'select'])

const isOpen = ref(false)
const selectRef = ref(null)
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
  if (!selectRef.value) return {}

  const rect = selectRef.value.getBoundingClientRect()
  const positions = {
    bottom: {
      top: `${rect.bottom + 8}px`,
      left: `${rect.left}px`,
    },
    top: {
      bottom: `${window.innerHeight - rect.top + 8}px`,
      left: `${rect.left}px`,
    },
    right: {
      top: `${rect.top}px`,
      left: `${rect.right + 8}px`,
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
  <div class="select" ref="selectRef">
    <div @click="toggle">
      <slot name="trigger" :isOpen="isOpen" :selected="selectedOption">
        <button class="select__trigger">
          {{ selectedOption?.label }}
        </button>
      </slot>
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <ul
          v-if="isOpen"
          class="select__options"
          :style="{
            position: 'fixed',
            ...getDropdownPosition(),
          }"
        >
          <slot name="options" :options="options" :select="select">
            <li
              v-for="option in options"
              :key="option.value"
              :class="[
                'select__option',
                { 'select__option--selected': option.value === modelValue },
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
    position: fixed;
    z-index: 15;
    min-width: 140px;
    padding: 8px;
    border-radius: 12px;
    background: $mainBg;
    border: 1px solid rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(15px);

    &--bottom {
      top: 100%;
      left: 0;
    }

    &--top {
      bottom: 100%;
      left: 0;
    }

    &--right {
      top: 0;
      left: 100%;
      margin-top: 0;
      margin-left: 8px;
    }
  }

  &__option {
    padding: 12px;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.2s ease;
    color: rgba(255, 255, 255, 0.6);

    &:hover {
      background: rgba(174, 139, 255, 0.1);
      color: #fff;
    }

    &--selected {
      color: #fff;
      background: $accent;
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
