<template>
  <div v-if="isLoading && !isError" class="inventory__spinner">
    <Spinner />
  </div>

  <div v-else-if="isError" class="inventory__error">
    <p class="error">Не удалось загрузить данные</p>
  </div>

  <div v-else-if="userData?.inventory" class="inventory">
    <BaseTabs v-model:activeTab="activeTab" :tabs="INVENTORY_TABS" className="inventory__tabs" />

    <template v-if="activeTab === 'Снаряжение'">
      <EquipmentTab :inventory="userData.inventory?.armor" />
    </template>
    <template v-else-if="activeTab === 'Яйца'">
      <EggsTab :eggs="userData.inventory?.eggs" />
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { getUser } from '@/api/userApi'
import BaseTabs from '@/components/BaseTabs.vue'
import Spinner from '@/components/Spinner.vue'
import EquipmentTab from './tabs/equipment/EquipmentTab.vue'
import EggsTab from './tabs/eggs/EggsTab.vue'

const INVENTORY_TABS = [
  { name: 'Снаряжение', value: 'equipment' },
  { name: 'Яйца', value: 'eggs' },
]

const activeTab = ref('Снаряжение')

const {
  data: userData,
  isLoading,
  isError,
} = useQuery({
  queryKey: ['user'],
  queryFn: getUser,
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.inventory {
  padding-top: 24px;
  padding-bottom: 0;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  position: relative;
  &__spinner {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
    height: 100%;
  }

  &__error {
    text-align: center;
    color: $warning;
    padding: 20px;
  }

  &__tabs {
    margin-bottom: 24px;
    @media (max-width: $smallBreakpoint) {
      margin-bottom: 20px;
    }

    :deep(li) {
      flex: 0 1 50%;
    }
  }
}
</style>
