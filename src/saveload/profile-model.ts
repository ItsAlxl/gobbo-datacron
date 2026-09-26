import { computed, createModel, signal, type ReadonlySignal } from "@preact/signals"
import { trText } from "../localize/localization"
import { loadFromStorage, saveToStorage, type ProfiledSaveTarget } from "./saveload"

type SavedProfileMeta = [idx: string, title: string]
function getGroupIdent(category: string) {
	return "_p." + category
}

function getItemIdent(category: string, idx: string) {
	return getGroupIdent(category) + "@" + idx
}

function getFallbackTitle(category: string) {
	return trText("profile_new_" + category)
}

function loadGroupMeta(groupIdent: string): SavedProfileMeta[] {
	return JSON.parse(localStorage.getItem(groupIdent) ?? "[]")
}

function saveGroupMeta(groupIdent: string, idxs: SavedProfileMeta[]) {
	localStorage.setItem(groupIdent, JSON.stringify(idxs))
}

function incrementCategoryCount(category: string) {
	const groupIdent = getGroupIdent(category)

	const storedMeta = loadGroupMeta(groupIdent)
	const prevIdx = storedMeta.length === 0 ? -1 : parseInt(storedMeta[storedMeta.length - 1][0])
	const nextIdx = (prevIdx < Number.MAX_SAFE_INTEGER ? prevIdx + 1 : Number.MIN_SAFE_INTEGER).toString()
	storedMeta.push([nextIdx, getFallbackTitle(category)])
	saveGroupMeta(groupIdent, storedMeta)

	return nextIdx
}

function removeCategoryItem(category: string, index: number) {
	const groupIdent = getGroupIdent(category)

	const storedMeta = loadGroupMeta(groupIdent)
	storedMeta.splice(index, 1)
	saveGroupMeta(groupIdent, storedMeta)
}

function findGroupItem(items: SavedProfileMeta[], idx: string) {
	for (const item of items) {
		if (item[0] === idx)
			return item
	}
}

function renameGroupItem(category: string, idx: string, name: string) {
	const groupIdent = getGroupIdent(category)

	const storedMeta = loadGroupMeta(groupIdent)
	const item = findGroupItem(storedMeta, idx)
	if (item) {
		item[1] = name
		saveGroupMeta(groupIdent, storedMeta)
	}
}

export interface IProfiledModel {
	profileGroup: IProfileGroupModel
}

interface IProfileModel {
	getId(): string
	title: ReadonlySignal<string>
	setTitle(t: string): void
}

const ProfileModel = createModel<IProfileModel, [string, string?, string?]>((category, idx = undefined, initialTitle = undefined) => {
	idx ??= incrementCategoryCount(category)
	const title = signal(initialTitle ?? getFallbackTitle(category))
	return {
		getId: () => getItemIdent(category, idx),
		title,
		setTitle: (t: string) => {
			title.value = t
			renameGroupItem(category, idx, t)
		},
	}
})

export interface IProfileGroupModel {
	profiles: ReadonlySignal<IProfileModel[]>
	selected: ReadonlySignal<IProfileModel>
	selectedId: ReadonlySignal<string>
	selectProfile: (p: IProfileModel) => void
	selectProfileById: (idx: string) => void
	addProfile: () => void
	removeSelectedProfile: () => void
	isSingle: ReadonlySignal<boolean>
}

export const ProfileGroupModel = createModel<IProfileGroupModel, [ProfiledSaveTarget]>((saver) => {
	const category = saver.ident
	const initial: IProfileModel[] = []
	const loadedMeta = loadGroupMeta(getGroupIdent(category))
	if (loadedMeta.length > 0) {
		for (const meta of loadedMeta)
			initial.push(new ProfileModel(category, meta[0], meta[1]))
	} else {
		initial.push(new ProfileModel(category))
	}

	const profiles = signal(initial)
	const selected = signal<IProfileModel>(profiles.value[0])

	const selectProfile = (p: IProfileModel) => {
		if (p !== selected.value) {
			saveToStorage(saver)
			selected.value = p
			loadFromStorage(saver)
		}
	}

	const isSingle = computed(() => profiles.value.length === 1)
	return {
		profiles,
		selected,
		selectedId: computed(() => selected.value.getId()),
		selectProfile,
		selectProfileById: (id: string) => {
			for (const p of profiles.value) {
				if (p.getId() === id) {
					selectProfile(p)
					break
				}
			}
		},
		addProfile: () => {
			const fresh = new ProfileModel(category)
			profiles.value = [...profiles.value, fresh]
			selectProfile(fresh)
		},
		removeSelectedProfile: () => {
			if (!isSingle.value) {
				const all = profiles.value
				const sel = selected.value

				const i = all.indexOf(sel)
				removeCategoryItem(category, i)

				const filtered = all.filter(p => p !== sel)
				profiles.value = filtered
				selectProfile(filtered[i === filtered.length ? i - 1 : i])
			}
		},
		isSingle
	}
})
