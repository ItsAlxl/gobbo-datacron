import { html, render } from "htm/preact"
import { useCallback, useState } from "preact/hooks"
import { Toasts } from "./toasts/toasts"
import "./style.css"
import { GearingView } from "./views/gearing/gear-view"
import { getAllLocaleNames, getCurrentLocaleKey, setLocale } from "./localize/localization"


const versionLabel = document.getElementById("version-label")
const languageMenu = document.getElementById("language-menu")
const languageList = document.getElementById("language-list")

function createLocaleOption(key: string, name: string) {
	const li = document.createElement("li")

	const btn = document.createElement("button")
	if (getCurrentLocaleKey() == key)
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
	languageList?.replaceChildren(...getAllLocaleNames().map(loc => createLocaleOption(loc[0], loc[1])))
else
	languageMenu?.remove()

if (versionLabel)
	versionLabel.innerText = "v" + __APP_VERSION__


function CurrentView(props: { view: string, goHome: () => void }) {
	const viewIdent = props.view
	switch (viewIdent) {
		case "home":
			return GearingView()
	}
	return html`
		<h1 class="font-bold text-xl text-center">404</h1>
		<p>oops, I don't have a '${viewIdent}' view!</p>
		<button class="btn" onclick=${props.goHome}>
			<span class="iconify-[tabler--home]"></span>
		</button>
	`
}

function App() {
	const [view, setView] = useState("home")
	const goHome = useCallback(() => setView("home"), [])

	return html`
		<div class="toast toast-top toast-end pointer-events-none items-end">
			<${Toasts}/>
		</div>
		<div class="grow flex flex-col items-center px-8 py-4">
			<${CurrentView} view=${view} goHome=${goHome}/>
		</div>
	`
}

render(html`<${App}/>`, document.getElementById("app")!)
