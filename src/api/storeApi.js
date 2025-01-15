import api from './config'

export const fetchProducts = async (filter) => {
	const { data } = await api.get(`/shop/products/${filter}`);
	return data;
};