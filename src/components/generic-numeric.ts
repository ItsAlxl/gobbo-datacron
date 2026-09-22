import { html } from "htm/preact"
import { useCallback } from "preact/hooks"

interface GenericNumericProps {
	min?: number
	max?: number
	value: number
	setter: (v: number) => void
	c?: string
	parser?: (s: string) => number
}

export function GenericNumeric({ value, setter, c = "", parser = parseInt, min = undefined, max = undefined }: GenericNumericProps) {
	const onNumberIn = useCallback((e: InputEvent) => {
		setter(parser((e.currentTarget as HTMLInputElement).value))
	}, [setter])

	return html`<input class="input ${c}" type="number" min=${min} max=${max} value=${value} oninput=${onNumberIn} />`
}
