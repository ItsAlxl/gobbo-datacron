import { GearView } from "./views/gear/gear-view"
import type { VNode } from "preact"
import { computed, signal, type ReadonlySignal } from "@preact/signals"
import { HomeView } from "./views/home/home-view"
import { BountyView } from "./views/bounties/bounties-view"
import { ValorView } from "./views/valor/valor-view"

export const ViewNames = ["home", "gear", "bounties", "valor"] as const
export type ViewIdent = typeof ViewNames[number]

const startingView = new URLSearchParams(window.location.search).get("v") as ViewIdent | null

const View = signal<ViewIdent>(startingView && ViewNames.includes(startingView) ? startingView : "home")
export const CurrentViewIdent: ReadonlySignal = View
export const CurrentViewData = computed(() => Views[View.value])
export function GoToView(v: ViewIdent) {
	View.value = v

	const url = new URL(window.location.href)
	url.searchParams.set("v", v)
	history.replaceState(null, "", url)
}

export type ViewData = {
	render: () => VNode | VNode[]
	icon: string
	title: string
	showInHome?: boolean
	showInNav?: boolean
	open: () => void
}

function createViewData(ident: ViewIdent, render: () => VNode | VNode[], icon: string) {
	return {
		render: render,
		open: () => GoToView(ident),
		title: "view_" + ident,
		icon: icon,
	}
}

export const Views: Record<ViewIdent, ViewData> = {
	home: createViewData("home", HomeView, "iconify-[tabler--home]"),
	gear: createViewData("gear", GearView, "iconify-[tabler--user-shield]"),
	bounties: createViewData("bounties", BountyView, "iconify-[tabler--viewfinder]"),
	valor: createViewData("valor", ValorView, "iconify-[tabler--swords]"),
}
Views.home.showInHome = false
