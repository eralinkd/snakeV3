<template>
  <div class="swap">
    <div v-if="isLoading || isLoadingUser" class="spinner-container">
      <Spinner />
    </div>

    <div v-else-if="isError || isBalancesError" class="error">Failed to fetch data</div>

    <template v-else>
      <div class="content">
        <div class="swap-card">
          <BaseInput
            v-model="formattedAmountFrom"
            type="number"
            placeholder="0.00"
            class="swap-card__input"
            without-plate
          />

          <BaseSelect
            v-model="selectedFrom"
            :options="swappableOptions"
            placement="left"
            @select="handleAction"
            class="swap-card__select"
          >
            <template #trigger="{ selected, isOpen }">
              <button :class="['swap-card__select-trigger', { 'filter-button--active': isOpen }]">
                <img
                  class="swap-card__select-trigger-icon"
                  :src="icons[selected.value]"
                  alt="filter icon"
                />
                <div class="swap-card__select-trigger-text">
                  <p>{{ selected.label }}</p>
                  <span>Продано</span>
                </div>
                <div
                  :class="[
                    'filter-button__icon-container',
                    { 'filter-button__icon-container--rotate': isOpen },
                  ]"
                >
                  <svg
                    width="10"
                    height="7"
                    viewBox="0 0 10 7"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M5.58925 6.25594C5.26383 6.58135 4.73617 6.58135 4.41075 6.25594L0.244075 2.08928C-0.0813583 1.76384 -0.0813583 1.2362 0.244075 0.910762C0.569517 0.585329 1.09715 0.585329 1.42259 0.910762L5 4.48819L8.57742 0.910762C8.90283 0.585329 9.4305 0.585329 9.75592 0.910762C10.0813 1.2362 10.0813 1.76384 9.75592 2.08928L5.58925 6.25594Z"
                      fill="white"
                    />
                  </svg>
                </div>
              </button> </template
          ></BaseSelect>
        </div>
        <div class="switch" @click="handleSwitch">
          <img :src="switchIcon" alt="swap" />
        </div>
        <div class="swap-card">
          <BaseInput
            v-model="formattedAmountTo"
            type="number"
            placeholder="0.00"
            class="swap-card__input"
            :readonly="true"
            without-plate
          />

          <BaseSelect
            v-model="selectedTo"
            :options="availableOptionsTo"
            placement="left"
            @select="handleAction"
            class="swap-card__select"
          >
            <template #trigger="{ selected, isOpen }">
              <button :class="['swap-card__select-trigger', { 'filter-button--active': isOpen }]">
                <img
                  class="swap-card__select-trigger-icon"
                  :src="icons[selected.value]"
                  alt="filter icon"
                />
                <div class="swap-card__select-trigger-text">
                  <p>{{ selected.label }}</p>
                  <span>Получено</span>
                </div>
                <div
                  :class="[
                    'filter-button__icon-container',
                    { 'filter-button__icon-container--rotate': isOpen },
                  ]"
                >
                  <svg
                    width="10"
                    height="7"
                    viewBox="0 0 10 7"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M5.58925 6.25594C5.26383 6.58135 4.73617 6.58135 4.41075 6.25594L0.244075 2.08928C-0.0813583 1.76384 -0.0813583 1.2362 0.244075 0.910762C0.569517 0.585329 1.09715 0.585329 1.42259 0.910762L5 4.48819L8.57742 0.910762C8.90283 0.585329 9.4305 0.585329 9.75592 0.910762C10.0813 1.2362 10.0813 1.76384 9.75592 2.08928L5.58925 6.25594Z"
                      fill="white"
                    />
                  </svg>
                </div>
              </button>
            </template>
          </BaseSelect>
        </div>

        <div class="swap__exchange_rate" v-if="exchangeRate">
          {{ exchangeRate }}
        </div>
        <BaseButton
          class="swap__submit"
          :disabled="!amountFrom || !amountTo || isSwapping"
          @click="handleSubmit"
        >
          Обменять
        </BaseButton>
      </div>
    </template>
    <BaseModal :isOpen="isModalOpen" @update:isOpen="handleModalClose" className="store-modal">
      <div class="store-modal__content">
        <BaseModalClose @click="handleModalClose" className="store-modal__close" />

        <template v-if="swapResponse">
          <div v-if="swapResponse.success" class="store-modal__frame store-modal__frame--success">
            <div class="store-modal__image">
              <img :src="success" alt="Успех" />
            </div>
            <h2 class="store-modal__title">Успех!</h2>
            <p class="store-modal__description">Обмен успешно выполнен!</p>
            <BaseButton @click="handleModalClose" type="button" size="small"
              >Окей, спасибо</BaseButton
            >
          </div>

          <div v-else class="store-modal__frame store-modal__frame--fail">
            <div class="store-modal__image">
              <img :src="fail" alt="ошибка" />
            </div>
            <h2 class="store-modal__title">Недостаточно средств</h2>
            <p class="store-modal__description">Для выполнения обмена требуется больше средств.</p>
            <BaseButton @click="handleModalClose" type="button" size="small"
              >Окей, спасибо</BaseButton
            >
          </div>
        </template>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import BaseSelect from '@/components/BaseSelect.vue'
