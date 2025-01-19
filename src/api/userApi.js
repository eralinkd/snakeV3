import api from './config';

export const getUser = async () => {
	const { data } = await api.get(`/users/profile`)
	return data;
};

export const postTakeEgg = async (level) => {
	const { data } = await api.post(`/users/takeEgg/${level}`)
	return data;
};

export const postBreakEgg = async (level) => {
	const { data } = await api.post(`/users/activateEgg/${level}`)
	return data;
}

export const activateArmor = async (payload) => {
	const { data } = await api.post(`/users/activateArmor`, payload)
	return data;
}

export const removeArmor = async (payload) => {
	const { data } = await api.post(`/users/removeArmor`, payload)
	return data;
}

export const postUserSwap = async (payload) => {
	const { data } = await api.post(`/users/swap`, payload)
	return data;
}

export const getUserQuests = async () => {
	const { data } = await api.get(`/users/quests`)
	return data;
}

export const postCompleteQuest = async (questId) => {
	const { data } = await api.post(`/users/completeQuest/${questId}`)
	return data;
}

export const updateLanguage = async (language) => {
	const { data } = await api.post(`/users/changeLang/${language}`)
	return data
}
