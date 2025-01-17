import api from './config';

export const postAuth = async (initData) => {
    const { data } = await api.post('/auth/login', {
        initData
    });
    return data;
};

