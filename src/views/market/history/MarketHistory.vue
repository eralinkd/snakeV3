<template>
  <div class="history">
    <div v-if="isLoading && !isError" class="history__spinner">
      <Spinner />
    </div>

    <div v-if="isError" class="history__container">
      <p class="error">Failed to fetch data</p>
    </div>

    <template v-if="history">
      <BaseSelect v-model="selectedFilter" :options="filters" class="history__filter">
        <template #trigger="{ selected, isOpen }">
          <button class="filter-button plateBg">
            <div class="filter-button__img-container">
              <img :src="selected.icon" alt="filter icon" />
            </div>
            <span>{{ selected.label }}</span>
            <div
              :class="[
                'filter-button__icon-container',
                { 'filter-button__icon-container--rotate': isOpen },
              ]"
            >
              <svg
                width="10"
                height="7"
                viewBox="0 0 10 7"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M5.58925 6.25594C5.26383 6.58135 4.73617 6.58135 4.41075 6.25594L0.244075 2.08928C-0.0813583 1.76384 -0.0813583 1.2362 0.244075 0.910762C0.569517 0.585329 1.09715 0.585329 1.42259 0.910762L5 4.48819L8.57742 0.910762C8.90283 0.585329 9.4305 0.585329 9.75592 0.910762C10.0813 1.2362 10.0813 1.76384 9.75592 2.08928L5.58925 6.25594Z"
                  fill="white"
                />
              </svg>
            </div>
          </button>
        </template>
      </BaseSelect>

      <ul v-if="history.length > 0" class="history__list">
        <HistoryCard v-for="(item, index) in history" :key="index" :item="item" />
      </ul>

      <div v-else class="history__empty">
        <p>Истории пока нет...</p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import BaseSelect from '@/components/BaseSelect.vue'
import Spinner from '@/components/Spinner.vue'
import HistoryCard from './HistoryCard.vue'
import { getHistory } from '@/api/marketApi'
import filterAll from '@/assets/history/filter-all.svg'
import filterDeposit from '@/assets/history/filter-deposit.svg'
import filterWithdraw from '@/assets/history/filter-withdraw.svg'
import filterSwap from '@/assets/history/filter-swap.svg'

const filters = [
  { value: 'NONE', label: 'Все', icon: filterAll },
  { value: 'REPLENISHMENT', label: 'Пополнение', icon: filterDeposit },
  { value: 'WITHDRAW', label: 'Вывод', icon: filterWithdraw },
  { value: 'SWAP', label: 'Обмен', icon: filterSwap },
]

const selectedFilter = ref('NONE')

const {
  data: history,
  isLoading,
  isError,
} = useQuery({
  queryKey: ['history', selectedFilter],
  queryFn: () => getHistory(selectedFilter.value),
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.history {
  &__container {
    position: relative;
  }

  &__spinner {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
  }

  &__filter {
    width: 100%;
    margin-bottom: 24px;
    @media (max-width: $smallBreakpoint) {
      margin-bottom: 20px;
    }
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__empty {
    text-align: center;
    padding: 40px 0;
    font-size: 16px;
    opacity: 0.6;
  }
}

.error {
  color: $warning;
  text-align: center;
  padding: 20px;
}

.filter-button {
  width: 100%;
  padding: 18px 20px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  & > span {
    text-align-last: left;
    flex: 1 1 auto;
    font-size: 16px;
    font-weight: 500;
  }
  &__img-container {
    flex: 0 0 20px;
    width: 20px;
    height: 20px;
    padding: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    & > img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
  &__icon-container {
    flex: 0 0 20px;
    width: 20px;
    height: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease 0s;
    &--rotate {
      transform: rotate(-180deg);
    }
  }
  @media (max-width: $smallBreakpoint) {
    padding: 10px 20px;
    & > span {
      font-size: 14px;
    }
  }
}
</style>
