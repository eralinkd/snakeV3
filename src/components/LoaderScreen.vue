<template>
  <div class="loader-screen">
    <div class="loader-screen__spinner"></div>
    <div class="loader-screen__loading-text">{{ t('loader.loading') }}</div>
    <p class="loader-screen__text">{{ t('loader.running') }}</p>
    <p class="loader-screen__text">{{ t('loader.snake') }}</p>
    <!-- <img src="@/assets/loader-text.png" alt="Logo" class="loader-screen__logo" /> -->
    <div class="loader-screen__socials">
      <a href="https://t.me/" target="_blank" class="loader-screen__social-link">
        <img src="@/assets/social/telegram.svg" alt="Telegram" />
      </a>
      <a href="https://twitter.com/" target="_blank" class="loader-screen__social-link">
        <img src="@/assets/social/x.svg" alt="X (Twitter)" />
      </a>
      <a href="https://youtube.com/" target="_blank" class="loader-screen__social-link">
        <img src="@/assets/social/youtube.svg" alt="YouTube" />
      </a>
    </div>
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
  justify-content: flex-end;
  align-items: center;
  padding-bottom: 114px;
  flex-direction: column;
  background-image: url('@/assets/loader-bg.png');
  background-size: cover;
  background-position: center;
  z-index: 9999;

  &__spinner {
    width: 48px;
    height: 48px;
    border: 5px solid rgba(153, 131, 255, 0.2);
    border-top-color: #9983ff;
    border-radius: 50%;
    margin-bottom: 24px;
    animation: rotation 1s linear infinite;
  }

  &__loading-text {
    font-family: Montserrat;
    font-size: 16px;
    font-weight: 700;
    line-height: 24px;
    text-align: center;
    text-underline-position: from-font;
    text-decoration-skip-ink: none;

    margin-bottom: 14px;
    animation: fadeIn 0.5s ease-in;
  }

  &__text {
    font-size: 64px;
    font-weight: 700;
    line-height: 96px;
    text-align: center;
    text-underline-position: from-font;
    text-decoration-skip-ink: none;
    margin: -12px;
    animation: fadeIn 0.5s ease-in;
  }

  &__socials {
    position: absolute;
    bottom: 32px;
    display: flex;
    gap: 24px;
    align-items: center;
  }

  &__social-link {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #191727;
    border-radius: 50%;
    transition: background-color 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    // img {
    //   width: 24px;
    //   height: 24px;
    // }
  }
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