import BaseInput from '@/components/BaseInput.vue'
import BaseButton from '@/components/BaseButton.vue'
import Spinner from '@/components/Spinner.vue'
import { ref, computed, watch } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { getUser, postUserSwap } from '@/api/userApi'
import { fetchCryptos, getSwapInfo, getExchangeRate } from '@/api/marketApi'
import switchIcon from '@/assets/swap/switch.svg'
import bitcoinIcon from '@/assets/currency-images/bitcoin.png'
import usdtIcon from '@/assets/currency-images/usdt.png'
import ethIcon from '@/assets/currency-images/eth.png'
import scoinIcon from '@/assets/currency-images/snake-coin.png'
import BaseModal from '@/components/BaseModal.vue'
import BaseModalClose from '@/components/BaseModalClose.vue'
import success from '@/assets/shop/purchase-success.svg'
import fail from '@/assets/shop/purchase-fail.svg'
import { useMutation } from '@tanstack/vue-query'

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

const icons = computed(() => {
  return new Proxy(
    {
      SCOIN: scoinIcon,
      BTC: bitcoinIcon,
      ETH: ethIcon,
      USDT_TRC20: usdtIcon,
    },
    {
      get: (target, prop) => target[prop] || scoinIcon,
    },
  )
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
    .filter((crypto) => crypto.swap)
    .map((crypto) => ({
      value: crypto.apiName,
      label: crypto.simpleName,
    }))
})

const selectedFrom = ref('')
const selectedTo = ref('')

watch(
  swappableOptions,
  (newOptions) => {
    if (newOptions.length > 0) {
      const scoinOption = newOptions.find((option) => option.value === 'SCOIN')
      const usdOption = newOptions.find((option) => option.value === 'USDT_TRC20')

      selectedFrom.value = scoinOption?.value || newOptions[0].value
      selectedTo.value = usdOption?.value || newOptions[1]?.value
    }
  },
  { immediate: true },
)

const availableOptionsTo = computed(() => {
  return swappableOptions.value.filter((option) => option.value !== selectedFrom.value)
})

watch(selectedFrom, (newValue) => {
  if (newValue === selectedTo.value) {
    selectedTo.value = ''
  }
})

const handleAction = () => {}

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
  },
})

const formattedAmountTo = computed(() => {
  if (!amountTo.value || !amountFrom.value) return ''

  const number = Number(amountTo.value).toFixed(6)

  return number.replace(/\.?0+$/, '')
})

const getExchangeRateValues = async () => {
  const response = await getExchangeRate(selectedFrom.value, selectedTo.value)
  return response
}

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
    const response = await getSwapInfo(selectedFrom.value, selectedTo.value, amountFrom.value)
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

const isModalOpen = ref(false)
const swapResponse = ref(null)

// Добавляем мутацию для swap
const { mutate: swapMutate, isPending: isSwapping } = useMutation({
  mutationFn: (data) => postUserSwap(data),
  onSuccess: (response) => {
    swapResponse.value = response
    isModalOpen.value = true
  },
  onError: (error) => {
    console.error('Swap error:', error)
    swapResponse.value = { success: false }
    isModalOpen.value = true
  },
})

const handleModalClose = () => {
  isModalOpen.value = false
  // Очищаем ответ только после закрытия модального окна
  setTimeout(() => {
    swapResponse.value = null
  }, 300)
}

