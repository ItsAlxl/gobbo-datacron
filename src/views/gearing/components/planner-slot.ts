import { html } from "htm/preact"
import { useCallback } from "preact/hooks"
import { GearStats, type GearSetIdent, type GearSlotIdent, type GearStatIdent } from "../sets"
import { LocalizedElement } from "../../../localize/preact"
import type { ISlotModel } from "../models/slot-model"
import { trText } from "../../../localize/localization"
import type { ReadonlySignal } from "@preact/signals"

function getSetsText(sets: GearSetIdent[]) {
	if (sets.length > 0) {
		return sets.map(s => trText("set_" + s)).sort().join(", ")
	}
	return trText("warn_no_sets")
}

export function SettedSlot(props: { ident: GearSlotIdent, slot: ISlotModel }) {
	const slot = props.slot

	const onStatSelected = useCallback((e: InputEvent) => {
		slot.setStat((e.currentTarget as HTMLSelectElement).value as GearStatIdent)
	}, [slot])

	return html`
		<fieldset class="fieldset">
			<${LocalizedElement} tag="legend" tr="slot_${props.ident}" class="fieldset-legend"/>
			<div class="flex flex-col gap-1">
				<select class="select grow" onchange=${onStatSelected} value=${slot.stat}>
					${GearStats.map(s => html`<${LocalizedElement} tag="option" value=${s} tr="generic_counted" ctx=${{ count: slot.getSetsForStat(s).length, text: trText("stat_" + s) }}/>`)}
				</select>
				<div>
					${getSetsText(slot.relevantSets.value)}
				</div>
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