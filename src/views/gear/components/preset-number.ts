import { html } from "htm/preact"
import type { VNode } from "preact"
import { LocalizedElement } from "../../../localize/preact"
import type { ThresholdStatIdent, IGearModel, StatBudgetIdent } from "../models/gear-model"
import type { IStatModel } from "../models/stat-model"
import { GenericSelect } from "../../../components/generic-select"
import { GenericNumeric } from "../../../components/generic-numeric"

const GCD_IDENT_PREFIX = "gcd_"
const GCD_IDENT_PREFIX_LENGTH = GCD_IDENT_PREFIX.length

function createPresetNumber(ident: string, stat: IStatModel, tr_pfx: string, tr_opt_pfx?: string) {
	const presetChoices: VNode[] = []
	for (const k of stat.presetIter.value()) {
		if (k.startsWith(GCD_IDENT_PREFIX))
			presetChoices.push(html`<${LocalizedElement} tag="option" tr="gcd_x" value=${k} ctx=${{ gcd: k.substring(GCD_IDENT_PREFIX_LENGTH) }}/>`)
		else
			presetChoices.push(html`<${LocalizedElement} tag="option" tr="preset_${tr_opt_pfx ?? ident}_${k}" value=${k}/>`)
	}

	return html`
		<fieldset class="fieldset">
			<${LocalizedElement} tag="legend" tr="${tr_pfx}_${ident}" class="fieldset-legend"/>
			<div class="flex flex-row gap-1">
				<${GenericSelect<string>} c="grow" value=${stat.derivedPreset} setter=${stat.applyPreset}>
					<${LocalizedElement} tag="option" tr="preset_none" value="" disabled/>
					${presetChoices}
				<//>
				<${GenericNumeric} c="w-24" value=${stat.amount} min=0 setter=${stat.setAmount}/>
			</div>
		</fieldset>
	`
}

export function Threshold(props: { ident: ThresholdStatIdent, gear: IGearModel }) {
	const ident = props.ident
	return createPresetNumber(ident, props.gear.getThreshold(ident), "stat")
}

export function Budget(props: { ident: StatBudgetIdent, gear: IGearModel }) {
	const ident = props.ident
	return createPresetNumber(ident, props.gear.getBudget(ident), "budget", "budget")
}
