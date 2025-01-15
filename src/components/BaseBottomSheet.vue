<script setup>
import { ref, watch } from 'vue'
import { useBodyLock } from '@/composables/useBodyLock'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  maxHeight: {
    type: String,
    default: '100vh',
  },
})

const emit = defineEmits(['update:isOpen'])

// Используем composable напрямую с props.isOpen
useBodyLock(() => props.isOpen)

const sheet = ref(null)
const startY = ref(0)
const currentY = ref(0)
const isDragging = ref(false)

const close = () => {
  emit('update:isOpen', false)
}

const handleTouchStart = (e) => {
  startY.value = e.touches[0].clientY
  isDragging.value = true
  sheet.value.style.transition = 'none'
}

const handleTouchMove = (e) => {
  if (!isDragging.value) return

  e.preventDefault()
  currentY.value = e.touches[0].clientY - startY.value

  if (currentY.value < 0) {
    currentY.value = 0
  }

  sheet.value.style.transform = `translateY(${currentY.value}px)`
}

const handleTouchEnd = () => {
  isDragging.value = false
  sheet.value.style.transition = 'transform 0.3s ease'
  const sheetHeight = sheet.value.offsetHeight

  if (currentY.value > sheetHeight * 0.4) {
    close()
  } else {
    sheet.value.style.transform = 'translateY(0)'
  }

  currentY.value = 0
}
</script>

<template>
  <Teleport to="#app">
    <Transition name="fade">
      <div v-if="isOpen" class="bottom-sheet">
        <div class="bottom-sheet__overlay" @click="close" />
        <Transition name="slide">
          <div
            v-if="isOpen"
            ref="sheet"
            class="bottom-sheet__content"
            :style="{ maxHeight }"
            @touchstart="handleTouchStart"
            @touchmove="handleTouchMove"
            @touchend="handleTouchEnd"
          >
            <div class="bottom-sheet__drag-handle" />
            <div class="bottom-sheet__inner">
              <slot />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.bottom-sheet {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 100;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;

  &__overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(18, 16, 27, 0.68);
    backdrop-filter: blur(2px);
  }

  &__content {
    position: relative;
    z-index: 101;
    touch-action: none;
    transform: translateY(0);
    border-radius: 16px 16px 0px 0px;
    background: $plateBg;
    box-shadow: 0px 7px 30px 0px rgba(0, 0, 0, 0.27);
    backdrop-filter: blur(15px);
    padding: 40px 24px 100px 24px;
    overflow-y: auto;
  }

  &__drag-handle {
    position: absolute;
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    width: 38%;
    height: 5px;
    border-radius: 4px;
    background: rgba(131, 109, 206, 0.39);
  }

  &__inner {
    margin-top: 12px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
}

// Анимации
.fade-enter-active,
.fade-leave-active {
  backdrop-filter: blur(2px);
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  backdrop-filter: blur(2px);
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateY(100%);
}
</style>
