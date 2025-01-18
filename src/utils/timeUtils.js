const pluralize = (number, one, few, many) => {
	const lastDigit = number % 10
	const lastTwoDigits = number % 100

	if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return many
	if (lastDigit === 1) return one
	if (lastDigit >= 2 && lastDigit <= 4) return few
	return many
}

export const formatTimeAgo = (milliseconds) => {
	if (milliseconds === 0) return 'Только что'

	const seconds = Math.floor(milliseconds / 1000)
	const minutes = Math.floor(seconds / 60)
	const hours = Math.floor(minutes / 60)
	const days = Math.floor(hours / 24)
	const weeks = Math.floor(days / 7)
	const months = Math.floor(days / 30)

	if (months > 0) {
		return `${months} ${pluralize(months, 'месяц', 'месяца', 'месяцев')}`
	}
	if (weeks > 0) {
		return `${weeks} ${pluralize(weeks, 'неделя', 'недели', 'недель')}`
	}
	if (days > 0) {
		return `${days} ${pluralize(days, 'день', 'дня', 'дней')}`
	}
	if (hours > 0) {
		return `${hours} ${pluralize(hours, 'час', 'часа', 'часов')}`
	}
	if (minutes > 0) {
		return `${minutes} ${pluralize(minutes, 'минута', 'минуты', 'минут')}`
	}

	return 'Только что'
} 