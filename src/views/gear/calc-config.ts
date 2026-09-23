import { computed, signal } from "@preact/signals"
import constants from "./calc-config.json"

export const statPercLimit = signal(constants.percentageLimit)
export const statExpBase = signal(constants.exponentBase)
export const statExpDenom = signal(constants.maxLevel * constants.exponentDenomFactor)

const logBase = computed(() => Math.log(statExpBase.value))

export const statCalcFinderPerc = signal(5)
export const statCalcFinderRating = signal(getStatRating(5))
export const statCalcFinderK = computed(() => getStatDenom(statCalcFinderRating.value, statCalcFinderPerc.value))

export const CONFIRMED_CALCUATIONS_VERSION = "7.9.1c"

export function getStatDenom(rating: number, percentage: number) {
	return (rating * logBase.value / Math.log(1 - percentage / statPercLimit.value))
}

export function getStatPercentage(rating: number) {
	return statPercLimit.value * (1 - statExpBase.value ** (rating / statExpDenom.value))
}

function getStatRawRating(percentage: number) {
	return statExpDenom.value * Math.log(1 - percentage / statPercLimit.value) / logBase.value
}

export function getStatRating(percentage: number) {
	return Math.ceil(getStatRawRating(percentage))
}

export function getAlacrityTargetPercentage(gcd: number) {
	return (1.5 / gcd - 1) * 100
}

export function getAlacrityTargetRating(gcd: number, percBonus = 0, percBuffer = 0.5) {
	const perc = getAlacrityTargetPercentage(gcd) + percBuffer - percBonus
	if (perc >= statPercLimit.value) {
		return Number.MAX_VALUE
	}
	return getStatRating(perc)
}
