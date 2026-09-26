import { html, render } from "htm/preact"
import { Toasts } from "./toasts/toasts"
import { CurrentViewData, CurrentViewIdent, GoToView } from "./systems/view-control"
import { Modal, modalElement } from "./systems/modal"
import { Nav } from "./systems/nav"
import { bakeLocaleOptions } from "./systems/locale-select"
import "./style.css"

function goHome() {
	GoToView("home")
}

function View() {
	const v = CurrentViewData.value
	if (v)
		return html`<${v.render}/>`

	return html`
		<h1 class="font-bold text-xl text-center">404</h1>
		<p>oops, I don't have a '${CurrentViewIdent}' view!</p>
		<button class="btn" onclick=${goHome}>
			<span class="iconify-[tabler--home]"></span>
		</button>
	`
}

function App() {
	return html`
		<div class="toast toast-top toast-end pointer-events-none items-end">
			<${Toasts}/>
		</div>
		<div class="grow flex flex-col items-center px-8 py-4 gap-4">
			<${View}/>
		</div>
	`
}

bakeLocaleOptions()
render(html`<${Nav}/>`, document.getElementById("nav-views")!)
render(html`<${App}/>`, document.getElementById("app")!)
render(html`<${Modal}/>`, modalElement)
