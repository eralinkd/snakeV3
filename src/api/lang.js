import api from './config'

export const getLanguages = async () => {
	const response = await api.get('/admin/lang')
	return response.data
}

export const getLanguageData = async (langCode) => {
	const response = await api.get(`/admin/lang/${langCode}`)
	return response.data
}