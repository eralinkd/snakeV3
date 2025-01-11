<template>
  <div class="">
    <BaseSelect v-model="selectedFilter" :options="filters">
      <template #trigger="{ selected }">
        <button class="filter-button plateBg">
          <span>{{ selected.label }}</span>
          <svg class="arrow" width="12" height="12" viewBox="0 0 12 12">
            <!-- ... ваш SVG код ... -->
          </svg>
        </button>
      </template>
    </BaseSelect>
  </div>
</template>

<script setup>
import BaseSelect from '@/components/BaseSelect.vue'

const selectedFilter = ref('all')
const filters = [
  { value: 'all', label: 'Все' },
  { value: 'deposit', label: 'Пополнение' },
  { value: 'withdraw', label: 'Вывод' },
  { value: 'swap', label: 'Обмен' },
]
</script>
