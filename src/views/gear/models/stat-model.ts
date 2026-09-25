import { createModel, type ReadonlySignal, computed } from '@preact/signals'
import { updaterSignal, type SaveComponent, type SaveUpdateable } from "../../../saveload/saveload"

export type StatPresetOptions = { [k: string]: number }
type StatPresetSorter = (p: StatPresetOptions) => StatPresetGenerator
type StatPresetGenerator = Generator<string, void, unknown>

export function* sortedPresetOptionsAsc(opts: StatPresetOptions) {
	yield* Object.keys(opts).sort((a, b) => opts[a] - opts[b])
}

export function* sortedPresetOptionsDesc(opts: StatPresetOptions) {
	yield* Object.keys(opts).sort((a, b) => opts[b] - opts[a])
}

export type SavedStat = number
export interface IStatModel extends SaveComponent<SavedStat> {
	amount: ReadonlySignal<number>
	derivedPreset: ReadonlySignal<string>
	setAmount(value: number): void
	applyPreset(k: string): void
	presetIter: ReadonlySignal<() => StatPresetGenerator>
}

export const StatModel = createModel<IStatModel, [SaveUpdateable, number, ReadonlySignal<StatPresetOptions>, StatPresetSorter]>((saver, initial, presetOptions, sorter) => {
	const amount = updaterSignal(saver, initial)
	const derivedPreset = computed(() => {
		const opts = presetOptions.value
		const v = amount.value
		for (const k of Object.keys(opts)) {
			if (opts[k] === v)
				return k
		}
		return ""
	})

	return {
		amount,
		derivedPreset,
		setAmount(v: number) {
			amount.value = v
		},
		applyPreset(k: string) {
			amount.value = presetOptions.value[k]
		},
		presetIter: computed(() => () => sorter(presetOptions.value)),
		_save: () => amount.value,
		_load: (d: SavedStat) => amount.value = d,
	}
})

export type SavedStatToggle = boolean
export interface IStatToggle extends SaveComponent<SavedStatToggle> {
	toggle: () => void
	active: ReadonlySignal<boolean>
	result: ReadonlySignal<number>
}

export const StatToggleModel = createModel<IStatToggle, [SaveUpdateable, number, number?, boolean?]>((saver, onResult, offResult = 0, start = true) => {
	const active = updaterSignal(saver, start)
	const result = computed(() => active.value ? onResult : offResult)

	return {
		toggle: () => active.value = !active.value,
		active,
		result,
		_save: () => active.value,
		_load: (d: SavedStatToggle) => active.value = d,
	}
})