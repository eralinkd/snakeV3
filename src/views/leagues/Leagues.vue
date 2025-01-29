<template>
  <div class="leagues">
    <div class="leagues__bg">
      <img :src="bg" alt="bg" />
    </div>

    <div v-if="isLoading" class="spinner-container">
      <Spinner />
    </div>

    <div v-else-if="isError" class="error">Failed to load leagues data</div>

    <div v-else class="leagues__slider leagues-slider">
      <Swiper
        :slides-per-view="1"
        :space-between="20"
        class="leagues-slider__swiper leagues-swiper"
      >
        <SwiperSlide
          v-for="(league, index) in leagues"
          :key="index"
          class="leagues-slider__swiper-slide"
        >
          <div class="leagues-slider__image-container">
            <img
              class="leagues-slider__snake"
              :src="league.opened ? snake : undefinedSnake"
              alt="snake"
            />
            <span class="leagues-slider__snake-shadows"></span>
          </div>
          <div class="leagues-slider__progress-bar progress-bar-leagues">
            <h2 class="progress-bar-leagues__title">{{ t(`${league.name}`) }}</h2>
            <div class="progress-bar-leagues__container">
              <div class="progress-bar-leagues__fill">
                <div
                  class="progress-bar-leagues__fill--progress"
                  :style="{ width: `progressPercent%` }"
                ></div>
              </div>
              <div class="progress-bar-leagues__text-container">
                <span class="progress-bar-leagues__text">{{ league.progress }}</span>
                <span class="progress-bar-leagues__text">{{ league.needProgress }}</span>
              </div>
            </div>
          </div>
          <div class="leagues-slider__rewards">
            <div
              v-for="([type, name], index) in Object.entries(league.rewards)"
              :key="index"
              class="leagues-slider__reward plateBg"
            >
              <h4 class="leagues-slider__reward-name">{{ t(name) }}</h4>
              <img :src="getRewardIcon(type)" alt="reward" />
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  </div>
</template>

<script setup>
import { useQuery } from '@tanstack/vue-query'
import { getUserLeagues } from '@/api/userApi'
import { Swiper, SwiperSlide } from 'swiper/vue'
import Spinner from '@/components/Spinner.vue'
import snake from '@/assets/leagues/snake.svg'
import undefinedSnake from '@/assets/leagues/undefinedSnake.svg'
import bg from '@/assets/leagues/bg.svg'
import defaultEgg from '@/assets/shop/default-egg.svg'
import defaultTradeAccess from '@/assets/shop/default-swap.svg'
import noImage from '@/assets/shop/no-image.svg'
import 'swiper/css'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const {
  data: leagues,
  isLoading,
  isError,
} = useQuery({
  queryKey: ['leagues'],
  queryFn: getUserLeagues,
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 30 * 60 * 1000, // 30 minutes
})

const getRewardIcon = (type) => {
  const imageMap = {
    egg: defaultEgg,
    trade_access: defaultTradeAccess,
    no_image: noImage,
  }

  return imageMap[type] || noImage
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
.leagues {
  overflow: hidden;
  &__bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transform: translateY(-25%);
    overflow: hidden;
  }
  &__slider {
    position: relative;
    z-index: 2;
    margin-top: 20px;
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
}
.leagues-slider {
  &__image-container {
    margin-bottom: 26px;
    position: relative;
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 70%;
      height: 70%;
      border-radius: 50%;
      background: radial-gradient(
        232.72% 107.18% at 50.17% 62.16%,
        #ae8bff 0%,
        rgba(58, 31, 121, 0) 100%
      );
      opacity: 0.41;
      background-blend-mode: screen;
      filter: blur(50px);
    }
    &::after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: calc(50% - 15px);
      transform: translateX(-50%);
      width: 150px;
      height: 19px;
      background: #12101b;
      opacity: 0.8;
      filter: blur(10px);
    }
  }

  &__snake {
    width: 100%;
    height: 100%;
    object-fit: contain;
    max-height: 260px;
    position: relative;
    z-index: 3;
  }

  &__snake-shadows {
    position: absolute;
    bottom: -10px;
    left: 50%;
    width: 100%;
    height: 25px;
    transform: translateX(-50%);
    opacity: 0.65;
    background: radial-gradient(
      120.35% 55.43% at 50.17% 62.16%,
      #ae8bff 0%,
      rgba(58, 31, 121, 0.7) 100%
    );
    filter: blur(20px);
  }

  &__progress-bar {
    margin-bottom: 24px;
  }

  &__rewards {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__reward {
    display: flex;
    padding: 12px 20px;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    border-radius: 16px;
    & > img {
      width: 65px;
      height: 50px;
      object-fit: contain;
    }
  }

  &__reward-name {
    font-size: 16px;
    font-weight: 700;
    line-height: 150%;
  }
}
.leagues-swiper {
  overflow: visible;
}

.progress-bar-leagues {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 12px;
  &__title {
    font-size: 24px;
    font-weight: 700;
    line-height: 150%;
  }

  &__container {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__fill {
    height: 8px;
    border-radius: 8px;
    background: rgba(27, 24, 41, 0.75);
    box-shadow: 0px 7px 30px 0px rgba(0, 0, 0, 0.27);
    overflow: hidden;
    position: relative;
    &--progress {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      background: #ae8bff;
      border-radius: 8px;
    }
  }

  &__text-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-wrap: wrap;
  }

  &__text {
    font-size: 16px;
    font-weight: 700;
    line-height: 150%;
  }
}
</style>
