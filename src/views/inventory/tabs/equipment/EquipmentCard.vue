<template>
  <BaseSelect
    v-model="selectedAction"
    :options="availableActions"
    placement="bottom"
    className="equipment-card__select"
    @select="handleAction"
  >
    <template #trigger="{ isOpen }">
      <div
        class="equipment-card plateBg"
        :class="{
          'equipment-card--selected': selectedItem?.activated,
          'equipment-card--active': isOpen,
        }"
      >
        <img :src="getDefaultImage" :alt="type" />
      </div>
    </template>
    <template #option="{ option }">
      <span
        :class="{
          'equipment-card__remove': option.value === 'remove',
          'equipment-card__disabled': option.disabled,
        }"
      >
        {{ option.label }}
      </span>
    </template>
  </BaseSelect>
</template>

<script setup>
import { computed, ref } from 'vue'
import BaseSelect from '@/components/BaseSelect.vue'
import defaultSword from '@/assets/inventory/sword.svg'
import defaultShield from '@/assets/inventory/shield.svg'
import defaultHelmet from '@/assets/inventory/helmet.svg'
import defaultArmor from '@/assets/inventory/armor.svg'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  type: {
    type: String,
    required: true,
  },
  selectedItem: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['select', 'remove', 'openBottomSheet'])

const selectedAction = ref('')

const availableActions = computed(() => {
  if (props.selectedItem?.activated) {
    return [{ value: 'remove', label: t('inventory.select_remove') }]
  }

  if (props.selectedItem?.amount <= 0) {
    return [{ value: 'unavailable', label: t('inventory.select_empty'), disabled: true }]
  }

  return [{ value: 'equip', label: t('inventory.select_equip') }]
})

const getDefaultImage = computed(() => {
  const imageMap = {
    HELMET: defaultHelmet,
    CHESTPLATE: defaultArmor,
    SHIELD: defaultShield,
    SWORD: defaultSword,
  }
  return imageMap[props.type] || defaultArmor
})

const handleAction = (action) => {
  if (action.value === 'equip') {
    emit('select', props.type)
  } else if (action.value === 'remove') {
    emit('remove', props.type)
  }
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.equipment-card {
  position: relative;
  -webkit-tap-highlight-color: transparent;
  cursor: pointer;
  border-radius: 16px;
  aspect-ratio: 1/1;
  display: flex;
  padding: 7px;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease 0s;
  opacity: 0.5;
  width: 82px;
  @media (max-width: $smallBreakpoint) {
    width: 69px;
  }

  &--selected {
    opacity: 1;
  }
  &--active {
    box-shadow: 0px 0px 20px 0px rgba(187, 142, 255, 0.527);
    background: linear-gradient(
      281.12deg,
      rgba(27, 24, 41, 0.75) -31.08%,
      rgba(76, 64, 120, 0.75) 169.48%
    );
  }

  &:active {
    background: linear-gradient(
      281.12deg,
      rgba(27, 24, 41, 0.75) -31.08%,
      rgba(76, 64, 120, 0.75) 169.48%
    );
  }

  & > img {
    height: 100%;
    width: 100%;
    object-fit: contain;
  }

  &__button {
    position: absolute;
    top: 5px;
    right: 5px;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    cursor: pointer;
  }

  &__remove {
    color: $warning;
  }

  &__disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
}
</style>
