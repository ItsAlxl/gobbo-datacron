import { GearView } from "./views/gear/gear-view"
import type { VNode } from "preact"
import { computed, signal, type ReadonlySignal } from "@preact/signals"
import { HomeView } from "./views/home/home-view"
import { BountyView } from "./views/bounties/bounties-view"

const View = signal<ViewIdent>("home")
export const CurrentViewIdent: ReadonlySignal = View
export const CurrentViewData = computed(() => Views[View.value])
export function GoToView(v: ViewIdent) {
	View.value = v
}

export const ViewNames = ["home", "gear", "bounties"] as const
export type ViewIdent = typeof ViewNames[number]
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
}
Views.home.showInHome = false
