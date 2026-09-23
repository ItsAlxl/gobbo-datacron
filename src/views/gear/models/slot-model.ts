import { signal, createModel, type ReadonlySignal, computed } from '@preact/signals'
import { findStatForSlot, GearSets, getSlotSetsForStat, type GearSetIdent, type GearSlotIdent, type GearStatIdent } from "../sets"

export interface ISlotModel {
	stat: ReadonlySignal<GearStatIdent>
	setStat(s: GearStatIdent): void
	relevantSets: ReadonlySignal<GearSetIdent[]>
	getSetsForStat(s: GearStatIdent): GearSetIdent[]
	rating: ReadonlySignal<number>
	setRating(r: number): void
}

export const SlotModel = createModel<ISlotModel, [GearSlotIdent]>((slotIdent: GearSlotIdent) => {
	const stat = signal(findStatForSlot(slotIdent, GearSets[0]))
	const relevantSets = computed(() => getSlotSetsForStat(slotIdent, stat.value))
	const rating = signal(-1)
	return {
		stat,
		setStat: (s: GearStatIdent) => {
			stat.value = s
			if (rating.value >= 0 && getSlotSetsForStat(slotIdent, s).length > 0)
				rating.value = -1
		},
		relevantSets,
		getSetsForStat: (s: GearStatIdent) => getSlotSetsForStat(slotIdent, s),
		rating,
		setRating: (r: number) => rating.value = r,
	}
})