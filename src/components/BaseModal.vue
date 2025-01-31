<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useBodyLock } from '@/composables/useBodyLock'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  className: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:isOpen'])
const modalRef = ref(null)

useBodyLock(() => props.isOpen)

const handleClose = () => {
  emit('update:isOpen', false)
}
const handleEscape = (e) => {
  if (e.key === 'Escape') {
    handleClose()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleEscape)
})

const handleContentClick = (e) => {
  e.stopPropagation()
}

// Добавим новые refs для отслеживания состояния
const isVisible = ref(false)
const mountAttempts = ref(0)
const MAX_MOUNT_ATTEMPTS = 3

// Модифицируем watch
watch(
  () => props.isOpen,
  async (newValue) => {
    console.log('Modal isOpen changed:', newValue)
    if (newValue) {
      alert('BaseModal received open command')
      mountAttempts.value = 0
      await tryMount()
    } else {
      console.log('Modal closing')
      isVisible.value = false
    }
  }
)

// Добавим функцию для попыток монтирования
const tryMount = async () => {
  mountAttempts.value++
  console.log(`Mount attempt ${mountAttempts.value}`)
  
  // Даем время на монтирование
  await new Promise(resolve => setTimeout(resolve, 100))
  
  if (!isVisible.value && mountAttempts.value < MAX_MOUNT_ATTEMPTS) {
    console.log('Modal not visible, retrying...')
    isVisible.value = true
    await tryMount()
  } else if (!isVisible.value) {
    console.error('Failed to mount modal after all attempts')
    alert('Modal mount failed')
  } else {
    console.log('Modal mounted successfully')
  }
}
</script>

<template>
  <Teleport to="#app">
    <Transition name="fade">
      <div 
        v-show="isOpen" 
        ref="modalRef" 
        class="modal" 
        @click="handleClose"
        v-if="isVisible || isOpen"
      >
        <div :class="['modal__container', className]">
          <div 
            class="modal__content" 
            @click="handleContentClick"
          >
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(18, 16, 27, 0.68);
  backdrop-filter: blur(2px);
  padding: 16px;
  z-index: 100;

  &__container {
    position: relative;
    width: 100%;
    max-width: 500px;
    margin: auto;
  }

  &__content {
    position: relative;
    width: 100%;
  }
}

// Animations
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
