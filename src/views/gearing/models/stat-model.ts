import { signal, createModel, type ReadonlySignal, computed } from '@preact/signals'

export type StatPresetOptions = { [k: string]: number }
type StatPresetSorter = (p: StatPresetOptions) => StatPresetGenerator
type StatPresetGenerator = Generator<string, void, unknown>

export function* sortedPresetOptionsAsc(opts: StatPresetOptions) {
	yield* Object.keys(opts).sort((a, b) => opts[a] - opts[b])
}

export function* sortedPresetOptionsDesc(opts: StatPresetOptions) {
	yield* Object.keys(opts).sort((a, b) => opts[b] - opts[a])
}

export interface IStatModel {
	amount: ReadonlySignal<number>
	derivedPreset: ReadonlySignal<string>
	setAmount(value: number): void
	applyPreset(k: string): void
	presetIter: ReadonlySignal<() => StatPresetGenerator>
}

export const StatModel = createModel<IStatModel, [number, ReadonlySignal<StatPresetOptions>, StatPresetSorter]>((initial: number, presetOptions: ReadonlySignal<StatPresetOptions>, sorter: StatPresetSorter) => {
	const amount = signal(initial)
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
	}
})

export interface IStatToggle {
	toggle: () => void
	active: ReadonlySignal<boolean>
	result: ReadonlySignal<number>
}

export const StatToggleModel = createModel<IStatToggle, [number, number?, boolean?]>((onResult: number, offResult: number = 0, start = true) => {
	const active = signal(start)
	const result = computed(() => active.value ? onResult : offResult)

	return {
		toggle: () => active.value = !active.value,
		active,
		result,
	}
})