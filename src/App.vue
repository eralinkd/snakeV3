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
import { useUserStore } from '@/stores/userStore'
import Navigation from '@/components/Navigation.vue'
import { postAddRef } from '@/api/referralApi'
import { postAuth } from '@/api/auth'

const userStore = useUserStore()
let authHeader = `id=${1}`

const getTelegramQueryParams = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const startParam = urlParams.get('start_param')
  return { start_param: startParam }
}

onMounted(async () => {
  console.log(window)
  console.log(window.Telegram)
  const telegramInitData = window.Telegram?.WebApp?.initDataUnsafe
  if (telegramInitData) {
    const headerParams = []
    console.log(telegramInitData)

    if (telegramInitData.user) {
      const userData = telegramInitData.user
      Object.entries(userData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          headerParams.push(`${key}=${value}`)
        }
      })
    }

    Object.entries(telegramInitData).forEach(([key, value]) => {
      if (key !== 'user' && value !== undefined && value !== null) {
        headerParams.push(`${key}=${value}`)
      }
    })

    authHeader = headerParams.join('&')

    userStore.setUserData({
      first_name: telegramInitData.user?.first_name,
      last_name: telegramInitData.user?.last_name,
      username: telegramInitData.user?.username,
      photo_url: telegramInitData.user?.photo_url,
      auth_date: telegramInitData?.auth_date,
      hash: telegramInitData?.hash,
    })

    if (telegramInitData.user?.id) {
      userStore.setUserId(telegramInitData.user.id)
    }
  }

  authHeader = window.Telegram?.WebApp?.initData

  const token = await postAuth(authHeader)
  userStore.setToken(token.token)

  const queryParams = getTelegramQueryParams()
  const refCode = queryParams?.start_param
  if (refCode) {
    await postAddRef(refCode)
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
