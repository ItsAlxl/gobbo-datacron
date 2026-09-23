import { html } from "htm/preact"
import { useCallback } from "preact/hooks"

interface GenericNumericProps {
	min?: number
	max?: number
	value: number
	setter: (v: number) => void
	class?: string
	parser?: (s: string) => number
}

export function GenericNumericInput(props: GenericNumericProps) {
	const setter = props.setter
	const onNumberIn = useCallback((e: InputEvent) => {
		setter((props.parser ?? parseInt)((e.currentTarget as HTMLInputElement).value))
	}, [setter])

	return html`<input class="input ${props.class ?? ""}" type="number" min=${props.min} max=${props.max} value=${props.value} oninput=${onNumberIn} />`
}
