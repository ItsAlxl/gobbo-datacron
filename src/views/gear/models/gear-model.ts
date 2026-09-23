import { signal, createModel, type ReadonlySignal, computed, type Signal } from '@preact/signals'
import { getAlacrityTargetPercentage, getStatRating, statPercLimit, getAlacrityTargetRating } from "../calc-config"
import { StatModel, type IStatModel, type IStatToggle, StatToggleModel, sortedPresetOptionsAsc, sortedPresetOptionsDesc } from "./stat-model"
import { BodyGearSlots, type GearStatIdent, type GearBodySlotIdent, GearStats, type TargetStatIdent } from "../sets"
import { SlotModel, type ISlotModel } from "./slot-model"

type StatPresetOptions = { [k: string]: number }

export type ThresholdStatIdent = "acc" | "alac"
type BuildStatIdent = ThresholdStatIdent | "alac_bonus"
export type StatBudgetIdent = "gear_tert" | "imp_tert" | "aug_tert"

type GearStrategyResult = { gears: number, augs: number, overflow: number }
type GearStrategy = (target: number, perGear: number, maxGears: number, perAug: number, maxAugs: number) => GearStrategyResult
export type GearRecommendation = { gears: Record<TargetStatIdent, number>, augs: Record<TargetStatIdent, number>, overflows: Record<ThresholdStatIdent, number> }

export const NUM_GEARS = 8
export const NUM_AUGS = 14

function calculateNumGear(target: number, per: number) {
	return Math.max(0, Math.ceil(target / per))
}

function optimizeStatCount(target: number, perGear: number, maxGears: number, perAug: number, maxAugs: number) {
	if (target <= 0) {
		return { gears: 0, augs: 0, overflow: 0 }
	}

	let bestOverflow = -target
	let bestGears = 0
	for (let g = 0; g <= maxGears; g++) {
		const gearContribution = g * perGear
		const augs = calculateNumGear(target - gearContribution, perAug)
		if (augs <= maxAugs) {
			const overflow = gearContribution + augs * perAug - target
			if (bestOverflow < 0 ? overflow > bestOverflow : overflow < bestOverflow) {
				bestOverflow = overflow
				bestGears = g
			}
		}
	}

	return {
		gears: bestGears,
		augs: calculateNumGear(target - bestGears * perGear, perAug),
		overflow: bestOverflow,
	}
}

function naiveStatCount(target: number, perGear: number, _maxGears: number, perAug: number, _maxAugs: number) {
	const gears = Math.max(0, Math.floor(target / perGear))
	const augs = calculateNumGear(target - gears * perGear, perAug)
	return {
		gears,
		augs,
		overflow: (gears * perGear + augs * perAug) - target
	}
}

function aIsSubsetOfB(a: Record<string, number>, b: Record<string, number>) {
	for (const k of Object.keys(a)) {
		if (a[k] !== b[k])
			return false
	}
	return true
}

function isRecUnique(recs: GearRecommendation[], rec: GearRecommendation) {
	for (const r of recs) {
		for (const cat of Object.keys(r)) {
			if (aIsSubsetOfB(r[cat as keyof GearRecommendation], rec[cat as keyof GearRecommendation]))
				return false
		}
	}
	return true
}

function isRecValid(r: GearRecommendation) {
	return r.gears.crit >= 0 && r.augs.crit >= 0
}

export interface IGearModel {
	getThreshold(s: BuildStatIdent): IStatModel
	getBudget(b: StatBudgetIdent): IStatModel
	getImplant(idx: number): Signal<GearStatIdent>
	implantContributions: ReadonlySignal<Record<GearStatIdent, number>>
	gearRecommendations: ReadonlySignal<GearRecommendation[]>
	alacBufferToggle: IStatToggle
	accBonusToggle: IStatToggle
	getBodySlot(s: GearBodySlotIdent): ISlotModel
	mainhandSlot: ISlotModel
	offhandSlot: ISlotModel
	earStat: ReadonlySignal<GearStatIdent>
	setEarStat(s: GearStatIdent): void
	getSlotRating(s: ISlotModel): ReadonlySignal<number>
	plannedAugs: Record<GearStatIdent, ReadonlySignal<number>>
	setPlannedAug(s: GearStatIdent, n: number): void
	totalPlannedAugs: ReadonlySignal<number>
	plannedStats: ReadonlySignal<Record<GearStatIdent, number>>
}

