import { signal } from "@preact/signals"
import { html } from "htm/preact/index.js"
import type { VNode } from "preact"
import { LocalizedElement } from "../localize/preact"

export const modalElement = document.getElementById("modal") as HTMLDialogElement
const modalContent = signal<(() => VNode | VNode[]) | undefined>(undefined)
const modalActions = signal<VNode | VNode[] | undefined>(undefined)
const modalTitle = signal<string>("")
const modalCloseText = signal<string>("modal_act_close")
const modalCloseStyle = signal<string>("btn-primary")

export function closeModal() {
	modalElement.close()
}

type ModalActionData = { tr: string, style?: string, onclick?: (e: PointerEvent) => void }
function createModalAction(act: ModalActionData) {
	return html`<${LocalizedElement} tag="button" class="btn btn-outline ${act.style ?? "btn-primary"}" tr=${act.tr} onclick=${act.onclick ?? closeModal}/>`
}

export function showModal(title: string, m: () => VNode | VNode[], actions?: ModalActionData | ModalActionData[], closeStyle?: string) {
	modalTitle.value = title
	modalContent.value = m
	modalElement.show()

	let acts: VNode | VNode[] | undefined = undefined
	if (actions) {
		if (actions instanceof Array) {
			if (actions.length > 0)
				acts = actions.map(createModalAction)
			else
				acts = undefined
		} else {
			acts = createModalAction(actions)
		}
	} else {
		acts = undefined
	}

	modalActions.value = acts
	modalCloseText.value = acts ? "modal_act_cancel" : "modal_act_close"
	modalCloseStyle.value = closeStyle ?? (acts ? "btn-error" : "btn-primary")
}

export function Modal() {
	return html`
		<div id="modal" class="modal-box">
			<div class="flex flex-col gap-2">
				<${LocalizedElement} class="font-bold text-lg" tr=${modalTitle}/>
				<${modalContent.value}/>
			</div>
			<div class="modal-action">
				<${LocalizedElement} tag="button" class="btn btn-outline ${modalCloseStyle.value ?? ""}" tr=${modalCloseText} onclick=${closeModal}/>
				${modalActions}
			</div>
		</div>
		<form method="dialog" class="modal-backdrop">
			<${LocalizedElement} tag="button" class="cursor-default" tr=${modalCloseText}/>
		</form>
	`
}