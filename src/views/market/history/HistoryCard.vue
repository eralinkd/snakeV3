<template>
  <article :class="['history-card', cardClasses]">
    <CurrencyInfo v-if="item.paymentType === 'WITHDRAW'" :imgSrc="imageSrc" :title="item.crypto">
      <template #text>
        <div class="history-card__status-wrapper">
          <div class="history-card__status-image">
            <img :src="pendingIcon" alt="pending" v-if="!item.confirmed && !item.canceled" />
            <img :src="errorIcon" alt="error" v-else-if="item.canceled && !item.confirmed" />
            <img :src="successIcon" alt="success" v-else-if="item.confirmed && !item.canceled" />
          </div>
          <span
            class="history-card__status"
            :class="{
              'history-card__status--processing': !item.confirmed && !item.canceled,
              'history-card__status--error': item.canceled && !item.confirmed,
              'history-card__status--success': item.confirmed && !item.canceled,
            }"
          >
            {{ getStatusText }}
          </span>
        </div>
      </template>
    </CurrencyInfo>
    <CurrencyInfo v-else :imgSrc="imageSrc" :title="item.crypto" text="50 мин назад" />
    <div class="history-card__info">
      <span class="history-card__amount history-card-amount">{{
        formatAmount(item.amount, item.paymentType)
      }}</span>
    </div>
  </article>
</template>

<script setup>
import CurrencyInfo from '@/components/CurrencyInfo.vue'
import { currencyImages } from '@/constants/constants'
import { computed } from 'vue'
import pendingIcon from '@/assets/history/pending.svg'
import successIcon from '@/assets/history/succeed.svg'
import errorIcon from '@/assets/history/declined.svg'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
})

// Получение данных для SWAP операции
// const [cryptoTo, amountTo] = computed(() => {
//   if (!props.item.source) return []
//   return props.item.source.split('|')
// })

const imageSrc = computed(() => currencyImages[props.item.apiName] || currencyImages.default)

const cardClasses = computed(() => ({
  'history-card--withdraw': props.item.paymentType === 'WITHDRAW',
  'history-card--deposit': props.item.paymentType === 'REPLENISHMENT',
  'history-card--swap': props.item.paymentType === 'SWAP',
}))

const getStatusText = computed(() => {
  if (props.item.paymentType === 'WITHDRAW') {
    if (props.item.confirmed) return 'Успех'
    if (props.item.canceled) return 'Отклонён'
    return 'Обработка . . .'
  }
  return '50 мин назад'
})

const formatAmount = (amount, operationType) => {
  const sign = operationType === 'WITHDRAW' ? '-' : operationType === 'REPLENISHMENT' ? '+' : ''
  return `${sign}${amount}`
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.history-card {
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border: 1px solid rgba(255, 255, 255, 0.13);
  backdrop-filter: blur(15px);
  box-shadow: 0px 7px 30px 0px rgba(0, 0, 0, 0.27);
  &--withdraw {
    background: linear-gradient(90deg, rgba(27, 24, 41, 0.75) 0%, rgba(61, 29, 51, 0.75) 100%);
    .history-card-amount {
      color: $warning;
    }
    @media (any-hover: hover) {
      &:hover {
        background: linear-gradient(90deg, rgba(52, 46, 81, 0.75) 0%, rgba(100, 45, 83, 0.75) 100%);
      }
    }
  }
  &--deposit {
    background: linear-gradient(90deg, rgba(27, 24, 41, 0.75) 0%, rgba(24, 45, 48, 0.75) 100%);
    .history-card-amount {
      color: $success;
    }
    @media (any-hover: hover) {
      &:hover {
        background: linear-gradient(90deg, rgba(52, 46, 81, 0.75) 0%, rgba(36, 71, 75, 0.75) 100%);
      }
    }
  }
  &--swap {
    background: linear-gradient(90deg, rgba(27, 24, 41, 0.75) 0%, rgba(45, 37, 74, 0.75) 100%);
    @media (any-hover: hover) {
      &:hover {
        background: linear-gradient(90deg, rgba(76, 64, 120, 0.75) 0%, rgba(52, 46, 81, 0.75) 100%);
      }
    }
  }

  &__info {
    display: flex;
    flex-direction: column;
    & > span {
      letter-spacing: 2px;
      font-size: 20px;
      font-weight: 700;
      line-height: 1.2;
    }
  }

  @media (max-width: $smallBreakpoint) {
    padding: 12px 16px;
  }
}

.history-card__status-wrapper {
  display: flex;
  align-items: center;
  gap: 2px;
}

.history-card__status {
  font-size: 10px;
  line-height: 1.5;
  &--success {
    color: $success;
  }
  &--error {
    color: $warning;
  }
  &--processing {
    color: $pending;
  }
}
</style>
