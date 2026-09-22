import { html } from "htm/preact"
import { LocalizedElement } from "../../../localize/preact"
import { type GearRecommendation, type IGearModel } from "../models/gear-model"
import { TargetStats } from "../sets"

export function Recommendation(props: { gear: IGearModel, rec: GearRecommendation, idx: number }) {
	const { gear, rec } = props
	const perGear = gear.getBudget("gear_tert").amount.value
	const perAug = gear.getBudget("aug_tert").amount.value
	const imps = gear.implantContributions.value

	return html`
		<div class="grid grid-cols-5 text-right p-2 ${props.idx === 0 ? "ring-2 ring-secondary" : ""}">
			<${LocalizedElement} class="font-semibold" tr="result_stat"/>
			<${LocalizedElement} class="font-semibold" tr="result_ngears"/>
			<${LocalizedElement} class="font-semibold" tr="result_naugs"/>
			<${LocalizedElement} class="font-semibold" tr="result_total"/>
			<${LocalizedElement} class="font-semibold" tr="result_overflow"/>
			${TargetStats.map(s => html`
				<${LocalizedElement} tr="stat_${s}"/>
				<span class="font-mono">${rec.gears[s]}</span>
				<span class="font-mono">${rec.augs[s]}</span>
				<span class="font-mono">${rec.gears[s] * perGear + rec.augs[s] * perAug + imps[s]}</span>
				<span class="font-mono">${s !== "crit" ? rec.overflows[s] : ""}</span>
			`)}
		</div>
	`
}
