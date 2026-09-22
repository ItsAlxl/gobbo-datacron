import { html } from "htm/preact"
import { signal } from "@preact/signals"
import type { ToastDetails, Toast } from "./base-toast"

const toastsById = new Map<string, Toast>()
const liveToasts = signal<Toast[]>([])
let areToastsAllowed = false

export function allowToasts(allow: boolean) {
	areToastsAllowed = allow
}

export function showToast<T extends Toast<D>, D extends ToastDetails>(ctor: new (details: D, cbRemove: () => void) => T, id: string, details: D) {
	if (!areToastsAllowed) {
		return
	}

	const toast = toastsById.get(id)
	if (toast) {
		toast.update(details)
	} else {
		toastsById.set(id, new ctor(details, () => removeToast(id)))
	}

	updateLiveList()
}

function removeToast(id: string) {
	if (toastsById.delete(id)) {
		updateLiveList()
	}
}

function updateLiveList() {
	const list: Toast[] = []
	for (const t of toastsById.values()) {
		list.push(t)
	}
	liveToasts.value = list
}

export function Toasts() {
	return html`
	${liveToasts.value.map(t => t.display())}
	`
}
