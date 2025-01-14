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
import { postAddRef } from '@/api/referralApi' // Нужно создать этот API метод

const router = useRouter()
const userStore = useUserStore()

// Получение параметров из URL Telegram
const getTelegramQueryParams = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const startParam = urlParams.get('start_param')
  return { start_param: startParam }
}

onMounted(async () => {
  const queryParams = new URLSearchParams(window.location.search)
  const initData = queryParams.get('tgWebAppData')
  if (initData) {
    console.log('initData', JSON.parse(decodeURIComponent(initData)))
    return
  }

  try {
    const queryParams = new URLSearchParams(window.location.search)
    const initData = queryParams.get('tgWebAppData')
    if (initData) {
      console.log('initData', JSON.parse(decodeURIComponent(initData)))
      return
      const { id, first_name, last_name, username, photo_url } = telegramInitData.user
      console.log('id, first_name, last_name, username, photo_url', id, first_name, last_name, username, photo_url)

      // Сохраняем данные пользователя
      userStore.setUserData({
        first_name,
        last_name,
        username,
        photo_url,
      })

      // Сохраняем ID пользователя
      if (id) {
        userStore.setUserId(id)
      }
    }

    // Обработка реферального кода
    // const queryParams = getTelegramQueryParams()
    // const refCode = queryParams?.start_param
    // if (refCode) {
    //   await postAddRef(refCode)
    // }
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