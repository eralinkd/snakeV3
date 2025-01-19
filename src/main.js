import '@/styles/main.scss'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { setupAxiosInterceptors } from '@/api/config'
import { i18n } from './i18n'


const pinia = createPinia()
const app = createApp(App)

app.use(router)
app.use(pinia)
app.use(VueQueryPlugin)
app.use(i18n)

// Устанавливаем интерцепторы
setupAxiosInterceptors(app)

app.mount('#app')
