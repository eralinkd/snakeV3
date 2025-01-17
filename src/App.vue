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
let token
const env = import.meta.env.VITE_ENV // prod or dev

const getTelegramQueryParams = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const startParam = urlParams.get('startapp')
  return { startapp: startParam }
}

onMounted(async () => {
  console.log('=== onMounted start ===')
  const storedToken = sessionStorage.getItem('userToken')
  const storedUserData = JSON.parse(sessionStorage.getItem('userData'))
  console.log('Stored data:', { storedToken, storedUserData })

  const telegramInitData = window.Telegram?.WebApp?.initDataUnsafe
  console.log('Telegram init data:', telegramInitData)
  alert(window.location.href)

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
    })
    console.log('Set user data:', telegramInitData.user)

    if (telegramInitData.user?.id) {
      userStore.setUserId(telegramInitData.user.id)
      console.log('Set user ID:', telegramInitData.user.id)
    }
    if (dataCheckString) {
      sessionStorage.setItem('dataCheckString', dataCheckString)
    }
    else {
      dataCheckString = sessionStorage.getItem('dataCheckString')
    }
    token = await postAuth(dataCheckString)
    console.log('Auth response:', token)
    if (token && token.token) {
      userStore.setToken(token.token)
      sessionStorage.setItem('userToken', token.token)
      sessionStorage.setItem('userData', JSON.stringify({
        first_name: telegramInitData.user?.first_name,
        last_name: telegramInitData.user?.last_name,
        username: telegramInitData.user?.username,
        photo_url: telegramInitData.user?.photo_url,
      }))
      console.log('Token saved to session storage')
    } else {
      console.error("Authorization failed");
      if (storedToken && storedUserData) {
        userStore.setToken(storedToken)
        userStore.setUserData(storedUserData)
        console.log('Using stored data after auth failure:', { storedToken, storedUserData })
      }
    }
  } else if (env === 'dev') {
    console.log('Development mode')
    const testDataCheckString =
      'auth_date=1736960774&chat_instance=8610356838351439092&chat_type=private&hash=f11aaab0a3b3deb9f3140fdd216c46086947d4426081f27da0c85f5dbc142e51&signature=9cgzhZs_ncdtZTBRXylP7OXnNl5PveVFlAdYzExgMWYil9Vh38gZeekt5Khcvcjwtzvd1hH--WTF--7unJrtDg&user={"id":1,"first_name":"eralinkd","last_name":"","username":"sb_newest","language_code":"ru","allows_write_to_pm":true,"photo_url":"https:\/\/t.me\/i\/userpic\/320\/t8iGW7XVQ3k-EvpOOkPQ0IawHU5MwdAHEG5QJrYx3Gs.svg"}';
    console.log('Test auth string:', testDataCheckString)
    token = await postAuth(testDataCheckString)
    console.log('Dev auth response:', token)
    if (token && token.token) {
      userStore.setToken(token.token)
      sessionStorage.setItem('userToken', token.token)
      console.log('Dev token saved:', token.token)
    } else {
      console.error("Authorization failed for dev mode");
      if (storedToken && storedUserData) {
        userStore.setToken(storedToken)
        userStore.setUserData(storedUserData)
        console.log('Using stored data in dev mode:', { storedToken, storedUserData })
      }
    }
  } else {
    console.log('env is not prod or dev');
    if (storedToken && storedUserData) {
      userStore.setToken(storedToken)
      userStore.setUserData(storedUserData)
      console.log('Using stored data in undefined env:', { storedToken, storedUserData })
    }
  }

  const queryParams = getTelegramQueryParams()
  console.log('Telegram query params:', queryParams)
  const refCode = queryParams?.startapp
  if (refCode) {
    console.log('Adding referral code:', refCode)
    await postAddRef(refCode)
    console.log('Referral code added successfully')
  }
  console.log('=== onMounted end ===')
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
