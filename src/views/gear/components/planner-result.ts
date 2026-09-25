import { html } from "htm/preact"
import { computed, type Signal } from "@preact/signals"
import { LocalizedElement } from "../../../localize/preact"
import type { IGearModel } from "../models/gear-model"
import { TargetStats, type GearStatIdent, type TargetStatIdent } from "../sets"

function StatReadout(s: GearStatIdent, rating: number, extra: number | string | Signal<number | string> | undefined = undefined, extraClass = "") {
	return html`
		<${LocalizedElement} tr="stat_${s}"/>
		<span class="font-mono">${rating}</span>
		<span class="font-mono ${extraClass}">${extra ?? ""}</span>
	`
}

function TargetStatReadout(gear: IGearModel, s: TargetStatIdent) {
	const rating = gear.plannedStats.value[s]
	const overflow = s === "crit" ? undefined : computed(() => rating - gear.getThreshold(s).amount.value)

	let overflowClass = ""
	if (overflow) {
		const over = overflow.value
		if (over < 0 || over >= gear.getBudget("gear_tert").amount.value)
			overflowClass = "text-error"
		else if (over >= gear.getBudget("aug_tert").amount.value)
			overflowClass = "text-warning"
	}

	return StatReadout(s, rating, overflow ? (overflow.value > 0 ? "+" + overflow : overflow) : undefined, overflowClass)
}

function formatRatio(r: number) {
	return Number.isNaN(r) ? undefined : (r.toFixed(1) + "%")
}

export function PlannerResult(props: { gear: IGearModel }) {
	const { gear } = props
	const stats = gear.plannedStats.value

	const ShieldRatio = computed(() => {
		const shield = stats.shield
		return 100.0 * (shield / (shield + stats.abs))
	})
	const AbsRatio = computed(() => 100.0 - ShieldRatio.value)

	return html`
		<div class="grid grid-cols-3 text-right p-2 content-start">
			<${LocalizedElement} class="font-semibold" tr="result_stat"/>
			<${LocalizedElement} class="font-semibold" tr="result_total"/>
			<div></div>
			${TargetStats.map(s => TargetStatReadout(gear, s))}
			${StatReadout("abs", stats.abs, formatRatio(AbsRatio.value))}
			${StatReadout("shield", stats.shield, formatRatio(ShieldRatio.value))}
		</div>
	`
}
