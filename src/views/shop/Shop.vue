<script setup>
import { computed, ref } from 'vue'
import { fetchProducts } from '@/api/storeApi'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import BaseTabs from '@/components/BaseTabs.vue'
import ShopCard from './ShopCard.vue'
import Spinner from '@/components/Spinner.vue'
import ShopModal from './ShopModal.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const FILTER_TABS = [
  { value: 'NONE', name: 'shop.tabs_all' },
  { value: 'ARMOR', name: 'shop.tabs_armor_and_weapons' },
  { value: 'CONSUMABLES', name: 'shop.tabs_consumables' },
  { value: 'EGG', name: 'shop.tabs_eggs' },
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
  staleTime: 30 * 60 * 1000,
  cacheTime: 35 * 60 * 1000,
})

const selectedProduct = ref(null)
const isModalOpen = ref(false)

const queryClient = useQueryClient()

const handleOpenModal = (product) => {
  selectedProduct.value = product
  isModalOpen.value = true
}

const handleModalClose = () => {
  queryClient.invalidateQueries({ queryKey: ['products', selectedTab.value] })
}
</script>

<template>
  <section class="shop">
    <div v-if="isError" class="shop__container">
      <p class="error">{{ t('shop.error') }}</p>
    </div>

    <template v-if="!isError">
      <BaseTabs v-model:activeTab="activeTab" :tabs="FILTER_TABS" className="shop__tabs" />
      <div v-if="isLoading" class="shop__spinner">
        <Spinner />
      </div>
      <ul v-else-if="products" class="shop__list">
        <ShopCard
          v-for="product in products"
          :key="product.title"
          :product="product"
          @click="handleOpenModal(product)"
        />
      </ul>
    </template>

    <ShopModal
      v-model:isOpen="isModalOpen"
      :product="selectedProduct"
      @after-close="handleModalClose"
    />
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
