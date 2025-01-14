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
  const telegramInitData = window.Telegram?.WebApp?.initDataUnsafe
  if (telegramInitData?.user) {
    const { id, first_name, last_name, username, photo_url } = telegramInitData.user
    const auth_date = telegramInitData.auth_date
    const hash = telegramInitData.hash

    userStore.setUserData({
      first_name,
      last_name,
      username,
      photo_url,
      auth_date,
      hash
    })

    if (id) {
      userStore.setUserId(id)
    }

    authHeader = `id=${id}&first_name=${first_name}&last_name=${last_name}&auth_date=${auth_date}&hash=${hash}`
  }

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
