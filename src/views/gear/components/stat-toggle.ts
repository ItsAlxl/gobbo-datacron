import { html } from "htm/preact"
import { LocalizedElement } from "../../../localize/preact"
import type { IStatToggle } from "../models/stat-model"

export function StatToggle(props: { tr: string, toggle: IStatToggle }) {
	const toggle = props.toggle
	return html`
		<label class="flex flex-row cursor-pointer">
			<input type="checkbox" checked=${toggle.active} class="checkbox checkbox-primary" onclick=${toggle.toggle} />
			<${LocalizedElement} tr=${props.tr} class="pl-1"/>
		</label>
	`
}
