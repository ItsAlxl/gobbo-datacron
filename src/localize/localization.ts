import localizationJson from "./localization.json"
import validLinks from "./links"

type Locale = { locale_name: string, [k: string]: string }
export type LinkIdent = keyof typeof validLinks
export type TranslatedTuple = { text: string, attributes?: Map<string, string> }
export type TranslatedParagraph = TranslatedTuple[]
type TranslateContextItem = string | number | boolean
export type TranslateContext = { [k: string]: TranslateContextItem | TranslateContextItem[] } | undefined

const rgxInterpolation = /{{\s*(?:%(\S+)\b|'([^}]+)'|(\S+)\b)([^}]*?)}}/g
const L10N = localizationJson as { [loc: string]: Locale }

const trListKey = ",[]"
const trDelimiterKey = ", "

const fallbackLocaleKey = "en"
let localeKey = ""
let onChangeCbs: (() => void)[] = []

export function configureLocalization() {
	setLocale(getStartingLocale())
}

function getStartingLocale() {
	if (navigator && navigator.languages) {
		getBestFitLocale(navigator.languages)
	}

	return "en"
}

export function getBestFitLocale(languages: readonly string[]) {
	for (const lang of languages) {
		if (L10N.hasOwnProperty(lang))
			return lang
	}

	for (const lang of languages) {
		const langSubtag = lang.split("-")[0]
		const matched = Object.keys(L10N).find(k => k.split("-")[0] === langSubtag)
		if (matched)
			return matched
	}

	return "en"
}

export function onLocaleChanged(cb: () => void) {
	onChangeCbs.push(cb)
}

export function setLocale(loc: string) {
	const previousLocale = localeKey
	localeKey = L10N.hasOwnProperty(loc) ? loc : fallbackLocaleKey

	if (previousLocale !== localeKey) {
		for (const elm of document.querySelectorAll("[data-loc-key]") as NodeListOf<HTMLElement>) {
			trIntoElement(elm)
		}
		for (const elm of document.querySelectorAll("[data-loc-tip]") as NodeListOf<HTMLElement>) {
			elm.title = trText(elm.dataset.locTip!)
		}

		for (const cb of onChangeCbs) {
			cb()
		}

		document.title = trText("project_title")
	}
}

export function getAllLocaleNames() {
	return Object.keys(L10N).map(loc => [loc, L10N[loc].locale_name])
}

export function getCurrentLocaleKey() {
	if (localeKey.length == 0) {
		setLocale(getStartingLocale())
	}
	return localeKey
}

function parseContextItem(ctx: TranslateContext, item: TranslateContextItem) {
	const text = item.toString()
	if (text.length > 1 && text.charAt(0) === "%") {
		const textRef = text.substring(1)
		if (textRef.charAt(0) === "%")
			return textRef
		return trText(textRef, ctx)
	}
	return text
}

function getContextString(ctx: TranslateContext, key: string) {
	const item = ctx ? ctx[key] : undefined
	if (item === undefined)
		return "<missing ctx: " + key + ">"

	if (item instanceof Array) {
		const trItems = item.map(i => parseContextItem(ctx, i))
		if (ctx && ctx[",sort"])
			trItems.sort()

		return trItems.join((ctx && ctx[", "]?.toString()) ?? trText(", "))
	}

	return parseContextItem(ctx, item)
}

function getLocalizedValue(key: string, locale: string) {
	if (key === trListKey)
		return "{{,items}}"

	let localization = L10N[locale]
	if (!localization.hasOwnProperty(key))
		localization = L10N[fallbackLocaleKey]

	if (!localization.hasOwnProperty(key)) {
		if (key === trDelimiterKey)
			return ", "
		return undefined
	}
	return localization[key]
}

