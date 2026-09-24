import { html, render } from "htm/preact"
import { Toasts } from "./toasts/toasts"
import { getAllLocaleNames, getCurrentLocaleKey, setLocale } from "./localize/localization"
import { CurrentViewData, CurrentViewIdent, GoToView, ViewNames, Views, type ViewIdent } from "./view-control"
import "./style.css"

const versionLabel = document.getElementById("version-label")
const languageMenu = document.getElementById("language-menu")
const languageList = document.getElementById("language-list")

function createLocaleOption(key: string, name: string) {
	const li = document.createElement("li")

	const btn = document.createElement("button")
	if (getCurrentLocaleKey() === key)
		btn.classList.add("menu-active")
	btn.classList.add("flex")

	const nameSpan = document.createElement("span")
	nameSpan.classList.add("grow")
	nameSpan.innerText = name
	btn.appendChild(nameSpan)

	const keySpan = document.createElement("span")
	keySpan.classList.add("pl-2", "font-mono", "font-bold", "opacity-60")
	keySpan.innerText = key
	btn.appendChild(keySpan)

	btn.addEventListener("click", function () {
		languageList?.querySelector(".menu-active")?.classList.remove("menu-active")
		btn.classList.add("menu-active")
		setLocale(key)
	})

	li.appendChild(btn)
	return li
}

const localOptions = getAllLocaleNames().map(loc => createLocaleOption(loc[0], loc[1]))
if (localOptions.length > 1)
	languageList?.replaceChildren(...localOptions)
else
	languageMenu?.remove()

if (versionLabel)
	versionLabel.innerText = "v" + __APP_VERSION__

function goHome() {
	GoToView("home")
}

function View() {
	const v = CurrentViewData.value
	if (v)
		return html`<${v.render}/>`

	return html`
		<h1 class="font-bold text-xl text-center">404</h1>
		<p>oops, I don't have a '${CurrentViewIdent.value}' view!</p>
		<button class="btn" onclick=${goHome}>
			<span class="iconify-[tabler--home]"></span>
		</button>
	`
}

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

function Nav() {
	return html`
		${ViewNames.filter(filterNavViews).map(createViewNavButton)}
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

render(html`<${Nav}/>`, document.getElementById("nav-views")!)
render(html`<${App}/>`, document.getElementById("app")!)
