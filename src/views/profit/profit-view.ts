import { html } from "htm/preact"
import { useCallback } from "preact/hooks"
import { GenericTextInput } from "../../components/generic-text-input"
import { ProfitModel, type IProfitItemModel } from "./profit-model"
import { GenericNumericInput } from "../../components/generic-numeric-input"
import { LocalizedElement } from "../../localize/preact"

const profitModel = new ProfitModel()

function createProfitItem(item: IProfitItemModel) {
	let diff = 0
	const best = profitModel.bestDeal.value
	if (best)
		diff = item.creditSale.value - best.credsPerFrag.value * item.fragCost.value
	const isBest = item.displayCpf.value !== "" && diff > -0.001

	const remove = useCallback(() => profitModel.removeItem(item), [item])

	return html`
		<button class="btn btn-square" onclick=${remove}>
			<span class="iconify-[tabler--x]"></span>
		</button>
		<${GenericTextInput} class="w-full" value=${item.title} setter=${item.setTitle}/>
		<${GenericNumericInput} value=${item.fragCost} setter=${item.setCost} min=0/>
		<${GenericNumericInput} value=${item.creditSale} setter=${item.setSale} min=0/>
		<div class="font-mono p-1 ${isBest ? "ring-2 ring-secondary" : ""}">${item.displayCpf}</div>
		<div class="font-mono">${diff.toLocaleString()}</div>
	`
}

export function ProfitView() {
	return html`
		<div class="grid grid-cols-[0.5fr_5fr_1fr_2fr_3fr_3fr] gap-3 justify-items-end items-center">
			<div></div>
			<${LocalizedElement} class="justify-self-center" tr="profit_title"/>
			<${LocalizedElement} class="justify-self-center" tr="profit_cost"/>
			<${LocalizedElement} class="justify-self-center" tr="profit_sale"/>
			<${LocalizedElement} tr="profit_cpf"/>
			<${LocalizedElement} tr="profit_compete"/>
			${profitModel.items.value.map(createProfitItem)}
		</div>
		<button class="btn btn-square mt-8" onclick=${profitModel.addItem}>
			<span class="iconify-[tabler--plus]"></span>
		</button>
	`
}