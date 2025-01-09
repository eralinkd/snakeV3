<script setup>
import { ref, watch, computed } from 'vue'
import { useMarketStore } from '@/stores/marketStore'
import { MARKET_TAB_NAMES } from '@/constants/marketTabs'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  amount: {
    type: Number,
    default: 0,
  },
})

const showButtons = ref(false)
const marketStore = useMarketStore()

// const currencyImage = computed(() => currencyImages[props.item.apiName] || currencyImages.default)

const toggleButtons = () => {
  showButtons.value = !showButtons.value
}

watch(showButtons, (newValue) => {
  if (newValue) {
    const timer = setTimeout(() => {
      showButtons.value = false
    }, 3000)

    return () => clearTimeout(timer)
  }
})

const setActiveTab = (tabName) => {
  marketStore.setActiveTab(MARKET_TAB_NAMES.SWAP)
}
</script>

<template>
  <article class="currency-card">
    <div class="content">
      <div class="currency-info">
        <!-- <img :src="currencyImage" :alt="item.simpleName" class="currency-icon" /> -->
        <div class="info-text">
          <h3>{{ item.simpleName }}</h3>
          <p>{{ item.type }}</p>
        </div>
      </div>

      <div class="actions" :class="{ hide: showButtons }">
        <span class="value">
          <template v-if="amount">
            {{ parseFloat(amount).toFixed(2) }}
          </template>
          <template v-else>
            <span class="integer">0.</span>
            <span class="decimal">00</span>
          </template>
        </span>
        <button @click="toggleButtons" class="more-actions">|</button>
      </div>

      <div class="buttons" :class="{ show: showButtons }">
        <button v-if="item.swap" @click="setActiveTab()" class="action-button">Обмен</button>
        <button v-if="item.withdraw" class="action-button">Вывести</button>
        <button v-if="item.replenishment" class="action-button" disabled>Пополнить</button>
      </div>
    </div>
  </article>
</template>

<style lang="scss" scoped>
.currency-card {
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  .content {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .currency-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .currency-icon {
      width: 40px;
      height: 40px;
    }

    .info-text {
      h3 {
        margin: 0;
        font-size: 18px;
      }

      p {
        margin: 5px 0 0;
        color: #666;
      }
    }
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 12px;
    transition: opacity 0.3s;

    &.hide {
      opacity: 0;
      pointer-events: none;
    }
  }

  .value {
    font-size: 18px;
    font-weight: 500;

    .integer {
      font-size: 30px;
    }

    .decimal {
      font-size: 23px;
    }
  }

  .more-actions {
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;

    img {
      width: 24px;
      height: 24px;
    }
  }

  .buttons {
    position: absolute;
    right: 0;
    display: flex;
    gap: 8px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s;

    &.show {
      opacity: 1;
      pointer-events: auto;
    }
  }

  .action-button {
    padding: 8px 16px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: #fff;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.2s;

    &:hover {
      background-color: #f5f5f5;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}
</style>
