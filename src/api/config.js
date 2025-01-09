import axios from 'axios';
import { useUserStore } from '@/stores/userStore';

const api = axios.create({
	baseURL: import.meta.env.VITE_BASE_URL,
	headers: {
		'Content-Type': 'application/json',
	},
	withCredentials: true,
});

api.interceptors.request.use(
	(config) => {
		// Пропускаем запросы с флагом noUID
		if (config.noUID) {
			delete config.noUID;
			return config;
		}

		const userStore = useUserStore();
		const userId = userStore.userId;

		if (userId) {
			const originalUrl = config.url || '';
			const [urlWithoutHash, hash] = originalUrl.split('#');

			// Добавляем userId в URL
			const separator = urlWithoutHash.includes('?') ? '&' : '?';
			config.url = `${urlWithoutHash}${userId}${separator}${hash ? `#${hash}` : ''}`;
		}

		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

export const setupAxiosInterceptors = (app) => {
	api.interceptors.response.use(
		(response) => response,
		(error) => {
			// Получаем текст ошибки
			const errorMessage = error.response?.data?.message || error.message || 'Неизвестная ошибка';

			// Если используется toast библиотека
			if (app.$toast) {
				app.$toast.error(`Ошибка запроса: ${errorMessage}`);
			} else {
				console.error('API Error:', errorMessage);
			}

			return Promise.reject(error);
		}
	);
};

export default api;
