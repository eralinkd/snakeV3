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
  await new Promise(resolve => setTimeout(resolve, 1000))

  const telegramInitData = window.Telegram?.WebApp?.initDataUnsafe
  if (telegramInitData && env === 'prod') {
    const authHeader = Telegram.Utils.urlParseQueryString(window.Telegram.WebApp.initData)
    const dataKeys = Object.keys(authHeader).sort()
    const items = dataKeys.map((key) => key + '=' + authHeader[key])
    const dataCheckString = items.join('&')

    userStore.setUserData({
      first_name: telegramInitData.user?.first_name,
      last_name: telegramInitData.user?.last_name,
      username: telegramInitData.user?.username,
      photo_url: telegramInitData.user?.photo_url,
    })

    if (telegramInitData.user?.id) {
      userStore.setUserId(telegramInitData.user.id)
    }

    token = await postAuth(dataCheckString)
  } else if (env === 'dev') {
    const testDataCheckString =
      'auth_date=1736960774&chat_instance=8610356838351439092&chat_type=private&hash=f11aaab0a3b3deb9f3140fdd216c46086947d4426081f27da0c85f5dbc142e51&signature=9cgzhZs_ncdtZTBRXylP7OXnNl5PveVFlAdYzExgMWYil9Vh38gZeekt5Khcvcjwtzvd1hH--WTF--7unJrtDg&user={"id":1,"first_name":"eralinkd","last_name":"","username":"sb_newest","language_code":"ru","allows_write_to_pm":true,"photo_url":"https:\/\/t.me\/i\/userpic\/320\/t8iGW7XVQ3k-EvpOOkPQ0IawHU5MwdAHEG5QJrYx3Gs.svg"}'
    token = await postAuth(testDataCheckString)
  } else {
    console.log('env is not prod or dev')
  }
  userStore.setToken(token.token)

  const queryParams = getTelegramQueryParams()
  console.log(queryParams)
  const refCode = queryParams?.startapp
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
