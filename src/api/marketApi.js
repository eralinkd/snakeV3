import api from './config';

export const fetchCryptos = async () => {
	const { data } = await api.get('/payment/cryptos', { noUID: true })
	return data
};