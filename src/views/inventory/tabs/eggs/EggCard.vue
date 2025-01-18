<template>
  <div class="egg-card">
    <h2 class="egg-card__title">{{ egg.name }}</h2>
    <div class="egg-card__bottom-plate-container">
      <img class="egg-card__image" :src="defaultEgg" alt="egg" />
      <div class="egg-card__bottom-plate"></div>
    </div>
  </div>
</template>

<script setup>
import defaultEgg from '@/assets/inventory/egg.png'

const props = defineProps({
  egg: {
    type: Object,
    required: true,
  },
})

defineEmits(['break', 'take'])
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.egg-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1 1 auto;
  height: calc(100vh - 120px - 134px);
  &__title {
    text-align: center;
    font-size: 24px;
    font-weight: 700;
    line-height: 150%;
  }

  &__image {
    position: absolute;
    z-index: 2;
    bottom: 30px;
    left: 50%;
    transform: translate(-50%, 0);
    width: 200%;
    height: 200%;
    object-fit: contain;
    max-width: 462px;
    max-height: 740px;
    @media (max-width: $smallBreakpoint) {
      bottom: -20px;
    }
  }

  &__bottom-plate-container {
    position: relative;
    height: 100%;
  }

  &__bottom-plate {
    border-radius: 25px;
    background: #5f5f5f;
    height: 141px;
    width: calc(100% - 2px);
    position: absolute;
    bottom: 0;
    left: 0;
    transform: translate(0, 50%);
    @media (max-width: $smallBreakpoint) {
      height: 80px;
      transform: translate(0, 100%);
    }
  }
}
</style>
