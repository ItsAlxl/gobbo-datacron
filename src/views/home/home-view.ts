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
		<div class="flex flex-row flex-wrap gap-8 text-lg grow">
			${ViewNames.filter(filterToHome).map(createViewButton)}
		</div>
		<div class="collapse collapse-arrow bg-base-200 border-neutral border">
			<input type="checkbox" />
			<${LocalizedElement} tr="faq_about_title" class="collapse-title font-semibold after:start-5 after:end-auto pe-4 ps-12"/>
			<${LocalizedElement} tr="faq_about_desc" class="collapse-content flex flex-col gap-2"/>
		</div>
	`
}