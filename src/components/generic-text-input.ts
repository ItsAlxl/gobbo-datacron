import { html } from "htm/preact"
import { useCallback } from "preact/hooks"

interface GenericNumericProps {
	value: string
	setter: (v: string) => void
	class?: string
}

export function GenericTextInput(props: GenericNumericProps) {
	const setter = props.setter
	const onInput = useCallback((e: InputEvent) => {
		setter((e.currentTarget as HTMLInputElement).value)
	}, [setter])

	return html`<input class="input ${props.class ?? ""}" value=${props.value} oninput=${onInput} />`
}
