<script setup>
import { ref } from 'vue'
import BaseBottomSheet from '@/components/BaseBottomSheet.vue'

const isOpen = ref(false)
</script>

<template>
  <BaseBottomSheet v-model:is-open="isOpen">
    <div class="store-modal">
      <!-- Modal content will go here -->
    </div>
  </BaseBottomSheet>
</template>

<style lang="scss" scoped>
.store-modal {
  padding: 20px;
}
</style>
