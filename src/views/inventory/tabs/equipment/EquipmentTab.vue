<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useQueryClient, useMutation } from '@tanstack/vue-query'
import { activateArmor, removeArmor } from '@/api/userApi'
import snake from '@/assets/inventory/snake.png'
import EquipmentCard from './EquipmentCard.vue'

const props = defineProps({
  inventory: {
    type: Object,
    required: true,
  },
})

const queryClient = useQueryClient()

const EQUIPMENT_TYPES = {
  HELMET: 'HELMET',
  ARMOR: 'CHESTPLATE',
  SWORD: 'SWORD',
  SHIELD: 'SHIELD',
}

const selectedEquipment = reactive({
  [EQUIPMENT_TYPES.HELMET]: props.inventory?.[EQUIPMENT_TYPES.HELMET] || null,
  [EQUIPMENT_TYPES.ARMOR]: props.inventory?.[EQUIPMENT_TYPES.ARMOR] || null,
  [EQUIPMENT_TYPES.SHIELD]: props.inventory?.[EQUIPMENT_TYPES.SHIELD] || null,
  [EQUIPMENT_TYPES.SWORD]: props.inventory?.[EQUIPMENT_TYPES.SWORD] || null,
})

watch(
  () => props.inventory,
  (newInventory) => {
    if (newInventory) {
      Object.keys(EQUIPMENT_TYPES).forEach((key) => {
        const type = EQUIPMENT_TYPES[key]
        selectedEquipment[type] = newInventory[type] || null
      })
    }
  },
  { immediate: true, deep: true },
)

const activateArmorMutation = useMutation({
  mutationFn: (data) => activateArmor(data.payload),
  onSuccess: (response, variables) => {
    const newItem = response.armor?.[variables.type]
    selectedEquipment[variables.type] = newItem || null
    queryClient.invalidateQueries({ queryKey: ['user'] })
  },
})

const removeArmorMutation = useMutation({
  mutationFn: (data) => removeArmor(data.payload),
  onSuccess: (response, variables) => {
    const newItem = response.armor?.[variables.type]
    queryClient.invalidateQueries({ queryKey: ['user'] })
    selectedEquipment[variables.type] = newItem || null
  },
})

const getAvailableItems = (type) => {
  return props.inventory?.[type] ?? []
}

const handleEquipmentSelect = (type) => {
  const availableItems = getAvailableItems(type)
  if (availableItems?.amount > 0 && !availableItems.activated) {
    const payload = {
      armorType: type,
    }
    activateArmorMutation.mutate({
      payload,
      type,
    })
  }
}

const handleEquipmentRemove = (type) => {
  const payload = {
    armorType: type,
  }
  removeArmorMutation.mutate({
    payload,
    type,
  })
}

//===СТАРЫЙ ВАРИАНТ С МОДАЛКОЙ===========================================================================
// пока оставляю потому что в идеале должно работать так
// const isBottomSheetOpen = ref(false)
// const selectedType = ref(null)
// const items = ref([])

// const openBottomSheet = (type) => {
//   items.value = getAvailableItems(type)
//   selectedType.value = type
//   isBottomSheetOpen.value = true
// }

// <EquipmentBottomSheet
//   v-model:is-open="isBottomSheetOpen"
//   :items="items"
//   :type="selectedType"
//   @select="handleEquipmentSelect"
// />
//===СТАРЫЙ ВАРИАНТ С МОДАЛКОЙ===========================================================================
</script>

<template>
  <div class="equipment">
    <div class="equipment__slots">
      <EquipmentCard
        v-for="([label, type], key) in Object.entries(EQUIPMENT_TYPES)"
        :key="label"
        :type="type"
        :selected-item="selectedEquipment[type]"
        @remove="handleEquipmentRemove"
        @select="handleEquipmentSelect"
      />
    </div>
    <div class="equipment__image">
      <img class="equipment__image-snake" :src="snake" alt="snake" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.equipment {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1 1 auto;

  &__slots {
    display: flex;
    align-items: center;
    justify-content: space-around;
    flex-wrap: wrap;
    gap: 5px;
    height: 82px;
    flex: 0 0 82px;
    @media (max-width: $smallBreakpoint) {
      height: 69px;
      flex: 0 0 69px;
    }
  }

  &__image {
    flex: 1 1 auto;
    width: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }

  &__image-snake {
    flex-shrink: 1;
    width: 90%;
    height: 100%;
    object-fit: contain;
    object-position: bottom;
  }
}
</style>
