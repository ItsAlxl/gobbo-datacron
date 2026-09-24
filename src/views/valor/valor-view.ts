import { html } from "htm/preact"
import { LocalizedElement } from "../../localize/preact"
import { GenericNumericInput } from "../../components/generic-numeric-input"
import { aggregatedValorXp, maxValorLevel, maxValorXp } from "./valor-xp"
import { beginSaver, finishSaver, updaterSignal } from "../../saveload"

const saver = beginSaver("valor")

const currentLevel = updaterSignal(saver, 1)
const currentXp = updaterSignal(saver, 0)
const targetLevel = updaterSignal(saver, 100)
const targetXp = updaterSignal(saver, 0)

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

type SavedValor = [number, number, number, number]
finishSaver(
	saver,
	(): SavedValor => {
		return [currentLevel.value, currentXp.value, targetLevel.value, targetXp.value]
	},
	(d) => {
		[currentLevel.value, currentXp.value, targetLevel.value, targetXp.value] = d as SavedValor
	}
)

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
			<${GenericNumericInput} value=${currentLevel} setter=${setCurrentLevel} min=1 max=${maxValorLevel}/>
			<${GenericNumericInput} value=${currentXp} setter=${setCurrentXp} max=${maxValorXp}/>
			<div>${currentTotal}</div>
			<${LocalizedElement} tr="valor_target"/>
			<${GenericNumericInput} value=${targetLevel} setter=${setTargetLevel} min=1 max=${maxValorLevel}/>
			<${GenericNumericInput} value=${targetXp} setter=${setTargetXp} max=${maxValorXp}/>
			<div>${targetTotal}</div>
		</div>
		<div>
			${currentTotal}/${targetTotal} -> ${(targetTotal > 0 ? currentTotal / targetTotal * 100 : 0).toFixed(3)}%
		</div>
	`
}