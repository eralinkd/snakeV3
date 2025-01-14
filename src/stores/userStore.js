import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', {
	state: () => ({
		userData: null,
		userId: null,
	}),
	actions: {
		setUserData(data) {
			this.userData = data
		},
		setUserId(id) {
			this.userId = id
		},
	},
}) 