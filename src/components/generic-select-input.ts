import { html } from "htm/preact"
import { useCallback } from "preact/hooks"
import type { ComponentChildren } from "preact"

interface GenericSelectProps<T> {
	value: T
	setter: (v: T) => void
	class?: string
	children?: ComponentChildren
}

export function GenericSelectInput<T>(props: GenericSelectProps<T>) {
	const setter = props.setter
	const onSelect = useCallback((e: InputEvent) => {
		setter((e.currentTarget as HTMLSelectElement).value as T)
	}, [setter])

	return html`
		<select class="select ${props.class ?? ""}" onchange=${onSelect} value=${props.value}>
			${props.children}
		</select>
	`
}
