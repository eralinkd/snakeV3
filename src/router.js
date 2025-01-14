import { createRouter, createWebHistory } from 'vue-router'

const routes = [
	{
		path: '/',
		redirect: '/game'
	},
	{
		path: '/game',
		name: 'Game',
		component: () => import('@/views/Game.vue'),
	},
	{
		path: '/market',
		name: 'Market',
		component: () => import('@/views/market/Market.vue'),
	},
	{
		path: '/shop',
		name: 'Shop',
		component: () => import('@/views/shop/Shop.vue'),
	},
	{
		path: '/profile',
		name: 'Profile',
		component: () => import('@/views/Profile.vue'),
	},
	{
		path: '/inventory',
		name: 'Inventory',
		component: () => import('@/views/Inventory.vue'),
	},
]

const router = createRouter({
	history: createWebHistory(),
	routes,
})

export default router
