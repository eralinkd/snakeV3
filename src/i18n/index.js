import { getLanguageData, getLanguages } from '@/api/lang'
import { createI18n } from 'vue-i18n'

export const i18n = createI18n({
	legacy: false,
	locale: 'ru',
	fallbackLocale: 'ru',
	messages: {}
})

let loadedLanguages = null

export const loadLanguages = async () => {
	if (loadedLanguages) {
		return loadedLanguages
	}

	try {
		const languages = await getLanguages()

		for (const lang of languages) {
			const langData = await getLanguageData(lang.code)
			i18n.global.setLocaleMessage(lang.code, langData.messages)
		}

		loadedLanguages = languages
		return languages
	} catch (error) {
		console.error('Failed to load languages:', error)
		return []
	}
}

export const setCurrentLanguage = (langCode) => {
	if (!loadedLanguages) {
		console.warn('Languages not loaded yet. Call loadLanguages first')
		return false
	}

	const isLanguageAvailable = loadedLanguages.some(lang => lang.code === langCode)
	if (isLanguageAvailable) {
		i18n.global.locale.value = langCode
		return true
	}
	return false
}