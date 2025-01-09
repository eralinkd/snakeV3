import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
	const userId = ref(817930953)
	const userData = ref({
		first_name: null,
		last_name: null,
		username: null,
		photo_url: null
	})

	const setUserId = (id) => {
		userId.value = id
	}

	const setUserData = (data) => {
		userData.value = {
			...userData.value,
			...data
		}
	}

	return {
		userId,
		userData,
		setUserId,
		setUserData
	}
}) 