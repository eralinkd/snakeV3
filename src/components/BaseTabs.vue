<script setup>
import { computed } from 'vue'

const props = defineProps({
  tabs: {
    type: Array,
    required: true,
  },
  activeTab: {
    type: String,
    required: true,
  },
  components: {
    type: Object,
    default: {},
  },
  className: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:activeTab'])

const setActiveTab = (tab) => {
  emit('update:activeTab', tab)
}

const currentComponent = computed(() => {
  const tab = props.tabs.find((t) => t.name === props.activeTab)
  return tab ? props.components?.[tab.component] : null
})
</script>

<template>
  <div :class="['tabs', className]">
    <ul class="tabs__nav nav-tabs">
      <li
        v-for="tab in tabs"
        :key="tab.name"
        :class="{
          'nav-tabs__item': true,
          'nav-tabs__item--active accentGrad': activeTab === tab.name,
        }"
        @click="setActiveTab(tab.name)"
      >
        {{ tab.name }}
      </li>
    </ul>

    <section v-if="currentComponent" class="tabs__section">
      <Transition name="fade" mode="out-in" appear>
        <component :is="currentComponent" :key="activeTab" />
      </Transition>
    </section>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.nav-tabs {
  display: flex;
  align-items: center;
  border-radius: 16px;
  background: $plateBg;
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(15px);
  &__item {
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    opacity: 0.4;
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
  transition: opacity 0.2s ease;
}
.fade-enter-from,
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
