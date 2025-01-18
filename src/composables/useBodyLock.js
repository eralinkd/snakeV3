import { watch, onUnmounted } from 'vue'

export function useBodyLock(locked) {
	const appElement = document.getElementById('app')

	const addBodyLock = () => {
		const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth
		appElement.style.paddingRight = `${scrollBarWidth}px`
		appElement.classList.add('lock')
	}

	const removeBodyLock = () => {
		appElement.classList.remove('lock')
		appElement.style.paddingRight = '0px'
	}

	// Следим за изменением значения locked
	watch(
		locked,
		(newValue) => {
			if (newValue) {
				addBodyLock()
			} else {
				removeBodyLock()
			}
		},
		{ immediate: true }
	)

	// Очищаем при размонтировании компонента
	onUnmounted(() => {
		removeBodyLock()
	})
} 