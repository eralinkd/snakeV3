<template>
  <div class="loader-screen">
    <p class="loader-screen__text">{{ t('common.loading') }}</p>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style lang="scss" scoped>
.loader-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #1B1829;
  z-index: 9999;

  &__text {
    color: #fff;
    font-family: Montserrat;
    font-size: 24px;
    font-weight: 500;
  }
}
</style> 