import { html } from "htm/preact"
import type { VNode } from "preact"
import { LocalizedElement } from "../../../localize/preact"
import type { ThresholdStatIdent, IGearModel, StatBudgetIdent } from "../models/gear-model"
import type { IStatModel } from "../models/stat-model"
import { GenericSelectInput } from "../../../components/generic-select-input"
import { GenericNumericInput } from "../../../components/generic-numeric-input"

const GCD_IDENT_PREFIX = "gcd_"
const GCD_IDENT_PREFIX_LENGTH = GCD_IDENT_PREFIX.length

function createPresetNumber(ident: string, stat: IStatModel, trPfx: string, trOptPfx: string | undefined = undefined, splitTr = false) {
	const presetChoices: VNode[] = []
	for (const k of stat.presetIter.value()) {
		if (k.startsWith(GCD_IDENT_PREFIX)) {
			presetChoices.push(html`<${LocalizedElement} tag="option" tr="gcd_x" value=${k} ctx=${{ gcd: k.substring(GCD_IDENT_PREFIX_LENGTH) }}/>`)
		} else {
			const trStart = "preset_" + (trOptPfx ?? ident) + "_"
			const splitAt = splitTr ? k.lastIndexOf("_") : -1
			if (splitAt >= 0) {
				const kName = k.substring(0, splitAt)
				const kRating = splitAt < k.length ? k.substring(splitAt + 1) : ""
				presetChoices.push(html`
					<${LocalizedElement} tag="option" tr="${trStart + kName}" value=${k} ctx=${{ rating: kRating }}/>
				`)
			}
			else {
				presetChoices.push(html`<${LocalizedElement} tag="option" tr="${trStart + k}" value=${k}/>`)
			}
		}
	}

	return html`
		<fieldset class="fieldset">
			<${LocalizedElement} tag="legend" tr="${trPfx}_${ident}" class="fieldset-legend"/>
			<div class="flex flex-row gap-1">
				<${GenericSelectInput<string>} class="grow" value=${stat.derivedPreset} setter=${stat.applyPreset}>
					<${LocalizedElement} tag="option" tr="preset_none" value="" disabled/>
					${presetChoices}
				<//>
				<${GenericNumericInput} class="w-24" value=${stat.amount} min=0 setter=${stat.setAmount}/>
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
	return createPresetNumber(ident, props.gear.getBudget(ident), "budget", "budget", true)
}
