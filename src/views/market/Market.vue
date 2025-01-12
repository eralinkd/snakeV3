<script setup>
import { computed } from 'vue'
import { useMarketStore } from '@/stores/marketStore'
import MarketWallet from './wallet/MarketWallet.vue'
import MarketSwap from './MarketSwap.vue'
import MarketHistory from './history/MarketHistory.vue'
import BaseTabs from '@/components/BaseTabs.vue'
import { MARKET_TABS } from '@/constants/marketTabs'

const components = {
  MarketWallet,
  MarketSwap,
  MarketHistory,
}

const store = useMarketStore()
const activeTab = computed({
  get: () => store.activeTab,
  set: (value) => store.setActiveTab(value),
})
</script>

<template>
  <div class="market">
    <BaseTabs
      v-model:activeTab="activeTab"
      :tabs="MARKET_TABS"
      :components="components"
      className="market__tabs"
    />
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.market {
  padding-top: 24px;
  @media (max-width: $smallBreakpoint) {
    padding-top: 16px;
  }
}
.market__tabs :deep(ul) {
  margin-bottom: 24px;
  @media (max-width: $smallBreakpoint) {
    margin-bottom: 20px;
  }
}

.market__tabs :deep(li) {
  flex: 0 1 33.333%;
}
</style>
