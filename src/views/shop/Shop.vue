<script setup>
import { computed, ref } from 'vue'
import { fetchProducts } from '@/api/storeApi'
import { useQuery } from '@tanstack/vue-query'
import BaseTabs from '@/components/BaseTabs.vue'
import StoreCard from './ShopCard.vue'
import StoreModal from './StoreModal.vue'
import Spinner from '@/components/Spinner.vue'

const FILTER_TABS = [
  { value: 'NONE', name: 'Все' },
  { value: 'ARMOR', name: 'Броня и Оружие' },
  { value: 'CONSUMABLES', name: 'Расходники' },
  { value: 'EGG', name: 'Яйца' },
]

const selectedTab = ref(FILTER_TABS[0].value)
const activeTab = computed({
  get: () => FILTER_TABS.find((tab) => tab.value === selectedTab.value)?.name,
  set: (newName) => {
    const tab = FILTER_TABS.find((tab) => tab.name === newName)
    if (tab) selectedTab.value = tab.value
  },
})

const {
  data: products,
  isLoading,
  isError,
} = useQuery({
  queryKey: ['products', selectedTab],
  queryFn: () => fetchProducts(selectedTab.value),
  staleTime: 30 * 60 * 1000, // Consider data fresh for 30 minutes
  cacheTime: 35 * 60 * 1000, // Keep in cache for 35 minutes
})
</script>

<template>
  <section class="shop">
    <div v-if="isError" class="shop__container">
      <p class="error">Failed to fetch data</p>
    </div>

    <template v-if="!isError">
      <BaseTabs v-model:activeTab="activeTab" :tabs="FILTER_TABS" className="shop__tabs" />
      <div v-if="isLoading" class="shop__spinner">
        <Spinner />
      </div>
      <ul v-else-if="products" class="shop__list">
        <StoreCard v-for="product in products" :key="product.title" :product="product" />
      </ul>
    </template>

    <StoreModal />
  </section>
</template>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.shop {
  position: relative;
  padding-top: 24px;

  &__spinner {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
  }

  &__container {
    position: relative;
  }

  &__tabs {
    margin-bottom: 24px;
    &:deep(ul) {
      background: none;
      border: none;
      gap: 12px;
      overflow-x: auto;
      padding-bottom: 15px;
    }
    &:deep(.nav-tabs__item) {
      padding: 18px 36px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      white-space: nowrap;
      background: linear-gradient(90deg, #191626 0.04%, #1b1829 99.96%);
    }
    &:deep(.nav-tabs__item--active) {
      background: $gradientAccent;
    }
  }

  &__list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;

    @media (max-width: $smallBreakpoint) {
      grid-template-columns: repeat(1, 1fr);
    }
  }
}

.error {
  color: $warning;
  text-align: center;
  padding: 20px;
}
</style>
