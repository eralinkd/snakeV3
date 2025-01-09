import '@/styles/main.scss'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { setupAxiosInterceptors } from '@/api/config'


const pinia = createPinia()
const app = createApp(App)

app.use(router)
app.use(pinia)
app.use(VueQueryPlugin)

// Устанавливаем интерцепторы
setupAxiosInterceptors(app)

app.mount('#app')
