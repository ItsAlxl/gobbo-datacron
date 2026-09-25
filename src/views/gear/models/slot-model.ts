import { createModel, type ReadonlySignal, computed } from '@preact/signals'
import { findStatForSlot, GearSets, getSlotSetsForStat, type GearSetIdent, type GearSlotIdent, type GearStatIdent } from "../sets"
import { updaterSignal, type SaveComponent, type SaveUpdateable } from "../../../saveload/saveload"

export type SavedSlot = [stat: GearStatIdent, rating: number]
export interface ISlotModel extends SaveComponent<SavedSlot> {
	stat: ReadonlySignal<GearStatIdent>
	setStat(s: GearStatIdent): void
	relevantSets: ReadonlySignal<GearSetIdent[]>
	getSetsForStat(s: GearStatIdent): GearSetIdent[]
	rating: ReadonlySignal<number>
	setRating(r: number): void
}

export const SlotModel = createModel<ISlotModel, [SaveUpdateable, GearSlotIdent]>((saver, slotIdent) => {
	const stat = updaterSignal(saver, findStatForSlot(slotIdent, GearSets[0]))
	const relevantSets = computed(() => getSlotSetsForStat(slotIdent, stat.value))
	const rating = updaterSignal(saver, -1)
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
		_save: () => [stat.value, rating.value],
		_load: (d: SavedSlot) => [stat.value, rating.value] = d,
	}
})
