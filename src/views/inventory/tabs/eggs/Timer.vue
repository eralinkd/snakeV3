<template>
  <span class="timer">{{ formattedTime }}</span>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useTimerStore } from '@/stores/timerStore'

const props = defineProps({
  seconds: {
    type: Number,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
  isProcessing: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['timer-end'])
const timerStore = useTimerStore()

const formattedTime = computed(() => {
  const seconds = timerStore.getTimer(props.id)
  if (seconds <= 0) return '00:00:00'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
})

watch(
  () => props.isProcessing,
  (newValue) => {
    if (newValue) {
      timerStore.setTimer(props.id, props.seconds)
    } else {
      timerStore.setTimer(props.id, 0)
    }
  },
  { immediate: true },
)

watch(
  () => timerStore.getTimer(props.id),
  (newValue) => {
    if (newValue === 0 && props.isProcessing) {
      emit('timer-end')
    }
  },
)
</script>

<style lang="scss" scoped>
.timer {
  text-align: center;
  font-size: 36px;
  font-weight: 700;
  line-height: 150%;
}
</style>
