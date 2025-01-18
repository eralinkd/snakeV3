<template>
  <div class="eggs-tab">
    <div class="eggs-tab__pagination"></div>
    <div class="eggs-tab__slider">
      <Swiper
        :modules="[Pagination]"
        :space-between="20"
        :slides-per-view="1"
        :pagination="{ clickable: true, el: '.eggs-tab__pagination' }"
        class="eggs-swiper"
      >
        <SwiperSlide
          v-for="egg in Object.values(eggs || {})"
          :key="egg.name"
          class="eggs-swiper__slide"
        >
          <EggCard :egg="egg" @break="handleBreakEgg" @take="handleTakeReward" />
        </SwiperSlide>
      </Swiper>
    </div>
  </div>
</template>

<script setup>
import { useMutation } from '@tanstack/vue-query'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Pagination } from 'swiper/modules'
import { postBreakEgg, postTakeEgg } from '@/api/userApi'
import EggCard from './EggCard.vue'
import 'swiper/css'
import 'swiper/css/pagination'

const props = defineProps({
  eggs: {
    type: Object,
    default: () => {},
  },
})

const { mutate: breakEgg } = useMutation({
  mutationFn: (data) => postBreakEgg(data),
  onSuccess: (response) => {},
  onError: () => {},
})

const { mutate: takeEgg } = useMutation({
  mutationFn: (data) => postTakeEgg(data),
  onSuccess: (response) => {},
  onError: () => {},
})

const handleBreakEgg = (egg) => {
  breakEgg(egg.level)
}

const handleTakeReward = (egg) => {
  takeEgg(egg.level)
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.eggs-tab {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  &__empty {
    text-align: center;
    padding: 40px;
    color: rgba($mainColor, 0.6);
  }

  &__slider {
    flex: 1 1 auto;
  }

  &__pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 24px;
    position: relative;
    z-index: 5;
    :deep(.swiper-pagination-bullet) {
      transition: all 0.3s ease 0s;
      width: 9px;
      height: 9px;
      background-color: $accent;
      border-radius: 4.5px;
    }
    :deep(.swiper-pagination-bullet-active) {
      width: 62px;
    }
  }
}

.eggs-swiper {
  overflow: visible;
  :deep(.swiper-wrapper) {
    overflow: visible;
  }

  &__slide {
  }
}
</style>
