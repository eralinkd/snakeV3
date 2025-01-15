<script setup>
import noImage from '@/assets/shop/no-image.svg'
import usdt from '@/assets/currency-images/usdt.png'
import snake from '@/assets/currency-images/snake-coin.png'

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['openModal'])
</script>

<template>
  <article :class="{ 'store-card plateBg': true, 'store-card--unavailable': !product.available }">
    <div class="store-card__image">
      <span v-if="!product.available" class="store-card__unavailable">Распродано</span>
      <img :src="product?.imgSrc || noImage" :alt="product.name" />
    </div>

    <div class="store-card__content">
      <h3 class="store-card__title">{{ product.name }}</h3>

      <div class="store-card__prices">
        <div
          v-for="[currency, price] in Object.entries(product.prices)"
          :key="currency"
          class="store-card__price"
        >
          <img :src="currency === 'USDT_TRC20' ? usdt : snake" :alt="currency" />
          <span class="store-card__value">{{ price }}</span>
        </div>
      </div>
    </div>
  </article>
</template>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.store-card {
  border-radius: 16px;
  &__image {
    padding-bottom: 80%;
    position: relative;
    border-radius: 15px;
    background: #1c182d;
    & > img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  &__unavailable {
    position: absolute;
  }

  &__content {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    @media (max-width: $smallBreakpoint) {
      gap: 20px;
      padding: 20px;
    }
  }

  &__title {
    font-size: 16px;
    font-weight: 700;
    line-height: 150%;
    @media (max-width: $smallBreakpoint) {
      font-size: 20px;
    }
  }

  &__prices {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 5px;
  }

  &__price {
    display: flex;
    align-items: center;
    gap: 10px;
    & > img {
      width: 24px;
      aspect-ratio: 1/1;
      border-radius: 50%;
      overflow: hidden;
      @media (max-width: $smallBreakpoint) {
        width: 28px;
      }
    }
  }

  &__value {
    font-size: 16px;
    font-weight: 700;
    line-height: 150%;
  }
}
</style>
