import { getAllLocaleNames, getCurrentLocaleKey, setLocale } from "../localize/localization"

export function bakeLocaleOptions() {
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

}