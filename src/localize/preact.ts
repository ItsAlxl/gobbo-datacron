import { html } from "htm/preact"
import { getLinkUrl, trRaw, type LinkIdent, type TranslateContext, type TranslatedTuple } from "./localization"

function tupleToVnode(tuple: TranslatedTuple) {
	const attr = tuple.attributes

	const codeAttrs = attr?.has("code") ? " font-mono whitespace-nowrap" : undefined
	const linkTarget = attr?.get("link") as LinkIdent

	if (linkTarget)
		return html`<a class="link${codeAttrs ?? ""}" href=${getLinkUrl(linkTarget)}>${tuple.text}</a>`
	return html`<span class=${codeAttrs}>${tuple.text}</span>`
}

export function trVnodes(k: string, ctx: TranslateContext = undefined, locale: string | undefined = undefined) {
	return trRaw(k, ctx, locale).map(p => html`<div>${p.map(tupleToVnode)}</div>`)
}

export function LocalizedElement(props: { tr: string, tag?: string, ctx?: TranslateContext, class?: string, value?: string, disabled?: boolean }) {
	const t = props.tag ?? "div"
	const tr = props.tr ?? "NO_KEY_PROVIDED"

	const ctx = props.ctx
	let ctxJson: string | undefined = undefined
	if (ctx) {
		ctxJson = JSON.stringify(ctx)
	}

	return html`
		<${t} data-loc-key=${tr} data-loc-ctx=${ctxJson} class=${props.class} value=${props.value} disabled=${props.disabled}>
			${trVnodes(tr, ctx)}
		</${t}>
	`
}
