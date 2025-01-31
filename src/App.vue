<template>
  <LoaderScreen v-if="isLoading" />
  <div v-else class="wrapper">
    <main class="main">
      <router-view class="router-content" />
    </main>
    <Navigation />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import Navigation from '@/components/Navigation.vue'
import LoaderScreen from '@/components/LoaderScreen.vue'
import { postAddRef } from '@/api/referralApi'
import { postAuth } from '@/api/auth'
import { loadLanguages } from './i18n'

const userStore = useUserStore()
const isLoading = ref(true)
let token
const env = import.meta.env.VITE_ENV

onMounted(async () => {
  console.log('=== onMounted start ===')

  try {
    const minLoadingTime = new Promise((resolve) => setTimeout(resolve, 300))

    const authProcess = (async () => {
      // Проверяем наличие токена в куках
      const savedToken = document.cookie
        .split('; ')
        .find((row) => row.startsWith('auth_token='))
        ?.split('=')[1]

      if (savedToken) {
        console.log('Found saved token, skipping auth')
        userStore.setToken(savedToken)
        return
      }

      const telegramInitData = window.Telegram?.WebApp?.initDataUnsafe
      let startParam = telegramInitData.start_param
      if (telegramInitData && env === 'prod') {
        console.log('Production mode with Telegram data')
        const authHeader = Telegram.Utils.urlParseQueryString(window.Telegram.WebApp.initData)
        const dataKeys = Object.keys(authHeader).sort()
        const items = dataKeys.map((key) => key + '=' + authHeader[key])
        let dataCheckString = items.join('&')
        console.log('Auth data string:', dataCheckString)

        userStore.setUserData({
          first_name: telegramInitData.user?.first_name,
          last_name: telegramInitData.user?.last_name,
          username: telegramInitData.user?.username,
          photo_url: telegramInitData.user?.photo_url,
          language_code: telegramInitData.user?.language_code.toLowerCase(),
        })

        console.log('Set user data:', telegramInitData.user)

        if (telegramInitData.user?.id) {
          userStore.setUserId(telegramInitData.user.id)
          console.log('Set user ID:', telegramInitData.user.id)
        }

        token = await postAuth(dataCheckString)
        console.log('Auth response:', token)
        if (token && token.token) {
          userStore.setToken(token.token)
          // Сохраняем токен в куки на день
          document.cookie = `auth_token=${token.token}; max-age=86400; path=/`
        } else {
          console.error('Authorization failed')
        }
      } else if (env === 'dev') {
        console.log('Development mode')
        const testDataCheckString =
          'auth_date=1736960774&chat_instance=8610356838351439092&chat_type=private&hash=f11aaab0a3b3deb9f3140fdd216c46086947d4426081f27da0c85f5dbc142e51&signature=9cgzhZs_ncdtZTBRXylP7OXnNl5PveVFlAdYzExgMWYil9Vh38gZeekt5Khcvcjwtzvd1hH--WTF--7unJrtDg&user={"id":1,"first_name":"eralinkd","last_name":"","username":"sb_newest","language_code":"ru","allows_write_to_pm":true,"photo_url":"https:\/\/t.me\/i\/userpic\/320\/t8iGW7XVQ3k-EvpOOkPQ0IawHU5MwdAHEG5QJrYx3Gs.svg"}'
        console.log('Test auth string:', testDataCheckString)
        token = await postAuth(testDataCheckString)
        console.log('Dev auth response:', token)
        if (token && token.token) {
          userStore.setToken(token.token)
          // Сохраняем токен в куки на день
          document.cookie = `auth_token=${token.token}; max-age=86400; path=/`
          console.log('Dev token saved:', token.token)
        } else {
          console.error('Authorization failed for dev mode')
        }
      } else {
        console.log('env is not prod or dev')
      }

      if (startParam) {
        console.log(`Adding referral code: ${startParam}`)
        const res = await postAddRef(startParam)
        console.log(`Referral code added successfully: ${res}`)
      }
    })()

    // Ждем завершения обоих Promise
    await Promise.all([minLoadingTime, authProcess])

    // test
    console.log('User data:', userStore.userData)
    if (!userStore.userData?.language_code) {
      const telegramInitData = window.Telegram?.WebApp?.initDataUnsafe
      console.log('Telegram init data:', telegramInitData)
      await loadLanguages(telegramInitData.user?.language_code.toLowerCase() || 'en')
    } else {
      await loadLanguages(userStore.userData?.language_code || 'en')
    }

    console.log('=== onMounted end ===')
  } catch (error) {
    console.error('Auth error:', error)
  } finally {
    isLoading.value = false
  }
})
</script>

<style lang="scss">
@use './styles/variables.scss' as *;
/* The following style is NOT scoped, so it applies globally. 
   We check for data-playing="true" on the html tag, and hide .navigation and .bottom-navigation. */

:root[data-playing='true'] {
  .navigation,
  .bottom-navigation {
    display: none !important;
  }
}

.main {
  display: flex;
  flex-direction: column;
}

.router-content {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  padding: 0 16px;
  padding-bottom: 134px;
  @media (max-width: $smallBreakpoint) {
    padding-bottom: 96px;
  }
}
</style>
