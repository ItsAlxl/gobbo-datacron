import { html } from "htm/preact"
import { LocalizedElement } from "../../localize/preact"
import { ViewNames, Views, type ViewIdent } from "../../view-control"

function filterToHome(v: ViewIdent) {
	return Views[v].showInHome ?? true
}

function createViewButton(v: ViewIdent) {
	const data = Views[v]
	return html`
		<button class="btn grid grid-rows-2 w-32 h-32 p-4 items-stretch" onclick=${data.open}>
			<div class="w-12 h-12 m-auto">
				<span class="w-full h-full ${data.icon}"></span>
			</div>
			<${LocalizedElement} tr=${data.title} class="self-center"/>
		</button>
	`
}

export function HomeView() {
	return html`
		<div class="flex flex-row flex-wrap gap-8 text-lg">
			${ViewNames.filter(filterToHome).map(createViewButton)}
		</div>
	`
}