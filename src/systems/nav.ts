import { html } from "htm/preact"
import { CurrentViewIdent, ViewNames, Views, type ViewIdent } from "./view-control"

function filterNavViews(v: ViewIdent) {
	return Views[v].showInNav ?? true
}

function createViewNavButton(v: ViewIdent) {
	const data = Views[v]
	return html`
		<button class="btn btn-square ${v === CurrentViewIdent.value ? "btn-disabled" : "btn-ghost"}" onclick=${data.open}>
			<span class=${data.icon}></span>
		</button>
	`
}

export function Nav() {
	return html`
		${ViewNames.filter(filterNavViews).map(createViewNavButton)}
	`
}
