import api from './config'

export const postAddRef = async (refCode) => {
	console.log(`Sending request to addRef: ${refCode}`)
	const response = await api.post(`/users/addRef/${refCode}`)
	console.log('Response from addRef:', response)
	return response.data
} 