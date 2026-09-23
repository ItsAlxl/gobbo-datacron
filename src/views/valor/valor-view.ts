import { html } from "htm/preact"
import { signal } from "@preact/signals"
import { LocalizedElement } from "../../localize/preact"
import { GenericNumeric } from "../../components/generic-numeric"
import { aggregatedValorXp, maxValorLevel, maxValorXp } from "./valor-xp"

const currentLevel = signal(1)
const currentXp = signal(0)
const targetLevel = signal(100)
const targetXp = signal(0)

function setCurrentLevel(l: number) {
	currentLevel.value = l
}

function setCurrentXp(l: number) {
	currentXp.value = l
}

function setTargetLevel(l: number) {
	targetLevel.value = l
}

function setTargetXp(l: number) {
	targetXp.value = l
}

export function ValorView() {
	const currentTotal = aggregatedValorXp[currentLevel.value - 1] + currentXp.value
	const targetTotal = aggregatedValorXp[targetLevel.value - 1] + targetXp.value
	return html`
		<div class="grid grid-cols-[repeat(4,auto)] gap-3 place-items-center">
			<div></div>
			<${LocalizedElement} tr="valor_lvl"/>
			<${LocalizedElement} tr="valor_xp"/>
			<${LocalizedElement} tr="valor_total"/>
			<${LocalizedElement} tr="valor_current"/>
			<${GenericNumeric} value=${currentLevel} setter=${setCurrentLevel} min=1 max=${maxValorLevel}/>
			<${GenericNumeric} value=${currentXp} setter=${setCurrentXp} max=${maxValorXp}/>
			<div>${currentTotal}</div>
			<${LocalizedElement} tr="valor_target"/>
			<${GenericNumeric} value=${targetLevel} setter=${setTargetLevel} min=1 max=${maxValorLevel}/>
			<${GenericNumeric} value=${targetXp} setter=${setTargetXp} max=${maxValorXp}/>
			<div>${targetTotal}</div>
		</div>
		<div>
			${currentTotal}/${targetTotal} -> ${(targetTotal > 0 ? currentTotal / targetTotal * 100 : 0).toFixed(3)}%
		</div>
	`
}