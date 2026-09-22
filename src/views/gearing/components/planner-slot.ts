import { html } from "htm/preact"
import { useCallback } from "preact/hooks"
import { GearStats, type GearBodySlotIdent, type GearSlotIdent, type GearStatIdent } from "../sets"
import { LocalizedElement } from "../../../localize/preact"
import type { ISlotModel } from "../models/slot-model"
import { trText } from "../../../localize/localization"
import type { ReadonlySignal } from "@preact/signals"
import type { IGearModel } from "../models/gear-model"

function SetsList(gear: IGearModel, slot: ISlotModel) {
	const sets = slot.relevantSets.value
	if (sets.length > 0) {
		return html`<div>${sets.map(s => trText("set_" + s)).sort().join(", ")}</div>`
	}

	const onRatingIn = useCallback((e: InputEvent) => {
		slot.setRating(parseInt((e.currentTarget as HTMLInputElement).value))
	}, [slot])

	const rating = slot.rating
	return html`
		<div class="flex flex-col items-center content-center">
			<${LocalizedElement} tr="noset_msg"/>
			<div class="flex flex-row items-center">
				<input class="input w-24" type="number" min="0" value=${rating.value < 0 ? gear.getBudget("gear_tert").amount : rating} oninput=${onRatingIn} />
				<${LocalizedElement} tr="noset_tert" ctx=${{ stat: trText("stat_" + slot.stat.value) }} class="pl-1"/>
			</div>
		</div>
	`
}

export function SettedSlot(props: { gear: IGearModel, ident: GearSlotIdent, slot?: ISlotModel }) {
	const { gear, ident } = props
	const slot = props.slot ?? gear.getBodySlot(ident as GearBodySlotIdent)

	const onStatSelected = useCallback((e: InputEvent) => {
		slot.setStat((e.currentTarget as HTMLSelectElement).value as GearStatIdent)
	}, [slot])

	return html`
		<fieldset class="fieldset">
			<${LocalizedElement} tag="legend" tr="slot_${ident}" class="fieldset-legend"/>
			<div class="flex flex-col gap-1">
				<select class="select grow" onchange=${onStatSelected} value=${slot.stat}>
					${GearStats.map(s => html`<${LocalizedElement} tag="option" value=${s} tr="generic_counted" ctx=${{ count: slot.getSetsForStat(s).length, text: trText("stat_" + s) }}/>`)}
				</select>
				${SetsList(props.gear, slot)}
			</div>
		</fieldset>
	`
}

export function LoneSlot(props: { ident: string, stat: ReadonlySignal<GearStatIdent>, setter: (s: GearStatIdent) => void }) {
	const setter = props.setter
	const onStatSelected = useCallback((e: InputEvent) => {
		setter((e.currentTarget as HTMLSelectElement).value as GearStatIdent)
	}, [setter])

	return html`
		<fieldset class="fieldset">
			<${LocalizedElement} tag="legend" tr="slot_${props.ident}" class="fieldset-legend"/>
			<div class="flex flex-col gap-1">
				<select class="select grow" onchange=${onStatSelected} value=${props.stat}>
					${GearStats.map(s => html`<${LocalizedElement} tag="option" value=${s} tr="stat_${s}"/>`)}
				</select>
			</div>
		</fieldset>
	`
}