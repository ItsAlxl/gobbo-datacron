const AUTOSAVE_DELAY = 1500

export type SaveData = string | number | boolean | SaveData[] | { [k: string]: SaveData }
type BuildingSaveTarget = {
	ident: string
	triggerUpdate: () => void
	_internalUpdater: () => void
}
export type SaveTarget = {
	ident: string
	triggerUpdate: () => void
	_internalUpdater: () => void
	saveToJson: () => SaveData
	loadFromJson: (data: SaveData) => void
	updatedAt?: number
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
	console.log(s.ident, "saved")
	s.updatedAt = undefined
	localStorage.setItem(s.ident, JSON.stringify(s.saveToJson()))
}

function markUpdate(s: SaveTarget) {
	console.log(s.ident, "updated")
	s.updatedAt = Date.now()
	queueAutosave()
}

export function beginSaver(ident: string): BuildingSaveTarget {
	const t: SaveTarget = { ident: ident } as any
	t._internalUpdater = () => { }
	t.triggerUpdate = () => t._internalUpdater()
	return t
}

export function finishSaver(s: BuildingSaveTarget, save: () => SaveData, load: (s: SaveData) => void) {
	const f = s as SaveTarget
	f.saveToJson = save
	f.loadFromJson = load
	saveTargets.push(f)

	const initial = localStorage.getItem(s.ident)
	if (initial)
		f.loadFromJson(JSON.parse(initial))

	f._internalUpdater = () => markUpdate(f)
}
