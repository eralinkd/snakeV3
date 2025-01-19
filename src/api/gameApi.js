import api from './config';

export const getGameData = async () => {
    const { data } = await api.get('/game/data');
    return data;
};
