<script setup>
import { ref, watch } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { getUser } from '@/api/userApi'
import { fetchCryptos } from '@/api/marketApi'
import CurrencyCard from '@/views/market/wallet/CurrencyCard.vue'
import Spinner from '@/components/Spinner.vue'

const balances = ref(null)

const {
  data: cryptos,
  isLoading,
  isError,
} = useQuery({
  queryKey: ['cryptos'],
  queryFn: fetchCryptos,
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 30 * 60 * 1000, // 30 minutes
})

const {
  data: balancesResponse,
  isError: isBalancesError,
  refetch: refetchBalances,
} = useQuery({
  queryKey: ['balances'],
  queryFn: getUser,
})

watch(
  balancesResponse,
  (newValue) => {
    if (!isBalancesError.value) {
      balances.value = newValue?.balances
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="wallet">
    <div v-if="isLoading && !isError" class="spinner-container">
      <Spinner />
    </div>

    <div v-if="isError" class="container">
      <p class="error">Failed to fetch data</p>
    </div>

    <div v-if="cryptos && !isError" class="list">
      <CurrencyCard
        v-for="currency in cryptos"
        :key="currency.fullName"
        :item="currency"
        :amount="balances?.[currency.apiName]"
        :on-success-withdraw="refetchBalances"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;
.wallet {
  position: relative;

  .spinner-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
  }

  .list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 12px;
    @media (max-width: $smallBreakpoint) {
      grid-template-columns: repeat(auto-fill, minmax(288px, 1fr));
    }
  }

  .error {
    color: $warning;
    text-align: center;
    padding: 20px;
  }
}
</style>
