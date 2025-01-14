import api from './config';

export const postAuth = async (header) => {
    const { data } = await api.post('/auth/login', {}, {
        headers: {
            'Telegram-Data': header
        }
    });
    return data;
};

