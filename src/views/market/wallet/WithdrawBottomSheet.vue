<script setup>
import { computed, ref } from 'vue'
import { useMutation } from '@tanstack/vue-query'
import BaseBottomSheet from '@/components/BaseBottomSheet.vue'
import CurrencyInfo from '@/components/CurrencyInfo.vue'
import BaseButton from '@/components/BaseButton.vue'
import { currencyImages } from '@/constants/constants'
import { validatePaymentAddress, withdrawBalance } from '@/api/marketApi'
import BaseInput from '@/components/BaseInput.vue'
import BaseTextarea from '@/components/BaseTextarea.vue'

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

const emit = defineEmits(['update:isOpen', 'success'])

// Form state
const amount = ref('')
const address = ref('')
const amountError = ref('')
const addressError = ref('')
const isLoading = ref(false)
const imageSrc = computed(() => currencyImages[props.currency.apiName] || currencyImages.default)

// Mutations
const withdrawMutation = useMutation({
  mutationFn: (data) => withdrawBalance(data),
  onSuccess: () => {
    emit('success')
    closeModal()
  },
  onError: (error) => {
    error.value = 'Ошибка при выводе средств. Попробуйте еще раз.'
  },
})

const validateAddressMutation = useMutation({
  mutationFn: (data) => validatePaymentAddress(data),
  onError: () => {
    error.value = 'Ошибка при проверке адреса. Попробуйте снова.'
  },
})

const closeModal = () => {
  emit('update:isOpen', false)
  amount.value = ''
  address.value = ''
  amountError.value = ''
  addressError.value = ''
}

const handleWithdraw = async () => {
  amountError.value = ''
  addressError.value = ''
  isLoading.value = true

  if (!amount.value || parseFloat(amount.value) <= 0) {
    amountError.value = 'Введите корректную сумму.'
    isLoading.value = false
    return
  }
  if (!address.value) {
    addressError.value = 'Введите адрес кошелька.'
    isLoading.value = false
    return
  }

  try {
    console.log('address', address.value)
    const validationResponse = await validateAddressMutation.mutateAsync({
      crypto: props.currency.apiName,
      address: address.value,
    })

    if (!validationResponse?.result) {
      addressError.value = 'Адрес кошелька недействителен.'
      isLoading.value = false
      return
    }

    await withdrawMutation.mutateAsync({
      crypto: props.currency.apiName,
      amount: parseFloat(amount.value),
      address: address.value,
    })
  } catch (err) {
    console.error('Error:', err)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <BaseBottomSheet :is-open="isOpen" @update:is-open="closeModal">
    <div class="withdraw">
      <div class="withdraw__content">
        <div class="withdraw__currency-line">
          <CurrencyInfo :img-src="imageSrc" :title="currency.simpleName" :text="currency.type" />
          <div class="withdraw__balance">
            <h4>{{ balance }}</h4>
            <span>Баланс</span>
          </div>
        </div>
        <BaseInput
          v-model="amount"
          type="number"
          placeholder="0.00"
          :label="currency.simpleName"
          :has-error="!!amountError"
          :error-message="amountError"
        />

        <BaseTextarea
          v-model="address"
          placeholder="Код из 26-34 символов"
          label="Адрес кошелька"
          :has-error="!!addressError"
          :error-message="addressError"
        />

        <BaseButton
          :disabled="isLoading"
          size="small"
          class="withdraw__button"
          @click="handleWithdraw"
        >
          Вывести
        </BaseButton>
      </div>
    </div>
  </BaseBottomSheet>
</template>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.withdraw {
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

  &__textarea {
    :deep(.base-textarea) {
      padding: 0;
      margin-bottom: 0;
    }
  }

  &__error {
    color: $warning;
    font-size: 14px;
  }

  &__button {
    margin-top: 8px;
  }
}
</style>
