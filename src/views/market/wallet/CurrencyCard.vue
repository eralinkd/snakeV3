<script setup>
import { ref, watch, computed } from 'vue'
import { useMarketStore } from '@/stores/marketStore'
import { MARKET_TAB_NAMES } from '@/constants/marketTabs'
import CurrencyInfo from '@/components/CurrencyInfo.vue'
import { currencyImages } from '@/constants/constants'
import BaseSelect from '@/components/BaseSelect.vue'
import WithdrawBottomSheet from './WithdrawBottomSheet.vue'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  amount: {
    type: [Number, String],
    default: '0.00',
  },
})

const marketStore = useMarketStore()

const imageSrc = computed(() => currencyImages[props.item.apiName] || currencyImages.default)

const selectedAction = ref('')
const actions = computed(() => {
  const availableActions = []

  if (props.item.replenishment) {
    availableActions.push({ value: 'deposit', label: 'Пополнить' })
  }
  if (props.item.withdraw) {
    availableActions.push({ value: 'withdraw', label: 'Вывести' })
  }
  if (props.item.swap) {
    availableActions.push({ value: 'swap', label: 'Обмен' })
  }

  return availableActions
})

const isWithdrawOpen = ref(false)

const handleAction = (action) => {
  if (action.value === 'swap') {
    marketStore.setActiveTab(MARKET_TAB_NAMES.SWAP)
  } else if (action.value === 'withdraw') {
    isWithdrawOpen.value = true
  }
}
</script>

<template>
  <article class="currency-card plateBg">
    <div class="currency-card__content">
      <CurrencyInfo :imgSrc="imageSrc" :title="item.simpleName" :text="item.type" />

      <div class="currency-card__actions">
        <span class="currency-card__value">
          {{ amount }}
        </span>
        <BaseSelect
          v-model="selectedAction"
          :options="actions"
          placement="left"
          @select="handleAction"
        >
          <template #trigger="{ isOpen }">
            <button class="currency-card__more-actions">
              <svg
                width="4"
                height="16"
                viewBox="0 0 4 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M0.75 8.00006C0.75 8.69042 1.30964 9.25006 2 9.25006H2.00833C2.69869 9.25006 3.25833 8.69042 3.25833 8.00006V7.99173C3.25833 7.30137 2.00833 6.74173 2.00833 6.74173C2.00833 6.74173 2.00325 6.74172 2 6.74173C1.30965 6.74402 0.75 7.30137 0.75 7.99173V8.00006Z"
                  fill="white"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M0.75 13.8334C0.75 14.5237 1.30964 15.0834 2 15.0834H2.00833C2.69869 15.0834 3.25833 14.5237 3.25833 13.8334V13.825C3.25833 13.1347 2.69869 12.575 2.00833 12.575H2C1.30964 12.575 0.75 13.1347 0.75 13.825V13.8334Z"
                  fill="white"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M0.75 2.16669C0.75 2.85704 1.30964 3.41669 2 3.41669H2.00833C2.69869 3.41669 3.25833 2.85704 3.25833 2.16669V2.15835C3.25833 1.468 2.69869 0.908353 2.00833 0.908353H2C1.30964 0.908353 0.75 1.468 0.75 2.15835V2.16669Z"
                  fill="white"
                />
              </svg>
            </button>
          </template>
        </BaseSelect>
      </div>
    </div>
  </article>

  <WithdrawBottomSheet v-model:is-open="isWithdrawOpen" :currency="item" :balance="amount" />
</template>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.currency-card {
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
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  &__value {
    text-align: center;
    font-size: 20px;
    font-weight: 700;
    line-height: 1.2;
    @media (max-width: $smallBreakpoint) {
      font-size: 18px;
    }
  }

  &__more-actions {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
.info-currency-card {
}
</style>
