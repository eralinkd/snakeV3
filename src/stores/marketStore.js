import { defineStore } from 'pinia'
import { ref } from 'vue'
import { MARKET_TAB_NAMES } from '@/constants/marketTabs'

export const useMarketStore = defineStore('market', () => {
	const activeTab = ref(MARKET_TAB_NAMES.WALLET)

	const setActiveTab = (tab) => {
		activeTab.value = tab
	}

	return {
		activeTab,
		setActiveTab
	}
}) 