export const GearModel = createModel<IGearModel>(() => {
	const alacBufferToggle = new StatToggleModel(0.5)
	const accBonusToggle = new StatToggleModel(1)

	const accPresets = computed(() => {
		const bonus = accBonusToggle.result.value
		return {
			"dc": 0,
			"105": getStatRating(5 - bonus),
			"110": getStatRating(10 - bonus),
		}
	})

	const alacBonus = new StatModel(0, signal({
		"none": 0,
		"3p": 3,
		"5p": 5,
		"UT20": 20,
		"UT25": 25,
		"UT33": 33,
	}), sortedPresetOptionsAsc)

	const alacPresets = computed(() => {
		let opts: StatPresetOptions = {}

		const alacBufferAmt = alacBufferToggle.result.value
		const alacBonusAmt = alacBonus.amount.value

		let prevZeroGcd = 1.5
		let prevZeroRating = 0
		for (let gcd = 1.4; gcd > 0.0; gcd -= 0.1) {
			const perc = getAlacrityTargetPercentage(gcd) + alacBufferAmt - alacBonusAmt
			if (perc < statPercLimit.value) {
				const rating = getStatRating(perc)
				if (rating >= 0) {
					// we only want the highest GCD of the ones with a rating <= 0
					if (prevZeroGcd > 0) {
						opts["gcd_" + prevZeroGcd.toFixed(1)] = prevZeroRating < 0 ? 0 : prevZeroRating
						prevZeroGcd = -1
					}
					opts["gcd_" + gcd.toFixed(1)] = rating
				}
				else {
					prevZeroGcd = gcd
					prevZeroRating = rating
				}
			}
			else {
				break
			}
		}

		return opts
	})

	const thresholds: Record<BuildStatIdent, IStatModel> = {
		acc: new StatModel(getStatRating(10 - accBonusToggle.result.value), accPresets, sortedPresetOptionsDesc),
		alac: new StatModel(getAlacrityTargetRating(1.4, 0, alacBufferToggle.result.value), alacPresets, sortedPresetOptionsAsc),
		alac_bonus: alacBonus,
	}

	const budget: Record<StatBudgetIdent, IStatModel> = {
		gear_tert: new StatModel(640, signal({
			"344": 640,
			"340": 614,
			"336": 589,
		}), sortedPresetOptionsDesc),
		aug_tert: new StatModel(123, signal({
			"g86": 162,
			"p86": 147,
			"b86": 133,
			"g77": 130,
			"b83": 123,
			"p74": 108,
			"b73": 95,
			"p70": 90,
			"none": 0,
		}), sortedPresetOptionsDesc),
		imp_tert: new StatModel(614, signal({
			"340": 614,
			"336": 589,
		}), sortedPresetOptionsDesc),
	}
	const implantTypes = [signal<GearStatIdent>("crit"), signal<GearStatIdent>("crit")]
	const implantContributions = computed(() => {
		const result: Record<GearStatIdent, number> = {
			acc: 0,
			alac: 0,
			crit: 0,
			abs: 0,
			shield: 0,
		}
		const perImp = budget.imp_tert.amount.value
		for (const imp of implantTypes)
			result[imp.value] += perImp
		return result
	})

	const createGearRecommendation = (strategy: GearStrategy, accFirst = true) => {
		const perGear = budget.gear_tert.amount.value
		const perAug = budget.aug_tert.amount.value

		const targetAcc = thresholds.acc.amount.value
		const targetAlac = thresholds.alac.amount.value

		let optimizedAcc: GearStrategyResult
		let optimizedAlac: GearStrategyResult
		if (accFirst) {
			optimizedAcc = strategy(targetAcc - implantContributions.value.acc, perGear, NUM_GEARS, perAug, NUM_AUGS)
			optimizedAlac = strategy(targetAlac - implantContributions.value.alac, perGear, NUM_GEARS - optimizedAcc.gears, perAug, NUM_AUGS - optimizedAcc.augs)
		} else {
			optimizedAlac = strategy(targetAlac - implantContributions.value.alac, perGear, NUM_GEARS, perAug, NUM_AUGS)
			optimizedAcc = strategy(targetAcc - implantContributions.value.acc, perGear, NUM_GEARS - optimizedAlac.gears, perAug, NUM_AUGS - optimizedAlac.augs)
		}

		return {
			gears: {
				acc: optimizedAcc.gears,
				alac: optimizedAlac.gears,
				crit: NUM_GEARS - optimizedAcc.gears - optimizedAlac.gears,
			},
			augs: {
				acc: optimizedAcc.augs,
				alac: optimizedAlac.augs,
				crit: NUM_AUGS - (optimizedAcc.augs + optimizedAlac.augs),
			},
			overflows: {
				acc: optimizedAcc.overflow,
				alac: optimizedAlac.overflow,
			},
		}
	}

	const mainhandSlot = new SlotModel("mainhand")
	const offhandSlot = new SlotModel("offhand")
	const bodySlots: Record<GearBodySlotIdent, ISlotModel> = {} as any
	for (const slot of BodyGearSlots)
		bodySlots[slot] = new SlotModel(slot)

	const earStat = signal<GearStatIdent>("acc")

	const plannedAugs: Record<GearStatIdent, Signal<number>> = {} as any
	for (const stat of GearStats)
		plannedAugs[stat] = signal(0)

	const getSlotRating = (s: ISlotModel) => {
		const rating = s.rating
		return rating.value < 0 ? budget.gear_tert.amount : rating
	}

	const plannedStats = computed(() => {
		const result: Record<GearStatIdent, number> = {
			acc: 0,
			alac: 0,
			crit: 0,
			abs: 0,
			shield: 0,
		}
		const imps = implantContributions.value
		for (const stat of GearStats) {
			result[stat] += imps[stat] + plannedAugs[stat].value * budget.aug_tert.amount.value
		}

		function contributeSlot(slot: ISlotModel) {
			result[slot.stat.value] += getSlotRating(slot).value
		}

		contributeSlot(mainhandSlot)
		contributeSlot(offhandSlot)
		for (const s of Object.values(bodySlots))
			contributeSlot(s)

		return result
	})

	return {
		getThreshold: (s: BuildStatIdent) => thresholds[s],
		getBudget: (b: StatBudgetIdent) => budget[b],
		getImplant: (idx: number) => implantTypes[idx],
		implantContributions,
		gearRecommendations: computed(() => {
			const recs: GearRecommendation[] = []

			for (const accFirst of [true, false]) {
				for (const strat of [optimizeStatCount, naiveStatCount]) {
					const r = createGearRecommendation(strat, accFirst)
					if (isRecValid(r) && isRecUnique(recs, r))
						recs.push(r)
				}
			}

			recs.sort((a: GearRecommendation, b: GearRecommendation) => {
				return (a.overflows.acc + a.overflows.alac) - (b.overflows.acc + b.overflows.alac)
			})
			return recs
		}),
		alacBufferToggle,
		accBonusToggle,
		getBodySlot: (s: GearBodySlotIdent) => bodySlots[s],
		mainhandSlot,
		offhandSlot,
		getSlotRating,
		earStat,
		setEarStat: (s: GearStatIdent) => earStat.value = s,
		plannedAugs,
		setPlannedAug: (s: GearStatIdent, n: number) => plannedAugs[s].value = n,
		totalPlannedAugs: computed(() => GearStats.reduce((n, s) => n + plannedAugs[s].value, 0)),
		plannedStats,
	}
})
