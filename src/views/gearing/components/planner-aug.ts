import { html } from "htm/preact"
import { LocalizedElement } from "../../../localize/preact"
import type { GearStatIdent } from "../sets"
import { GenericNumeric } from "../../../components/generic-numeric"
import { NUM_AUGS, type IGearModel } from "../models/gear-model"
import { useCallback } from "preact/hooks"

export function PlannedAug(props: { gear: IGearModel, stat: GearStatIdent }) {
	const { gear, stat } = props
	const setNumAugs = useCallback((n: number) => gear.setPlannedAug(stat, n), [stat])

	return html`
		<${LocalizedElement} class="flex items-center justify-end" tr="stat_${stat}"/>
		<${GenericNumeric} value=${gear.plannedAugs[stat]} min=0 max=${NUM_AUGS} setter=${setNumAugs}/>
	`
}