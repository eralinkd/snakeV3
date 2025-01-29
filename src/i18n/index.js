import { createI18n } from 'vue-i18n'
import ru from '@/locales/ru.json'
import en from '@/locales/en.json'
import ua from '@/locales/ua.json'
import zh from '@/locales/zh.json'


export const i18n = createI18n({
	legacy: false,
	locale: 'ru',
	fallbackLocale: 'ru',
	messages: {
		ru,
		en,
		ua,
		zh
	}
}) 