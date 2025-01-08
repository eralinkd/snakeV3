import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMarketStore = defineStore('market', () => {
	const activeTab = ref('Кошелёк')

	const setActiveTab = (tab) => {
		activeTab.value = tab
	}

	return {
		activeTab,
		setActiveTab
	}
}) 