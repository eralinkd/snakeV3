<template>
  <BaseBottomSheet :is-open="isOpen" @update:is-open="closeModal">
    <div class="equipment-sheet">
      <h3 class="equipment-sheet__title">Выберите предмет</h3>
      <div class="equipment-sheet__items" v-if="items?.amount > 0">
        <div
          v-for="item in items.amount"
          :key="item.id"
          class="equipment-sheet__item"
          @click="selectItem(items)"
        >
          <img :src="item.image" :alt="item.name" />
          <span>{{ item.name }}</span>
        </div>
      </div>
      <div v-else class="equipment-sheet__empty">
        <p>Нет доступных предметов</p>
      </div>
    </div>
  </BaseBottomSheet>
</template>

<script setup>
import BaseBottomSheet from '@/components/BaseBottomSheet.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  items: {
    type: [Array, Object],
    default: () => [],
  },
  type: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:is-open', 'select'])

const closeModal = () => {
  emit('update:is-open', false)
}

const selectItem = (item) => {
  emit('select', props.type, item)
  closeModal()
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.equipment-sheet {
  &__title {
    text-align: center;
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 24px;
  }

  &__items {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    @media (min-width: $smallBreakpoint) {
      grid-template-columns: 1fr;
    }
  }

  &__item {
    cursor: pointer;
    padding: 12px;
    border-radius: 12px;
    background: rgba(42, 38, 60, 0.75);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(76, 64, 120, 0.75);
    }

    img {
      width: 60px;
      height: 60px;
      object-fit: contain;
    }

    span {
      text-align: center;
      font-size: 14px;
    }
  }

  &__empty {
    text-align: center;
    padding: 40px;
    color: rgba($mainColor, 0.6);
  }
}
</style>
