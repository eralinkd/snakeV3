<script setup>
import { ref, watch } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { getUser } from '@/api/userApi'
import { fetchCryptos } from '@/api/marketApi'
import CurrencyCard from '@/views/market/CurrencyCard.vue'
import Spinner from '@/components/Spinner.vue'

const balances = ref(null)

const {
  data: cryptos,
  isLoading,
  isError,
} = useQuery({
  queryKey: ['cryptos'],
  queryFn: fetchCryptos,
})

const { data: balancesResponse, isError: isBalancesError } = useQuery({
  queryKey: ['balances'],
  queryFn: getUser,
})

watch(balancesResponse, (newValue) => {
  if (!isBalancesError.value) {
    balances.value = newValue?.balances
  }
})
</script>

<template>
  <div class="wallet">
    <div class="container">
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
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.wallet {
  .container {
    position: relative;
  }

  .spinner-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
  }

  .list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    padding: 20px;
  }

  .error {
    color: red;
    text-align: center;
    padding: 20px;
  }
}
</style>
