import api from './config'

export const postAddRef = async (refCode) => {
	try {
		const response = await api.post(`/users/addRef/${refCode}`)
		return response.data
	} catch (error) {
		console.error('Error adding referral:', error)
		throw error
	}
} 