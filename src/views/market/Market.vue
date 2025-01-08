<script setup>
import { computed } from 'vue'
import { useMarketStore } from '@/stores/marketStore'
import MarketWallet from './MarketWallet.vue'
import MarketSwap from './MarketSwap.vue'
import MarketHistory from './MarketHistory.vue'

const tabs = [
  { name: 'Кошелёк', component: MarketWallet },
  { name: 'Обмен', component: MarketSwap },
  { name: 'История', component: MarketHistory },
]

const store = useMarketStore()
const activeTab = computed(() => store.activeTab)
const setActiveTab = store.setActiveTab

const currentComponent = computed(() => {
  const tab = tabs.find((t) => t.name === activeTab.value)
  return tab ? tab.component : null
})
</script>

<template>
  <div class="market">
    <ul class="market__nav nav-market">
      <li
        v-for="tab in tabs"
        :key="tab.name"
        :class="{
          'nav-market__item': true,
          'nav-market__item--active accentGrad': activeTab === tab.name,
        }"
        @click="setActiveTab(tab.name)"
      >
        {{ tab.name }}
      </li>
    </ul>

    <Transition name="fade" mode="out-in">
      <section :key="activeTab" class="market__section">
        <component :is="currentComponent" />
      </section>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.market {
  padding-top: 24px;
  @media (max-width: $smallBreakpoint) {
    padding-top: 16px;
  }
  &__nav {
    margin-bottom: 24px;
    @media (max-width: $smallBreakpoint) {
      margin-bottom: 20px;
    }
  }

  &__section {
  }
}

.nav-market {
  display: flex;
  align-items: center;
  border-radius: 16px;
  background: $plateBg;
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(15px);
  &__item {
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    opacity: 0.4;
    flex: 0 1 33.333%;
    border-radius: 16px;
    text-align: center;
    font-size: 16px;
    padding: 18px 0;
    line-height: 150%;
    font-weight: 500;
    cursor: pointer;
    &--active {
      opacity: 1;
      font-weight: 700;
    }
    @media (any-hover: hover) {
      &:hover:not(.accentGrad) {
        background: rgba(174, 139, 255, 0.1);
      }
    }
    @media (max-width: $smallBreakpoint) {
      font-size: 14px;
      padding: 12px 0;
    }
  }
}

// Transition animations
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
