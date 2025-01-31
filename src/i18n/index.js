import { getLanguageData, getLanguages } from '@/api/lang'
import { createI18n } from 'vue-i18n'

export const i18n = createI18n({
	legacy: false,
	locale: 'ru',
	fallbackLocale: 'ru',
	messages: {}
})

const telegramStorage = {
	get: (key) => {
		if (window.Telegram?.WebApp?.CloudStorage) {
			return window.Telegram.WebApp.CloudStorage.getItem(key)
		}
		return localStorage.getItem(key)
	},
	set: async (key, value) => {
		if (window.Telegram?.WebApp?.CloudStorage) {
			await window.Telegram.WebApp.CloudStorage.setItem(key, value)
		} else {
			localStorage.setItem(key, value)
		}
	}
}

export const loadLanguages = async (userLang = null) => {
	try {
		const languages = await getLanguages()

		for (const lang of languages) {
			const langData = await getLanguageData(lang.code)
			i18n.global.setLocaleMessage(lang.code, langData.messages)
		}

		let selectedLang = await telegramStorage.get('user_language')

		if (!selectedLang && userLang) {
			const isLanguageAvailable = languages.some(lang => lang.code === userLang)
			if (isLanguageAvailable) {
				selectedLang = userLang
				// Save the user's language preference
				await telegramStorage.set('user_language', userLang)
			}
		}

		if (selectedLang) {
			i18n.global.locale.value = selectedLang
		}

		return languages
	} catch (error) {
		console.error('Failed to load languages:', error)
		return []
	}
}

export const changeLanguage = async (langCode) => {
	try {
		await telegramStorage.set('user_language', langCode)
		i18n.global.locale.value = langCode
	} catch (error) {
		console.error('Failed to change language:', error)
	}
}