import { html } from "htm/preact"
import type { VNode } from "preact"

export type ToastStyle = "btn-primary" | "btn-secondary" | "btn-success" | "btn-warning" | "btn-error"
export type ToastDetails = { onclick?: (e: InputEvent) => void, style?: ToastStyle }

type ToastRemovalCallback = () => void

export abstract class Toast<T extends ToastDetails = ToastDetails> {
	style: ToastStyle = "btn-primary"
	inner: string | VNode<{}> | VNode<{}>[] = ""
	onclick?: (e: InputEvent) => void
	cbRemove: ToastRemovalCallback
	timeout?: number

	constructor(details: T, cbRemove: ToastRemovalCallback) {
		this.cbRemove = () => {
			if (this.timeout) {
				clearTimeout(this.timeout)
			}
			cbRemove()
		}

		this.applyBase()
		this.update(details)
	}

	applyBase() {
		this.style = "btn-primary"
	}

	update(details: T) {
		this.applyDetails(details)
		this.style = details.style ?? this.style
		this.onclick = details.onclick ?? this.onclick

		if (this.timeout) {
			clearTimeout(this.timeout)
		}
		this.timeout = setTimeout(this.cbRemove, 5040)
	}

	abstract applyDetails(details: T): void

	display() {
		return html`
		<div class="flex flex-row">
			<button class="btn ${this.style} btn-md ${this.onclick ? "pointer-events-auto" : "pointer-events-none"}" onclick=${this.onclick}>
				${this.inner}
			</button>
			<button class="btn btn-md btn-square pointer-events-auto" onclick=${this.cbRemove}>
				<span class="iconify-[tabler--x]"></span>
			</button>
		</div>
		`
	}
}
