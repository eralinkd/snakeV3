<template>
  <li class="history-card plateBg">
    <div class="history-card__content">
      <div class="history-card__info">
        <span class="history-card__type">{{ getOperationType }}</span>
        <span class="history-card__date">{{ formatDate }}</span>
      </div>
      <div class="history-card__amount">
        <span :class="['history-card__value', getStatusClass]">
          {{ getAmountWithSign }}
        </span>
        <span class="history-card__currency">{{ item.currency }}</span>
      </div>
    </div>
  </li>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
})

const getOperationType = computed(() => {
  const types = {
    REPLENISHMENT: 'Пополнение',
    WITHDRAW: 'Вывод',
    SWAP: 'Обмен',
  }
  return types[props.item.type] || props.item.type
})

const getStatusClass = computed(() => {
  const classes = {
    REPLENISHMENT: 'history-card__value--success',
    WITHDRAW: 'history-card__value--warning',
    SWAP: 'history-card__value--pending',
  }
  return classes[props.item.type]
})

const getAmountWithSign = computed(() => {
  const sign = props.item.type === 'REPLENISHMENT' ? '+' : '-'
  return `${sign}${props.item.amount}`
})

const formatDate = computed(() => {
  return new Date(props.item.date).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.history-card {
  border-radius: 16px;
  padding: 20px;
  @media (max-width: $smallBreakpoint) {
    padding: 12px 16px;
  }

  &__content {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__type {
    font-size: 16px;
    font-weight: 700;
    line-height: 1.5;
    @media (max-width: $smallBreakpoint) {
      font-size: 14px;
    }
  }

  &__date {
    font-size: 12px;
    opacity: 0.6;
  }

  &__amount {
    text-align: right;
  }

  &__value {
    display: block;
    font-size: 20px;
    font-weight: 700;
    line-height: 1.2;
    @media (max-width: $smallBreakpoint) {
      font-size: 18px;
    }

    &--success {
      color: $success;
    }
    &--warning {
      color: $warning;
    }
    &--pending {
      color: $pending;
    }
  }

  &__currency {
    font-size: 12px;
    opacity: 0.6;
  }
}
</style>
