import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/game',
        name: 'Game',
        component: () => import('@/views/Game.vue'),
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router
