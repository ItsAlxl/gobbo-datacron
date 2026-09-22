import { html } from "htm/preact"
import { useCallback } from "preact/hooks"
import type { ComponentChildren } from "preact"

interface GenericSelectProps<T> {
	value: T
	setter: (v: T) => void
	c?: string
	children?: ComponentChildren
}

export function GenericSelect<T>({ value, setter, c = "", children }: GenericSelectProps<T>) {
	const onSelect = useCallback((e: InputEvent) => {
		setter((e.currentTarget as HTMLSelectElement).value as T)
	}, [setter])

	return html`
		<select class="select ${c}" onchange=${onSelect} value=${value}>
			${children}
		</select>
	`
}
