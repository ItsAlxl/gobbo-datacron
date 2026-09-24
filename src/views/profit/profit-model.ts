import { createModel, type ReadonlySignal, computed } from '@preact/signals'
import { trText } from "../../localize/localization"
import { beginSaver, finishProfiledSaver, updaterSignal, type ProfiledSaveTarget, type SaveComponent, type SaveUpdateable } from "../../saveload/saveload"
import initialCosts from "./fragment-costs.json"
import type { IProfiledModel } from "../../saveload/profile-model"

export const MONEY_FORMAT_OPTIONS = { minimumFractionDigits: 2, maximumFractionDigits: 2 }

type SavedProfitItem = [string, number, number]
export interface IProfitItemModel extends SaveComponent<SavedProfitItem> {
	title: ReadonlySignal<string>
	setTitle: (t: string) => void
	fragCost: ReadonlySignal<number>
	setCost: (c: number) => void
	creditSale: ReadonlySignal<number>
	setSale: (s: number) => void
	credsPerFrag: ReadonlySignal<number>
	displayCpf: ReadonlySignal<string>
}

export const ProfitItemModel = createModel<IProfitItemModel, [SaveUpdateable, string, number, number?]>((saver, displayName, fCost, cSale = 0) => {
	const fragCost = updaterSignal(saver, fCost)
	const creditSale = updaterSignal(saver, cSale)
	const title = updaterSignal(saver, displayName)

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
				return credsPerFrag.value.toLocaleString(undefined, MONEY_FORMAT_OPTIONS)
			return ""
		}),
		_save: () => [title.value, fragCost.value, creditSale.value],
		_load: (d) => [title.value, fragCost.value, creditSale.value] = d
	}
})

export interface IProfitModel extends IProfiledModel {
	items: ReadonlySignal<IProfitItemModel[]>
	bestDeal: ReadonlySignal<IProfitItemModel | undefined>
	addItem: () => void
	removeItem: (r: IProfitItemModel) => void
}

export const ProfitModel = createModel<IProfitModel>(() => {
	const saver = beginSaver("profit")
	const items = updaterSignal<IProfitItemModel[]>(saver, [])

	finishProfiledSaver(
		saver as ProfiledSaveTarget,
		() => items.value.map(i => i._save()),
		(data) => {
			if (data) {
				const loaded: IProfitItemModel[] = []
				for (const item of data as SavedProfitItem[])
					loaded.push(new ProfitItemModel(saver, item[0], item[1], item[2]))
				items.value = loaded
			} else if (items.value.length === 0) {
				const initial: IProfitItemModel[] = []
				for (const item of Object.keys(initialCosts))
					initial.push(new ProfitItemModel(saver, trText("item_" + item), initialCosts[item as keyof typeof initialCosts]))
				items.value = initial
			}
		}
	)

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
		addItem: () => items.value = [...items.value, new ProfitItemModel(saver, trText("item_new"), 0)],
		removeItem: (r: IProfitItemModel) => items.value = items.value.filter(i => i !== r),
		profileGroup: (saver as ProfiledSaveTarget).profileGroupModel,
	}
})