<template>
  <article :class="['history-card', cardClasses]">
    <CurrencyInfo v-if="item.paymentType === 'WITHDRAW'" :imgSrc="imageSrc" :title="item.crypto">
      <template #text>
        <div class="history-card__status-wrapper">
          <div class="history-card__status-image">
            <img
              :src="pendingIcon"
              :alt="t('market.history.alt_pending')"
              v-if="!item.confirmed && !item.canceled"
            />
            <img
              :src="errorIcon"
              :alt="t('market.history.alt_error')"
              v-else-if="item.canceled && !item.confirmed"
            />
            <img
              :src="successIcon"
              :alt="t('market.history.alt_success')"
              v-else-if="item.confirmed && !item.canceled"
            />
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
    <CurrencyInfo
      v-else-if="item.paymentType === 'REPLENISHMENT'"
      :imgSrc="imageSrc"
      :title="item.crypto"
      :text="formatTime(item.timePassed)"
    />
    <CurrencyInfo
      v-else-if="item.paymentType === 'SWAP'"
      :imgSrc="imageSrc"
      :title="item.crypto"
      :text="formatTime(item.timePassed)"
    >
      <template #image>
        <div class="history-card__swap-image">
          <img
            class="history-card__swap-image--from"
            :src="imageSrc"
            :alt="t('market.history.alt_crypto')"
          />
          <img
            class="history-card__swap-image--to"
            :src="currencyImages[sourceData[0]]"
            :alt="t('market.history.alt_crypto')"
          />
        </div>
      </template>
      <template #title>
        <div class="history-card__swap-title">
          <span>{{ item.crypto }}</span>
          <div class="history-card__swap-arrow">
            <img :src="swapArrow" :alt="t('market.history.alt_swap_arrow')" />
          </div>
          <span>{{ sourceData[0] }}</span>
        </div>
      </template>
    </CurrencyInfo>
    <div class="history-card__info">
      <span class="history-card__amount history-card-amount">
        {{
          item.paymentType === 'SWAP'
            ? formatAmount(Number(sourceData[1]).toFixed(2), item.paymentType)
            : formatAmount(item.amount, item.paymentType)
        }}
      </span>
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
import swapArrow from '@/assets/history/filter-swap.svg'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
})

const { t } = useI18n()

// Получение данных для SWAP операции
const sourceData = computed(() => {
  if (!props.item.source) return ''
  return props.item.source.split('|')
})

const imageSrc = computed(() => currencyImages[props.item.crypto] || currencyImages.default)

const cardClasses = computed(() => ({
  'history-card--withdraw': props.item.paymentType === 'WITHDRAW',
  'history-card--deposit': props.item.paymentType === 'REPLENISHMENT',
  'history-card--swap': props.item.paymentType === 'SWAP',
}))

const getStatusText = computed(() => {
  if (props.item.paymentType === 'WITHDRAW') {
    if (props.item.confirmed) return t('market.history.status_success')
    if (props.item.canceled) return t('market.history.status_declined')
    return t('market.history.status_processing')
  }
  return formatTime(props.item.timePassed)
})

const formatAmount = (amount, operationType) => {
  const sign = operationType === 'WITHDRAW' ? '-' : operationType === 'REPLENISHMENT' ? '+' : ''
  return `${sign}${amount}`
}

const formatTime = (milliseconds) => {
  if (milliseconds < 60) {
    return t('market.history.time_just_now')
  }

  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)

  const getPlural = (number, type) => {
    if (number % 10 === 1 && number % 100 !== 11) {
      return t(`market.history.time_${type}_one`)
    } else if ([2, 3, 4].includes(number % 10) && ![12, 13, 14].includes(number % 100)) {
      return t(`market.history.time_${type}_few`)
    } else {
      return t(`market.history.time_${type}_many`)
    }
  }

  if (minutes < 60) {
    return `${minutes} ${getPlural(minutes, 'minute')}`
  } else if (hours < 24) {
    return `${hours} ${getPlural(hours, 'hour')}`
  } else if (days < 7) {
    return `${days} ${getPlural(days, 'day')}`
  } else if (days < 30) {
    return `${weeks} ${getPlural(weeks, 'week')}`
  } else if (days < 365) {
    return `${months} ${getPlural(months, 'month')}`
  } else {
    return `${years} ${getPlural(years, 'year')}`
  }
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
  flex-wrap: wrap;
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
    margin-left: auto;
    & > span {
      letter-spacing: 2px;
      font-size: 20px;
      font-weight: 700;
      line-height: 1.2;
    }
  }

  &__swap-title {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    & > span {
      font-size: 16px;
      font-weight: 700;
      line-height: 1.5;
      @media (max-width: $smallBreakpoint) {
        font-size: 14px;
      }
    }
  }

  &__swap-arrow {
    width: 20px;
    height: 20px;
    & > img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  &__swap-image {
    position: relative;
    width: 46px;
    height: 46px;
    & > img {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      overflow: hidden;
    }
    &--from {
      position: absolute;
      top: 0;
      left: 0;
    }
    &--to {
      position: absolute;
      bottom: 0;
      right: 0;
    }
    @media (max-width: $smallBreakpoint) {
      width: 36px;
      height: 36px;
      & > img {
        width: 24px;
        height: 24px;
      }
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
