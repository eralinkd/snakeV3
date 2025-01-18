<script setup>
import { computed, watch } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import BaseBottomSheet from '@/components/BaseBottomSheet.vue'
import CurrencyInfo from '@/components/CurrencyInfo.vue'
import { currencyImages } from '@/constants/constants'
import { replenishBalance } from '@/api/marketApi'
import copyIcon from '../../../assets/copy-icon.svg'
import Spinner from '@/components/Spinner.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  currency: {
    type: Object,
    required: true,
  },
  balance: {
    type: [Number, String],
    required: true,
  },
})

const emit = defineEmits(['update:isOpen'])

const imageSrc = computed(() => currencyImages[props.currency.apiName] || currencyImages.default)

const {
  data: depositData,
  refetch,
  isError,
  isLoading,
} = useQuery({
  queryKey: ['deposit-address', props.currency?.apiName],
  queryFn: () => replenishBalance({ crypto: props.currency.apiName }),
  enabled: false,
  staleTime: 30 * 60 * 1000,
  cacheTime: 31 * 60 * 1000,
})

const depositAddress = computed(() => depositData.value?.address || '')
const qrCode = computed(() => depositData.value?.qrCode || '')

watch(
  () => props.isOpen,
  (newValue) => {
    if (newValue && props.currency?.apiName) {
      refetch()
    }
  },
)

const closeModal = () => {
  emit('update:isOpen', false)
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(depositAddress.value)
  } catch (err) {
    console.error('Failed to copy text: ', err)
  }
}

// const qrOptions = {
//   width: 300,
//   color: {
//     dark: '#836DCE',
//     light: '#00000000',
//   },
//   background: '#000',
// }
</script>

<template>
  <BaseBottomSheet :is-open="isOpen" @update:is-open="closeModal">
    <div class="deposit">
      <div class="deposit__content">
        <div class="deposit__currency-line">
          <CurrencyInfo :img-src="imageSrc" :title="currency.simpleName" :text="currency.type" />
          <div class="deposit__balance">
            <h4>{{ balance }}</h4>
            <span>Баланс</span>
          </div>
        </div>

        <div v-if="isLoading" class="deposit__qr-placeholder">
          <Spinner />
        </div>

        <div v-else-if="depositAddress" class="deposit__qr">
          <img :src="qrCode" alt="QR код для пополнения" />
        </div>

        <div class="address-field plateBg">
          <div class="address-field__content">
            <div class="address-field__text-wrapper">
              <span class="address-field__label">Адрес пополнения</span>
              <div class="address-field__text">
                {{ depositAddress || 'Адрес загружается...' }}
              </div>
            </div>
            <button
              class="address-field__copy-btn"
              @click="copyToClipboard"
              :disabled="!depositAddress"
            >
              <img :src="copyIcon" alt="Копировать" />
            </button>
          </div>
        </div>

        <div class="deposit__info">
          <p>
            У вас есть 30 минут на пополнение этого кошелька, любая сумма, отправленная сюда будет
            пополненна на ваш баланс
          </p>
        </div>
      </div>
    </div>
  </BaseBottomSheet>
</template>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.deposit {
  &__content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__currency-line {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 24px;
  }

  &__balance {
    display: flex;
    flex-direction: column;
    gap: 2px;
    text-align: right;
    & > h4 {
      font-size: 20px;
      font-weight: 700;
      line-height: 150%;
      @media (max-width: $smallBreakpoint) {
        font-size: 18px;
      }
    }
    & > span {
      font-size: 10px;
      line-height: 150%;
      opacity: 0.8;
    }
  }

  &__info {
    font-size: 12px;
    line-height: 150%;
    opacity: 0.6;
    display: flex;
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }

  &__qr {
    width: 100%;
    aspect-ratio: 1/1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 16px;
    border-radius: 12px;
    background: $plateBg;
    backdrop-filter: blur(10px);
    & > img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  &__qr-placeholder {
    width: 100%;
    aspect-ratio: 1/1;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
  }
}

.address-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 17px 20px;
  border-radius: 16px;
  position: relative;
  margin-bottom: 10px;

  &__label {
    font-size: 10px;
    line-height: 150%;
    opacity: 0.8;
    line-height: 1.5;
  }

  &__content {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  &__text-wrapper {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1 1 auto;
  }

  &__text {
    font-size: 16px;
    font-weight: 700;
    line-height: 1.5;
    word-break: break-all;
    @media (max-width: $smallBreakpoint) {
      font-size: 14px;
    }
  }

  &__copy-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      opacity: 0.8;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    & > img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  @media (max-width: $smallBreakpoint) {
    padding: 10px 14px 10px 10px;
  }
}
</style>
