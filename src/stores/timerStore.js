import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTimerStore = defineStore('timer', () => {
	const timers = ref({})
	let interval = null

	// Add persistence by storing timers in localStorage
	const loadTimers = () => {
		const savedTimers = localStorage.getItem('timers')
		if (savedTimers) {
			const parsed = JSON.parse(savedTimers)
			// Adjust timers based on elapsed time
			const now = Date.now()
			const lastUpdate = parseInt(localStorage.getItem('lastUpdate') || now)
			const elapsedSeconds = Math.floor((now - lastUpdate) / 1000)

			timers.value = Object.entries(parsed).reduce((acc, [id, time]) => ({
				...acc,
				[id]: Math.max(0, time - elapsedSeconds)
			}), {})

			// Start timer if there are active timers
			if (Object.values(timers.value).some(time => time > 0)) {
				startGlobalTimer()
			}
		}
	}

	const saveTimers = () => {
		localStorage.setItem('timers', JSON.stringify(timers.value))
		localStorage.setItem('lastUpdate', Date.now().toString())
	}

	const startGlobalTimer = () => {
		if (interval) return

		interval = setInterval(() => {
			const hasActiveTimers = Object.values(timers.value).some(time => time > 0)

			if (!hasActiveTimers) {
				clearInterval(interval)
				interval = null
				return
			}

			timers.value = Object.entries(timers.value).reduce((acc, [id, time]) => ({
				...acc,
				[id]: time > 0 ? time - 1 : 0
			}), {})

			// Save state after each update
			saveTimers()
		}, 1000)
	}

	const setTimer = (id, seconds) => {
		timers.value = {
			...timers.value,
			[id]: seconds
		}
		saveTimers()
		startGlobalTimer()
	}

	const getTimer = (id) => timers.value[id] || 0

	// Load saved timers when store is initialized
	loadTimers()

	return {
		timers,
		setTimer,
		getTimer
	}
})