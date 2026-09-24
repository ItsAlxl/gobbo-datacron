import { signal } from "@preact/signals"

const AUTOSAVE_DELAY = 1500

export type SaveData = string | number | boolean | SaveData[] | { [k: string]: SaveData }
export type SaveUpdateable = {
	ident: string
	triggerUpdate: () => void
	_internalUpdater: () => void
}
export type SaveTarget = SaveUpdateable & {
	saveToJson: () => SaveData
	loadFromJson: (data: SaveData) => void
	updatedAt?: number
}

export interface SaveComponent<T extends SaveData> {
	_save: () => T
	_load: (d: T) => void
}

const saveTargets: SaveTarget[] = []
let autosaveTimeout = -1

function queueAutosave() {
	if (autosaveTimeout >= 0)
		clearTimeout(autosaveTimeout)
	autosaveTimeout = setTimeout(applyUpdates, AUTOSAVE_DELAY)
}

function applyUpdates() {
	for (const s of saveTargets) {
		if (s.updatedAt)
			save(s)
	}
}

function save(s: SaveTarget) {
	s.updatedAt = undefined
	localStorage.setItem(s.ident, JSON.stringify(s.saveToJson()))
}

function markUpdate(s: SaveTarget) {
	s.updatedAt = Date.now()
	queueAutosave()
}

export function beginSaver(ident: string): SaveUpdateable {
	const t: SaveTarget = { ident: ident } as any
	t._internalUpdater = () => { }
	t.triggerUpdate = () => t._internalUpdater()
	return t
}

export function finishSaver(s: SaveUpdateable, save: () => SaveData, load: (s: SaveData) => void) {
	const f = s as SaveTarget
	f.saveToJson = save
	f.loadFromJson = load
	saveTargets.push(f)

	const initial = localStorage.getItem(s.ident)
	if (initial)
		f.loadFromJson(JSON.parse(initial))

	f._internalUpdater = () => markUpdate(f)
}

export function updaterSignal<T>(st: SaveUpdateable | SaveTarget, initial: T) {
	const sig = signal<T>(initial)
	sig.subscribe(st.triggerUpdate)
	return sig
}
