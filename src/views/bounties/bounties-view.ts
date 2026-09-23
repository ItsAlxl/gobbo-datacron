import { html } from "htm/preact"
import { LocalizedElement } from "../../localize/preact"
import { BountyTargets, BountyPlanets, isBountyOn, type BountyPlanetIdent, type BountyTargetIdent } from "./bounties"
import { BountiesModel } from "./bounties-model"

const bountiesModel = new BountiesModel()

function createPlanetHeader(p: BountyPlanetIdent) {
	return html`<${LocalizedElement} tr="bounty_planet_${p}" class="font-semibold"/>`
}

function createPlanetMarker(t: BountyTargetIdent, p: BountyPlanetIdent) {
	if (isBountyOn(t, p)) {
		const needs = bountiesModel.targets[t].numNeeds.value
		return html`
			<div class="badge ${needs === 2 ? "badge-success" : (needs === 1 ? "badge-warning" : "badge-neutral")}">
				<span class="iconify-[tabler--map-pin]"></span>
			</div>`
	}
	return html`<div></div>`
}

function createRow(t: BountyTargetIdent) {
	const targ = bountiesModel.targets[t]
	return html`
		<${LocalizedElement} tr="bounty_targ_${t}" class="justify-self-end"/>
		<input type="checkbox" checked=${targ.capped.value} class="checkbox" onclick=${targ.toggleCapped} />
		<input type="checkbox" checked=${targ.killed.value} class="checkbox" onclick=${targ.toggleKilled} />
		${BountyPlanets.map(p => createPlanetMarker(t, p))}
	`
}

function createRankings() {
	let bestScore = 0
	for (const p of BountyPlanets) {
		const s = bountiesModel.planetScores[p].value
		if (s > bestScore)
			bestScore = s
	}
	const bestScoreString = bestScore.toFixed(1)

	return BountyPlanets.map(p => {
		const s = bountiesModel.planetScores[p].value.toFixed(1)
		return html`
			<div class="p-2 ${s === "0.0" ? "text-error" : (s === bestScoreString ? "text-success ring-2 ring-success" : "text-warning")}">
				${s}
			</div>
		`
	})
}

export function BountyView() {
	return html`
		<div class="grid grid-cols-[repeat(3,auto)_repeat(6,1fr)] gap-3 place-items-center">
			${BountyTargets.map(createRow)}
			<div></div>
			<div class="iconify-[tabler--prison]"></div>
			<div class="iconify-[tabler--skull]"></div>
			${BountyPlanets.map(createPlanetHeader)}
			<${LocalizedElement} tr="bounty_score" class="justify-self-end col-span-3"/>
			${createRankings()}
		</div>
	`
}