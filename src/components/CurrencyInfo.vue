<template>
  <div :class="['currency-info', className]">
    <div class="currency-info__img-container">
      <img :src="imgSrc" :alt="title" />
    </div>
    <div class="currency-info__info">
      <p class="currency-info__name">{{ title }}</p>
      <slot name="text">
        <span v-if="text" class="currency-info__type">{{ text }}</span>
      </slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  imgSrc: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    default: '',
  },
  className: {
    type: String,
    default: '',
  },
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.currency-info {
  display: flex;
  align-items: center;
  gap: 16px;
  &__img-container {
    width: 46px;
    aspect-ratio: 1 / 1;
    border-radius: 50%;
    overflow: hidden;
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    @media (max-width: $smallBreakpoint) {
      width: 36px;
    }
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__name {
    font-size: 16px;
    font-weight: 700;
    line-height: 1.5;
  }

  &__type {
    font-size: 10px;
    line-height: 1.5;
    opacity: 0.8;
  }
}
</style>
