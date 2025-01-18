<template>
  <div class="swap">
    <div v-if="isLoading || isLoadingUser" class="spinner-container">
      <Spinner />
    </div>

    <div v-else-if="isError || isBalancesError" class="error">
      Failed to fetch data
    </div>

    <template v-else>
      <div class="swap__content">
        <div class="swap__cards">
          <div class="swap-card plateBg">
            <div class="swap-card__header">
              <BaseSelect
                v-model="selectedFrom"
                :options="swappableOptions"
                placement="left"
                @select="handleAction"
                class="swap-card__select"
              />
              <div class="swap-card__balance">
                <span class="swap-card__balance-label">Баланс:</span>
                <span class="swap-card__balance-value">{{ balances?.[selectedFrom] || '0.00' }}</span>
              </div>
            </div>
            <BaseInput
              v-model="formattedAmountFrom"
              type="number"
              placeholder="0.00"
              class="swap-card__input"
              @input="handleAmountFromInput"
            />
          </div>

          <button class="swap__switch-button" @click="handleSwitch">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M7 10l5 5 5-5H7z" fill="currentColor"/>
            </svg>
          </button>

          <div class="swap-card plateBg">
            <div class="swap-card__header">
              <BaseSelect
                v-model="selectedTo"
                :options="availableOptionsTo"
                placement="left"
                @select="handleAction"
                class="swap-card__select"
              />
              <div class="swap-card__balance">
                <span class="swap-card__balance-label">Баланс:</span>
                <span class="swap-card__balance-value">{{ balances?.[selectedTo] || '0.00' }}</span>
              </div>
            </div>
            <div class="swap-card__input-wrapper">
              <BaseInput
                v-model="formattedAmountTo"
                type="number"
                placeholder="0.00"
                class="swap-card__input"
                :readonly="true"
              />
              <div v-if="isCalculating" class="swap-card__loader">
                <Spinner />
              </div>
            </div>
          </div>
        </div>

        <BaseButton 
          class="swap__submit" 
          :disabled="!amountFrom || !amountTo"
          @click="handleSubmit"
        >
          Обменять
        </BaseButton>
      </div>
    </template>
  </div>
</template>

<script setup>
import BaseSelect from '@/components/BaseSelect.vue'
import BaseInput from '@/components/BaseInput.vue'
import BaseButton from '@/components/BaseButton.vue'
import Spinner from '@/components/Spinner.vue'
import { ref, computed, watch, nextTick } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { getUser, postUserSwap } from '@/api/userApi'
import { fetchCryptos, getSwapInfo } from '@/api/marketApi'

const balances = ref(null)

const {
  data: cryptos,
  isLoading,
  isError,
} = useQuery({
  queryKey: ['cryptos'],
  queryFn: fetchCryptos,
  staleTime: 5 * 60 * 1000,
  cacheTime: 30 * 60 * 1000,
})

const {
  data: balancesResponse,
  isError: isBalancesError,
  isLoading: isLoadingUser,
} = useQuery({
  queryKey: ['balances'],
  queryFn: getUser,
})

watch(
  balancesResponse,
  (newValue) => {
    if (!isBalancesError.value) {
      balances.value = newValue?.balances
    }
  },
  { immediate: true },
)

const swappableOptions = computed(() => {
  if (!cryptos.value) return []
  return cryptos.value
    .filter(crypto => crypto.swap)
    .map(crypto => ({
      value: crypto.apiName,
      label: crypto.simpleName
    }))
})

const selectedFrom = ref('')
const selectedTo = ref('')

watch(swappableOptions, (newOptions) => {
  if (newOptions.length > 0) {
    const scoinOption = newOptions.find(option => option.value === 'SCOIN')
    const usdOption = newOptions.find(option => option.value === 'USDT_TRC20')
    
    selectedFrom.value = scoinOption?.value || newOptions[0].value
    selectedTo.value = usdOption?.value || newOptions[1]?.value
  }
}, { immediate: true })

const availableOptionsTo = computed(() => {
  return swappableOptions.value.filter((option) => option.value !== selectedFrom.value)
})

watch(selectedFrom, (newValue) => {
  if (newValue === selectedTo.value) {
    selectedTo.value = ''
  }
})

const handleAction = () => {
}

const amountFrom = ref('')
const amountTo = ref('')

const isCalculating = ref(false)

const formattedAmountFrom = computed({
  get: () => amountFrom.value,
  set: (value) => {
    if (value.includes('.')) {
      const [integer, decimal] = value.split('.')
      if (decimal && decimal.length > 2) {
        return
      }
    }
    amountFrom.value = value
  }
})

const formattedAmountTo = computed(() => {
  if (!amountTo.value || !amountFrom.value) return ''
  return Number(amountTo.value).toFixed(2)
})

const calculateAmountTo = async () => {
  if (!amountFrom.value || !selectedFrom.value || !selectedTo.value) {
    amountTo.value = ''
    return
  }

  const amount = parseFloat(amountFrom.value)
  if (isNaN(amount) || amount === 0) {
    amountTo.value = ''
    return
  }

  isCalculating.value = true
  try {
    const response = await getSwapInfo(
      selectedFrom.value,
      selectedTo.value,
      amountFrom.value
    )
    amountTo.value = response.price
  } catch (error) {
    console.error('Error calculating swap amount:', error)
    amountTo.value = ''
  } finally {
    isCalculating.value = false
  }
}

watch([selectedFrom, selectedTo, amountFrom], async () => {
  await calculateAmountTo()
})

const handleSwitch = async () => {
  const oldAmount = amountTo.value
  
  const tempFrom = selectedFrom.value
  selectedFrom.value = selectedTo.value
  selectedTo.value = tempFrom

  amountFrom.value = oldAmount
  await calculateAmountTo()
}

const handleSubmit = () => {
  console.log('Swap:', {
    from: selectedFrom.value,
    to: selectedTo.value,
    amountFrom: amountFrom.value,
    amountTo: amountTo.value
  })

  postUserSwap({
    from: selectedFrom.value,
    to: selectedTo.value,
    amount: amountFrom.value,
  })
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.swap {
  position: relative;

  &__content {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  &__submit {
    margin-top: 12px;
  }

  &__cards {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__switch-button {
    align-self: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    transition: all 0.2s ease;
    transform: rotate(0deg);

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    &:active {
      transform: rotate(180deg);
    }
  }

  .spinner-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
  }

  .error {
    color: $warning;
    text-align: center;
    padding: 20px;
  }
}

.swap-card {
  padding: 20px;
  border-radius: 16px;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  &__select {
    flex: 1;
  }

  &__balance {
    text-align: right;
    margin-left: 16px;
  }

  &__balance-label {
    opacity: 0.6;
    font-size: 14px;
    margin-right: 4px;
  }

  &__balance-value {
    font-size: 14px;
  }

  &__input-wrapper {
    position: relative;
    width: 100%;
  }

  &__loader {
    position: absolute;
    top: 50%;
    right: 12px;
    transform: translateY(-50%);
    
    :deep(.loader) {
      width: 20px;
      height: 20px;
      border-width: 1px;
    }
  }

  &__input {
    width: 100%;
    
    &:read-only {
      opacity: 1;
      cursor: default;
      background: transparent;
      color: inherit;
    }
  }

  @media (max-width: $smallBreakpoint) {
    padding: 16px;
  }
}
</style>
