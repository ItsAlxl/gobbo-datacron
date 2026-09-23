import { html } from "htm/preact"
import { GearStats, type GearBodySlotIdent, type GearSlotIdent, type GearStatIdent } from "../sets"
import { LocalizedElement } from "../../../localize/preact"
import type { ISlotModel } from "../models/slot-model"
import { trText } from "../../../localize/localization"
import type { ReadonlySignal } from "@preact/signals"
import type { IGearModel } from "../models/gear-model"
import { GenericSelectInput } from "../../../components/generic-select-input"
import { GenericNumericInput } from "../../../components/generic-numeric-input"

function SetsList(gear: IGearModel, slot: ISlotModel) {
	const sets = slot.relevantSets.value
	if (sets.length > 0) {
		return html`<${LocalizedElement} tr=",[]" ctx=${{ ",items": sets.map(s => "%set_" + s), ",sort": true }}/>`
	}

	return html`
		<div class="flex flex-row items-center">
			<${GenericNumericInput} class="w-24" value=${gear.getSlotRating(slot)} min=0 setter=${slot.setRating}/>
			<${LocalizedElement} tr="noset_tert" ctx=${{ stat: trText("stat_" + slot.stat.value) }} class="pl-1"/>
		</div>
	`
}

export function SettedSlot(props: { gear: IGearModel, ident: GearSlotIdent, slot?: ISlotModel }) {
	const { gear, ident } = props
	const slot = props.slot ?? gear.getBodySlot(ident as GearBodySlotIdent)

	return html`
		<fieldset class="fieldset">
			<${LocalizedElement} tag="legend" tr="slot_${ident}" class="fieldset-legend"/>
			<div class="flex flex-col gap-1">
				<${GenericSelectInput<GearStatIdent>} class="grow" value=${slot.stat} setter=${slot.setStat}>
					${GearStats.map(s => html`<${LocalizedElement} tag="option" value=${s} tr="generic_counted" ctx=${{ count: slot.getSetsForStat(s).length, text: trText("stat_" + s) }}/>`)}
				<//>
				${SetsList(props.gear, slot)}
			</div>
		</fieldset>
	`
}

export function LoneSlot(props: { ident: string, stat: ReadonlySignal<GearStatIdent>, setter: (s: GearStatIdent) => void }) {
	return html`
		<fieldset class="fieldset">
			<${LocalizedElement} tag="legend" tr="slot_${props.ident}" class="fieldset-legend"/>
			<div class="flex flex-col gap-1">
				<${GenericSelectInput<GearStatIdent>} class="grow" value=${props.stat} setter=${props.setter}>
					${GearStats.map(s => html`<${LocalizedElement} tag="option" value=${s} tr="stat_${s}"/>`)}
				<//>
			</div>
		</fieldset>
	`
}