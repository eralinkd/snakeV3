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
          <div class="egg-card">
            <h2 class="egg-card__title">{{ t(`${egg.name}`) }}</h2>
            <div
              class="egg-card__bottom-plate-container"
              :class="{
                'egg-card__bottom-plate-container--disabled': !egg.available,
              }"
              @click="handleClick(egg)"
            >
              <img class="egg-card__image" :src="defaultEgg" alt="egg" />
              <div
                class="egg-card__bottom-plate"
                :class="{ 'egg-card__bottom-plate--faded': egg.status === 'NONE' }"
              ></div>
              <div v-if="egg.status === 'PROCESSING'" class="egg-card__timer-plate timer-plate">
                <div class="timer-plate__content">
                  <Timer
                    :seconds="egg.endsAt"
                    :id="egg.name"
                    :isProcessing="egg.status === 'PROCESSING'"
                    @timer-end="handleTimerEnd"
                  />
                  <p>{{ t('inventory.egg_processing') }}</p>
                </div>
              </div>
              <div
                v-if="egg.status === 'FINISHED' || isTimerEnd"
                class="egg-card__reward-plate reward-plate"
              >
                <div class="reward-plate__content">
                  <h3>{{ t('inventory.egg_broken') }}</h3>
                  <p>{{ t('inventory.egg_broken_description') }}</p>
                  <BaseButton size="small" @click="handleTakeReward(egg)">{{
                    t('inventory.egg_broken_button')
                  }}</BaseButton>
                </div>
              </div>
              <div v-if="!egg.available" class="egg-card__unavailable-plate unavailable-plate">
                <div class="unavailable-plate__content">
                  <p>{{ t('inventory.egg_unavailable') }}</p>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  </div>
</template>

<script setup>
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Pagination } from 'swiper/modules'
import { postBreakEgg, postTakeEgg } from '@/api/userApi'
import { ref, watch } from 'vue'
import defaultEgg from '@/assets/inventory/egg.png'
import 'swiper/css'
import 'swiper/css/pagination'
import Timer from './Timer.vue'
import BaseButton from '@/components/BaseButton.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  eggs: {
    type: Object,
    default: () => {},
  },
})

const isTimerEnd = ref(false)
const queryClient = useQueryClient()

const { mutate: breakEgg } = useMutation({
  mutationFn: (data) => postBreakEgg(data),
  onSuccess: (response) => {
    if (response.result) {
      queryClient.invalidateQueries({ queryKey: ['inventory-user'] })
    }
  },
  onError: () => {},
})

const { mutate: takeEgg } = useMutation({
  mutationFn: (data) => postTakeEgg(data),
  onSuccess: (response) => {
    if (response.result) {
      queryClient.invalidateQueries({ queryKey: ['inventory-user'] })
    }
  },
  onError: () => {},
})

const handleClick = (egg) => {
  if (egg.status === 'NONE') {
    breakEgg(egg.level)
  }
}

const handleTakeReward = (egg) => {
  takeEgg(egg.level)
  isTimerEnd.value = false
}

const handleTimerEnd = () => {
  queryClient.invalidateQueries({ queryKey: ['inventory-user'] })
  isTimerEnd.value = true
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
}

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
    &--disabled {
      pointer-events: none;
      opacity: 0.6;
    }
  }

  &__timer-plate {
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

.timer-plate {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  &__content {
    width: 100%;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 12px 20px;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(27, 24, 41, 0.75);
    box-shadow: 0px 7px 30px 0px rgba(0, 0, 0, 0.27);
  }
}

.unavailable-plate {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  &__content {
    color: $warning;
    font-size: 16px;
    font-weight: 600;
    line-height: 150%;
    width: 100%;
    padding: 20px;
    text-align: center;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: linear-gradient(90deg, rgba(27, 24, 41, 0.75) 0%, rgba(61, 29, 51, 0.75) 100%);
    box-shadow: 0px 7px 30px 0px rgba(0, 0, 0, 0.27);
  }
}

.reward-plate {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  &__content {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    padding: 20px;
    text-align: center;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: linear-gradient(90deg, rgba(27, 24, 41, 0.75) 0%, rgba(24, 45, 48, 0.75) 100%);
    box-shadow: 0px 7px 30px 0px rgba(0, 0, 0, 0.27);
    & > h3 {
      color: $success;
      font-size: 18px;
      font-weight: 600;
      line-height: 120%;
    }
    & > p {
      color: $success;
      font-size: 14px;
      line-height: 120%;
    }
  }
}
</style>
