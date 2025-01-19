import api from './config'

export const getGameData = async () => {
    const response = await api.get('/users/gameInfo')
    return response.data
}

export const postGameSnakeCreate = async () => {
    const response = await api.post('/game/snake/create')
    return response.data
}

export const postCreateMinerGame = async (data) => {
    const response = await api.post(`/game/bomb/create`, data);
    return response.data;
  }

export const postGameGameEnd = async (gameId) => {
    const response = await api.post(`/game/game/end/${gameId}`)
    return response.data
}

export const postGameCurrentContent = async (gameId, content) => {
    console.log(content)
    const response = await api.post(`/game/game/currentContent/${gameId}`, content)
    return response.data
}

