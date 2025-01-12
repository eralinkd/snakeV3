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
        <template #trigger="{ selected }">
          <button class="filter-button plateBg">
            <span>{{ selected.label }}</span>
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

const filters = [
  { value: 'NONE', label: 'Все' },
  { value: 'REPLENISHMENT', label: 'Пополнение' },
  { value: 'WITHDRAW', label: 'Вывод' },
  { value: 'SWAP', label: 'Обмен' },
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
  padding: 18px 24px;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 500;
  text-align: left;
  @media (max-width: $smallBreakpoint) {
    padding: 12px 16px;
    font-size: 14px;
  }
}
</style>
