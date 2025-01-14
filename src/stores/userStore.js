import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
	const userId = ref(1)
	const userData = ref({
		first_name: null,
		last_name: null,
		username: null,
		photo_url: null,
		auth_date: null,
		hash: null
	})
	const token = ref(null)

	const setUserId = (id) => {
		userId.value = id
	}

	const setUserData = (data) => {
		userData.value = {
			...userData.value,
			...data
		}
	}

	const setToken = (t) => {
		token.value = t
	}

	return {
		userId,
		userData,
		token,
		setUserId,
		setUserData,
		setToken
	}
}) 