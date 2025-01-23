<script setup>
import noImage from '@/assets/shop/no-image.svg'
import usdt from '@/assets/currency-images/usdt.png'
import snake from '@/assets/currency-images/snake-coin.png'
import defaultHelmet from '@/assets/inventory/helmet.svg'
import defaultArmor from '@/assets/inventory/armor.svg'
import defaultSword from '@/assets/inventory/sword.svg'
import defaultShield from '@/assets/inventory/shield.svg'
import defaultEgg from '@/assets/shop/default-egg.svg'
import defaultHealth from '@/assets/shop/default-health.svg'
import defaultEnergy from '@/assets/shop/default-energy.svg'
import defaultIncomeBoost from '@/assets/shop/default-income-boost.svg'
import defaultEnergyBoost from '@/assets/shop/default-energy-boost.svg'
import { computed } from 'vue'

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['click'])

const getProductImage = computed(() => {
  if (props.product?.imgSrc) {
    return props.product.imgSrc
  }

  const imageMap = {
    armor_helmet: defaultHelmet,
    armor_chestplate: defaultArmor,
    armor_shield: defaultShield,
    armor_sword: defaultSword,
    passive_egg_1: defaultEgg,
    passive_egg_2: defaultEgg,
    passive_egg_3: defaultEgg,
    income_boost: defaultIncomeBoost,
    energy_boost: defaultEnergyBoost,
    health: defaultHealth,
    energy: defaultEnergy,
  }

  return imageMap[props.product.id] || noImage
})

const handleClick = () => {
  if (props.product.available) {
    emit('click', props.product)
  }
}
</script>

<template>
  <article
    :class="{ 'store-card plateBg': true, 'store-card--unavailable': !product.available }"
    @click="handleClick"
  >
    <div class="store-card__image">
      <span v-if="!product.available" class="store-card__unavailable">{{
        product.productType === 'EGG' ? 'Недоступно' : 'Распродано'
      }}</span>
      <img :src="getProductImage" :alt="product.name" />
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
  cursor: pointer;
  transition: transform 0.2s ease;
  &--unavailable {
    pointer-events: none;
    opacity: 0.8;
  }
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
      padding: 10px;
    }
  }

  &__unavailable {
    position: absolute;
    bottom: 10px;
    left: 15px;
    z-index: 2;
    background: $warning;
    padding: 6px 12px;
    border-radius: 18px;
    font-size: 12px;
    font-weight: 700;
    line-height: 150%;
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
