<script setup>
import { ref, onUnmounted } from 'vue'
import { useMutation } from '@tanstack/vue-query'
import { buyProduct } from '@/api/storeApi'
import BaseModal from '@/components/BaseModal.vue'
import BaseModalClose from '@/components/BaseModalClose.vue'
import usdt from '@/assets/currency-images/usdt.png'
import snake from '@/assets/currency-images/snake-coin.png'
import success from '@/assets/shop/purchase-success.svg'
import fail from '@/assets/shop/purchase-fail.svg'
import BaseButton from '@/components/BaseButton.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  product: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:isOpen', 'after-close'])

// Состояние для таймаута
const timeoutId = ref(null)

// Мутация для покупки продукта
const {
  mutate,
  isPending,
  isError,
  data: response,
  reset,
} = useMutation({
  mutationFn: (data) => buyProduct(data),
  onSuccess: (response) => {
    if (response.success) {
      emit('after-close')
    }
  },
  onError: (error) => {},
})

const handleClose = () => {
  emit('update:isOpen', false)

  if (timeoutId.value) {
    clearTimeout(timeoutId.value)
  }

  timeoutId.value = setTimeout(() => {
    reset()
    timeoutId.value = null
  }, 300)
}

const handleBuyProduct = (currency) => {
  if (!props.product?.id) return

  mutate({
    currency,
    productName: props.product.id,
  })
}

onUnmounted(() => {
  if (timeoutId.value) {
    clearTimeout(timeoutId.value)
  }
})
</script>

<template>
  <BaseModal :isOpen="isOpen" @update:isOpen="handleClose" className="store-modal">
    <div v-if="product" class="store-modal__content">
      <BaseModalClose @click="handleClose" className="store-modal__close" />

      <template v-if="!response && !isError">
        <h2 class="store-modal__title">
          <template v-if="!isPending">
            Купить <span>{{ product.name }}</span> ?
          </template>
          <template v-else> Обработка покупки... </template>
        </h2>
        <div class="store-modal__prices">
          <button
            v-for="[currency, price] in Object.entries(product.prices)"
            :key="currency"
            class="store-modal__price"
            @click="handleBuyProduct(currency)"
            :disabled="isPending"
          >
            <img :src="currency === 'USDT_TRC20' ? usdt : snake" :alt="currency" />
            <span>{{ price }}</span>
          </button>
        </div>
      </template>

      <!-- Состояние успеха -->
      <div
        v-else-if="response.success && !isError"
        class="store-modal__frame store-modal__frame--success"
      >
        <div class="store-modal__image">
          <img :src="success" alt="Успех" />
        </div>
        <h2 class="store-modal__title">Успех!</h2>
        <p class="store-modal__description">Товар успешно приобретён!</p>
        <BaseButton @click="handleClose" type="button" size="small">Окей, спасибо</BaseButton>
      </div>

      <div
        v-else-if="!response.success && !isError"
        class="store-modal__frame store-modal__frame--fail"
      >
        <div class="store-modal__image">
          <img :src="fail" alt="ошибка" />
        </div>
        <h2 class="store-modal__title">Недостаточно средств</h2>
        <p class="store-modal__description">
          Чтобы приобрести даный товар, вам требуется больше средств.
        </p>
        <BaseButton @click="handleClose" type="button" size="small">Окей, спасибо</BaseButton>
      </div>

      <div v-else-if="isError" class="store-modal__frame store-modal__frame--error">
        <div class="store-modal__image">
          <img :src="fail" alt="ошибка" />
        </div>
        <h2 class="store-modal__title">Упс, что-то пошло не так...</h2>
        <p class="store-modal__description">Попробуйте повторить покупку позже.</p>
        <BaseButton @click="handleClose" type="button" size="small">Окей, спасибо</BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

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
    @media (max-width: $smallBreakpoint) {
      gap: 20px;
    }
  }

  &__title {
    padding-top: 10px;
    text-align: center;
    font-size: 20px;
    font-weight: 700;
    line-height: 150%;

    & > span {
      color: $accent;
    }
  }

  &__prices {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  &__price {
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 16px;
    font-weight: 700;
    line-height: 150%;
    padding: 12px 20px;
    border-radius: 10px;
    background: rgba(42, 38, 60, 0.75);
    img {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      overflow: hidden;
    }
  }

  &__price {
    border: none;
    cursor: pointer;
    transition:
      transform 0.2s ease,
      opacity 0.2s ease;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &__frame {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  &__image {
    width: 100px;
    aspect-ratio: 1/1;
  }

  &__description {
    text-align: center;
    font-size: 16px;
    line-height: 150%;
    opacity: 0.5;
  }
}
</style>
