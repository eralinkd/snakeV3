<template>
  <div class="wrapper">
    <main class="main">
      <router-view class="router-content" />
    </main>
    <Navigation />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import Navigation from '@/components/Navigation.vue'
import { postAddRef } from '@/api/referralApi'

const router = useRouter()
const userStore = useUserStore()

const getTelegramQueryParams = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const startParam = urlParams.get('start_param')
  return { start_param: startParam }
}

onMounted(async () => {
  try {
    const telegramInitData = window.Telegram?.WebApp?.initDataUnsafe
    if (telegramInitData?.user) {
      const { id, first_name, last_name, username, photo_url } = telegramInitData.user

      userStore.setUserData({
        first_name,
        last_name,
        username,
        photo_url,
      })

      if (id) {
        userStore.setUserId(id)
      }
    }

    const queryParams = getTelegramQueryParams()
    const refCode = queryParams?.start_param
    if (refCode) {
      await postAddRef(refCode)
    }
  } catch (error) {
    console.error('Error initializing Telegram Web App:', error)
  }
})
</script>

<style scoped lang="scss">
@use './styles/variables.scss' as *;

.main {
  padding: 0 16px;
}

.router-content {
  padding-bottom: 134px;
  @media (max-width: $smallBreakpoint) {
    padding-bottom: 96px;
  }
}
</style>