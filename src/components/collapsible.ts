import { html } from "htm/preact"
import type { ComponentChildren } from "preact"
import { LocalizedElement } from "../localize/preact"

interface CollapsibleProps {
	tr: string
	class?: string
	children: ComponentChildren
}

export function Collapsible(props: CollapsibleProps) {
	return html`
		<div class="collapse collapse-arrow bg-base-200 border-neutral border ${props.class ?? ""}">
			<input type="checkbox" />
			<${LocalizedElement} tr=${props.tr} class="collapse-title font-semibold after:start-5 after:end-auto pe-4 ps-12"/>
			<div class="collapse-content flex flex-col gap-2">
				${props.children}
			</div>
		</div>
	`
}
