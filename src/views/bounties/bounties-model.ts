import { signal, createModel, type ReadonlySignal, computed } from '@preact/signals'
import { BountyTargets, BountyPlanets, getBountyTargetsOn, type BountyPlanetIdent, type BountyTargetIdent } from "./bounties"
import { beginSaver, finishSaver, type SaveData, type SaveTarget } from "../../saveload"

type SavedBountyTarget = [boolean, boolean]
export interface IBountyTargetModel {
	killed: ReadonlySignal<boolean>
	toggleKilled: () => void
	capped: ReadonlySignal<boolean>
	toggleCapped: () => void
	numNeeds: ReadonlySignal<number>
	_save: () => SavedBountyTarget
	_load: (d: SavedBountyTarget) => void
}

export const BountyTargetModel = createModel<IBountyTargetModel, [() => void]>((triggerSave: () => void) => {
	const killed = signal(false)
	killed.subscribe(triggerSave)

	const capped = signal(false)
	capped.subscribe(triggerSave)

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
		_save: () => [killed.value, capped.value],
		_load: (d: SavedBountyTarget) => [killed.value, capped.value] = d,
	}
})

type SavedBounties = Record<BountyTargetIdent, SavedBountyTarget>
export interface IBountiesModel {
	targets: Record<BountyTargetIdent, IBountyTargetModel>
	planetScores: Record<BountyPlanetIdent, ReadonlySignal<number>>
}

export const BountiesModel = createModel<IBountiesModel>(() => {
	const saver = beginSaver("bounties")

	const targets: Record<BountyTargetIdent, IBountyTargetModel> = {} as any
	for (const t of BountyTargets)
		targets[t] = new BountyTargetModel(saver.triggerUpdate)

	finishSaver(
		saver as SaveTarget,
		() => {
			const st: SavedBounties = {} as any
			for (const t of BountyTargets)
				st[t] = targets[t]._save()
			return st
		},
		(data: SaveData) => {
			for (const d of Object.keys(data))
				targets[d as BountyTargetIdent]._load(data[d as keyof typeof data] as SavedBountyTarget)
		}
	)

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
	targets.d3x.killed.subscribe(() => {

	})

	return {
		targets,
		planetScores,
	}
})