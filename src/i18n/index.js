import { getLanguageData, getLanguages } from '@/api/lang'
import { createI18n } from 'vue-i18n'

export const i18n = createI18n({
	legacy: false,
	locale: 'ru',
	fallbackLocale: 'ru',
	messages: {}
})

export const loadLanguages = async (userLang = null) => {
	try {
		const languages = await getLanguages()

		for (const lang of languages) {
			const langData = await getLanguageData(lang.code)
			i18n.global.setLocaleMessage(lang.code, langData.messages)
		}

		if (userLang) {
			const isLanguageAvailable = languages.some(lang => lang.code === userLang)
			if (isLanguageAvailable) {
				i18n.global.locale.value = userLang
			}
		}

		return languages
	} catch (error) {
		console.error('Failed to load languages:', error)
		return []
	}
}