function translate(key: string, locale: string, ctx: TranslateContext, inheritedAttrs: Map<string, string> | undefined = undefined) {
	const locVal = getLocalizedValue(key, locale)
	if (!locVal)
		return [[{ text: "<missing loc: " + key + ">" }]]

	const results: TranslatedParagraph[] = []
	const paragraphs = locVal.split("\n\n")

	for (const pg of paragraphs) {
		const paragraphResults: TranslatedParagraph = []
		const interps = [...pg.matchAll(rgxInterpolation)]

		if (interps.length > 0) {
			let cursor = 0
			for (const terp of interps) {
				const terpIdx = terp.index
				if (terpIdx > cursor) {
					paragraphResults.push({ text: pg.substring(cursor, terpIdx) })
				}
				const [terpWhole, terpRef, terpLiteral, terpContextual, terpAttrs] = terp
				cursor = terpIdx + terpWhole.length

				let tuple: TranslatedTuple = { text: "", attributes: inheritedAttrs }

				if (terpAttrs && terpAttrs.length > 0) {
					const attrMap = new Map<string, string>()
					for (const attr of terpAttrs.split(" ")) {
						if (attr.length > 0) {
							const attrKv = attr.split("=")
							if (attrKv.length == 2) {
								attrMap.set(attrKv[0], attrKv[1])
							} else {
								attrMap.set(attr, "true")
							}
						}
					}
					tuple.attributes = attrMap
				}

				if (terpRef) {
					for (const p of translate(terpRef, locale, ctx, tuple.attributes))
						paragraphResults.push(...p)
				} else {
					if (terpLiteral) {
						tuple.text = terpLiteral
					}

					if (terpContextual) {
						if (terpContextual.startsWith("link=")) {
							const linkSplit = terpContextual.split("=")
							if (!tuple.attributes) {
								tuple.attributes = new Map<string, string>()
							}
							tuple.attributes.set(linkSplit[0], linkSplit[1])
							tuple.text = getLinkUrl(linkSplit[1] as LinkIdent)
						} else {
							tuple.text = getContextString(ctx, terpContextual)
						}
					}

					paragraphResults.push(tuple)
				}
			}

			const pgEnd = pg.length
			if (pgEnd > cursor) {
				paragraphResults.push({ text: pg.substring(cursor, pgEnd), attributes: inheritedAttrs })
			}
		} else {
			paragraphResults.push({ text: pg, attributes: inheritedAttrs })
		}

		results.push(paragraphResults)
	}

	return results
}

export function trRaw(k: string, ctx: TranslateContext = undefined, locale: string | undefined = undefined) {
	return translate(k, locale ?? getCurrentLocaleKey(), ctx)
}

function rawToText(raw: TranslatedParagraph[]) {
	return raw.map(p => p.map(t => t.text).join("")).join("\n\n")
}

export function trText(k: string, ctx: TranslateContext = undefined, locale: string | undefined = undefined) {
	return rawToText(trRaw(k, ctx, locale))
}

export function getLinkUrl(link: LinkIdent) {
	return validLinks[link]
}

function tupleToElement(tuple: TranslatedTuple) {
	let element
	const attr = tuple.attributes
	const linkTarget = attr?.get("link") as LinkIdent
	if (linkTarget) {
		element = document.createElement("a") as HTMLAnchorElement
		element.classList.add("link")
		element.href = getLinkUrl(linkTarget)
	} else {
		element = document.createElement("span")
	}

	if (attr?.has("code"))
		element.classList.add("font-mono", "whitespace-nowrap")

	element.innerText = tuple.text
	return element
}

export function trHtml(k: string, ctx: TranslateContext = undefined, locale: string | undefined = undefined) {
	return trRaw(k, ctx, locale).map(p => {
		const div = document.createElement("div")
		div.replaceChildren(...p.map(tupleToElement))
		return div
	})
}

export function trIntoElement(element: HTMLElement, k: string | undefined = undefined, ctx: TranslateContext = undefined) {
	if (!k) {
		k = element.dataset.locKey ?? "missing_loc_attr"
	}
	if (!ctx) {
		const fromElement = element.dataset.locCtx
		if (fromElement)
			ctx = JSON.parse(fromElement)
	}
	element.replaceChildren(...trHtml(k, ctx))
}

export function setElementTrKey(element: HTMLElement, k: string) {
	element.dataset.locKey = k
	trIntoElement(element, k)
}
