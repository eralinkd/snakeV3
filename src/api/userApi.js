import api from './config';

export const getUser = async () => {
	const { data } = await api.get(`/users/profile`)
	return data;
};