const handleSubmit = () => {
  swapMutate({
    from: selectedFrom.value,
    to: selectedTo.value,
    amount: amountFrom.value,
  })
}

const exchangeRate = ref('')
const selectedFromCurrency = computed(() =>
  swappableOptions.value.find((option) => option.value === selectedFrom.value),
)
const selectedToCurrency = computed(() =>
  swappableOptions.value.find((option) => option.value === selectedTo.value),
)

// Обновляем watch для отображения курса
watch(
  [selectedFrom, selectedTo],
  async () => {
    if (selectedFrom.value && selectedTo.value) {
      try {
        const rate = await getExchangeRateValues()
        exchangeRate.value = `${rate.amount} ${selectedFromCurrency.value?.label} = ${Number(
          rate.price,
        )
          .toFixed(6)
          .replace(/\.?0+$/, '')} ${selectedToCurrency.value?.label}`
      } catch (error) {
        console.error('Error fetching exchange rate:', error)
        exchangeRate.value = ''
      }
    } else {
      exchangeRate.value = ''
    }
  },
  { immediate: true },
)
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.swap {
  position: relative;

  .content {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
    width: 100%;
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

  .switch {
    -webkit-tap-highlight-color: transparent;
    border-radius: 16px;
    box-shadow: 0px 7px 30px 0px rgba(0, 0, 0, 0.27);
    backdrop-filter: blur(30px);
    background: rgba(27, 24, 41, 0.75);
    width: 140px;
    height: 60px;
    padding: 12px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    cursor: pointer;

    @media (max-width: $smallBreakpoint) {
      width: 80.84px;
      height: 40px;
    }
  }

  .swap-card {
    -webkit-tap-highlight-color: transparent;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    width: 100%;
    padding: 12px 20px 12px 12px;
    border-radius: 16px;
    box-shadow: 0px 7px 30px 0px rgba(0, 0, 0, 0.27);
    backdrop-filter: blur(30px);
    background: rgba(27, 24, 41, 0.75);

    &__input {
      :deep(input) {
        width: 100%;
      }
    }

    &__select {
      max-width: 200px;
      display: flex;
      justify-content: flex-end;
    }

    &__select-trigger {
      display: flex;
      align-items: center;
      gap: 16px;

      &-icon {
        width: 46px;
        height: 46px;
        border-radius: 50%;
        @media (max-width: $smallBreakpoint) {
          width: 36px;
          height: 36px;
        }
      }

      &-text {
        display: flex;
        flex-direction: column;
        gap: 2px;

        p {
          color: #fff;
          font-size: 16px;
          font-weight: 700;
          line-height: 22px;
          letter-spacing: 0px;
          width: 72px;
          margin-right: 5px;
          text-align: left;
          @media (max-width: $smallBreakpoint) {
            width: 50px;
          }
        }

        span {
          color: #808080;
          font-size: 12px;
          font-weight: 400;
          line-height: 16px;
          letter-spacing: 0px;
          text-align: left;
        }
      }
    }
  }

  &__exchange_rate {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 60px;
    border-radius: 16px;
    box-shadow: 0px 7px 30px 0px rgba(0, 0, 0, 0.27);
    backdrop-filter: blur(30px);
    background: rgba(27, 24, 41, 0.75);

    @media (max-width: $smallBreakpoint) {
      height: 40px;
    }

    span {
      color: #fff;
      font-size: 14px;
      font-weight: 400;
      line-height: 22px;
      letter-spacing: 0px;
      text-align: center;
    }
  }
}

.store-modal {
  position: relative;
  &__close {
    position: absolute;
    top: 0px;
    right: 0px;
  }

  &__content {
    border-radius: 16px;
    background: $plateBg;
    box-shadow: 0px 7px 30px 0px rgba(0, 0, 0, 0.27);
    backdrop-filter: blur(15px);
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  &__frame {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    text-align: center;

    &--success {
      .store-modal__title {
        color: $success;
      }
    }

    &--fail {
      .store-modal__title {
        color: $warning;
      }
    }
  }

  &__image {
    width: 80px;
    height: 80px;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  &__title {
    font-size: 24px;
    font-weight: 700;
    line-height: 32px;
  }

  &__description {
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
    line-height: 20px;
    max-width: 280px;
  }
}
</style>
