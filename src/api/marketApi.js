import api from './config';

export const fetchCryptos = async () => {
	const { data } = await api.get('/payment/cryptos', { noUID: true })
	return data
};

export const getHistory = async (filter) => {
	const tmpData = {
		filter
	}
	const { data } = await api.post(`/users/history/`, tmpData);
	return data;
};