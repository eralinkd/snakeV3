<script setup>
import { computed, ref, watch } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import BaseBottomSheet from '@/components/BaseBottomSheet.vue'
import CurrencyInfo from '@/components/CurrencyInfo.vue'
import { currencyImages } from '@/constants/constants'
import BaseTextarea from '@/components/BaseTextarea.vue'
import { replenishBalance } from '@/api/marketApi'
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
          <!-- <QRCodeVue3
            :value="depositAddress"
            :dots-options="{
              type: 'dots',
              color: '#836DCE',
            }"
            :corners-square-options="{
              type: 'extra-rounded',
              color: '#836DCE',
            }"
            :corners-dot-options="{
              type: 'dot',
              color: '#836DCE',
            }"
            render-as="svg"
            :size="280"
            level="L"
            background="transparent"
            foreground="#836DCE"
            class="deposit__qr-code"
          /> -->
          <img :src="qrCode" alt="QR код для пополнения" />
        </div>

        <BaseTextarea
          :model-value="depositAddress"
          readonly
          label="Адрес для пополнения"
          placeholder="Адрес загружается..."
        />

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
</style>
