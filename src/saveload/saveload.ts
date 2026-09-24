import { signal } from "@preact/signals"
import { ProfileGroupModel, type IProfileGroupModel } from "./profile-model"

const AUTOSAVE_DELAY = 1500

export type SaveData = string | number | boolean | SaveData[] | { [k: string]: SaveData }
export type SaveUpdateable = {
	ident: string
	getStorageKey: () => string
	triggerUpdate: () => void
	_internalUpdater: () => void
}
export type SaveTarget = SaveUpdateable & {
	saveToJson: () => SaveData
	loadFromJson: (data: SaveData | null) => void
	updatedAt?: number
}

export type ProfiledSaveTarget = SaveTarget & {
	profileGroupModel: IProfileGroupModel
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
			saveToStorage(s)
	}
}

export function saveToStorage(s: SaveTarget) {
	s.updatedAt = undefined
	localStorage.setItem(s.getStorageKey(), JSON.stringify(s.saveToJson()))
}

export function loadFromStorage(s: SaveTarget) {
	const stored = localStorage.getItem(s.getStorageKey())
	if (stored)
		s.loadFromJson(JSON.parse(stored))
	else
		s.loadFromJson(null)
}

function markUpdate(s: SaveTarget) {
	s.updatedAt = Date.now()
	queueAutosave()
}

export function beginSaver(ident: string): SaveUpdateable {
	const t: SaveUpdateable = {
		ident: ident,
		getStorageKey: () => ident,
		_internalUpdater: () => { },
		triggerUpdate: () => t._internalUpdater()
	}
	return t
}

export function finishProfiledSaver(s: ProfiledSaveTarget, saveJson: () => SaveData, loadJson: (s: SaveData | null) => void) {
	s.profileGroupModel = new ProfileGroupModel(s)
	s.getStorageKey = () => s.profileGroupModel.selected.value.getId()
	finishSaver(s, saveJson, loadJson)
}

export function finishSaver(s: SaveTarget, saveJson: () => SaveData, loadJson: (s: SaveData | null) => void) {
	s.saveToJson = saveJson
	s.loadFromJson = loadJson

	saveTargets.push(s)
	loadFromStorage(s)

	s._internalUpdater = () => markUpdate(s)
}

export function updaterSignal<T>(st: SaveUpdateable | SaveTarget, initial: T) {
	const sig = signal<T>(initial)
	sig.subscribe(st.triggerUpdate)
	return sig
}
