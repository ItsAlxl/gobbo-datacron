import { signal, createModel, type ReadonlySignal, computed } from '@preact/signals'
import initialCosts from "./fragment-costs.json"
import { trText } from "../../localize/localization"

export interface IProfitItemModel {
	title: ReadonlySignal<string>
	setTitle: (t: string) => void
	fragCost: ReadonlySignal<number>
	setCost: (c: number) => void
	creditSale: ReadonlySignal<number>
	setSale: (s: number) => void
	credsPerFrag: ReadonlySignal<number>
	displayCpf: ReadonlySignal<string>
}

export const ProfitItemModel = createModel<IProfitItemModel, [string, number]>((displayName: string, fCost: number) => {
	const fragCost = signal(fCost)
	const creditSale = signal(0)
	const title = signal(displayName)

	const credsPerFrag = computed(() => (creditSale.value / fragCost.value))
	return {
		title,
		setTitle: (t: string) => title.value = t,
		fragCost,
		setCost: (c: number) => fragCost.value = c,
		creditSale,
		setSale: (s: number) => creditSale.value = s,
		credsPerFrag,
		displayCpf: computed(() => {
			if (fragCost.value > 0 && creditSale.value > 0)
				return credsPerFrag.value.toLocaleString()
			return ""
		}),
	}
})

export interface IProfitModel {
	items: ReadonlySignal<IProfitItemModel[]>
	bestDeal: ReadonlySignal<IProfitItemModel | undefined>
	addItem: () => void
	removeItem: (r: IProfitItemModel) => void
}

export const ProfitModel = createModel<IProfitModel>(() => {
	const items = signal<IProfitItemModel[]>([])
	for (const item of Object.keys(initialCosts))
		items.value.push(new ProfitItemModel(trText("item_" + item), initialCosts[item as keyof typeof initialCosts]))

	return {
		items,
		bestDeal: computed(() => {
			let best: IProfitItemModel | undefined = undefined
			for (const i of items.value) {
				if (best ? i.credsPerFrag.value > best.credsPerFrag.value : i.credsPerFrag.value > 0)
					best = i
			}
			return best
		}),
		addItem: () => items.value = [...items.value, new ProfitItemModel(trText("item_new"), 0)],
		removeItem: (r: IProfitItemModel) => items.value = items.value.filter(i => i !== r),
	}
})