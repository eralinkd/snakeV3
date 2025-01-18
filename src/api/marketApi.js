import api from './config';

export const fetchCryptos = async () => {
	const { data } = await api.get('/payment/cryptos', { noUID: true })
	return data
};

export const getHistory = async (filter) => {
	const tmpData = {
		filter
	}
	const { data } = await api.post(`/users/history`, tmpData);
	return data;
};

export const validatePaymentAddress = async (data) => {
	const response = await api.post(`/payment/validate`, data, { noUID: true });
	return response.data;
};


export const withdrawBalance = async (data) => {
	const response = await api.post(`/users/withdrawBalance`, data);
	return response.data;
}

export const replenishBalance = async (data) => {
	const response = await api.post(`/users/replenishBalance`, data);
	return response.data;
}

export const getSwapInfo = async (from, to, amount) => {
	const response = await api.get(`/payment/swapInfo/${from}/${to}/${amount}`);
	return response.data;
}
