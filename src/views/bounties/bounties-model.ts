import { signal, createModel, type ReadonlySignal, computed } from '@preact/signals'
import { BountyTargets, BountyPlanets, getBountyTargetsOn, type BountyPlanetIdent, type BountyTargetIdent } from "./bounties"

export interface IBountyTargetModel {
	killed: ReadonlySignal<boolean>
	toggleKilled: () => void
	capped: ReadonlySignal<boolean>
	toggleCapped: () => void
	numNeeds: ReadonlySignal<number>
}

export const BountyTargetModel = createModel<IBountyTargetModel>(() => {
	const killed = signal(false)
	const capped = signal(false)

	return {
		killed,
		toggleKilled: () => killed.value = !killed.value,
		capped,
		toggleCapped: () => capped.value = !capped.value,
		numNeeds: computed(() => {
			const needsCap = !capped.value
			const needsKil = !killed.value
			if (needsCap || needsKil) {
				if (needsCap && needsKil)
					return 2
				return 1
			}
			return 0
		}),
	}
})

export interface IBountiesModel {
	targets: Record<BountyTargetIdent, IBountyTargetModel>
	planetScores: Record<BountyPlanetIdent, ReadonlySignal<number>>
}

export const BountiesModel = createModel<IBountiesModel>(() => {
	const targets: Record<BountyTargetIdent, IBountyTargetModel> = {} as any
	for (const t of BountyTargets)
		targets[t] = new BountyTargetModel()

	const planetScores: Record<BountyPlanetIdent, ReadonlySignal<number>> = {} as any
	for (const p of BountyPlanets) {
		planetScores[p] = computed(() => {
			let score = 0
			for (const t of getBountyTargetsOn(p)) {
				const needs = targets[t].numNeeds.value
				if (needs > 0)
					score += needs === 2 ? 1.1 : 1
			}
			return score
		})
	}

	return {
		targets,
		planetScores,
	}
})