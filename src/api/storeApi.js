import api from './config'

export const fetchProducts = async (filter) => {
	const { data } = await api.get(`/shop/products/${filter}`);
	return data;
};

export const buyProduct = async (data) => {
	const response = await api.post(`/shop/buy`, data);
	return response.data;
}