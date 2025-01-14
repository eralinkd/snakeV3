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
		const userStore = useUserStore()
		const token = userStore.token
		if (token) {
			config.headers.Authorization = `Bearer ${token}`
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
			const errorMessage = error.response?.data?.message || error.message || 'Неизвестная ошибка';

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
