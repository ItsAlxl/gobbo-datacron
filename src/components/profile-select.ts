import { html } from "htm/preact"
import { useCallback, useEffect, useRef, useState } from "preact/hooks"
import type { IProfileGroupModel } from "../saveload/profile-model"
import type { VNode } from "preact"

interface ProfileSelectProps {
	profileGroup: IProfileGroupModel
	class?: string
}

export function ProfileSelect(props: ProfileSelectProps) {
	const group = props.profileGroup

	const renameTbox = useRef<HTMLInputElement>()
	const [editMode, setEditMode] = useState(false)
	const [needsFocus, setNeedsFocus] = useState(false)

	const onSelect = useCallback((e: InputEvent) => {
		group.selectProfileById((e.currentTarget as HTMLSelectElement).value)
	}, [group])

	useEffect(() => {
		if (needsFocus && renameTbox.current) {
			renameTbox.current.select()
			setNeedsFocus(false)
		}
	}, [editMode, setNeedsFocus])

	const startEdit = useCallback(() => {
		setEditMode(true)
		setNeedsFocus(true)
	}, [setEditMode, setNeedsFocus])

	const endEdit = useCallback(() => {
		setEditMode(false)
	}, [setEditMode])

	const applyEdit = useCallback(() => {
		const tbox = renameTbox.current
		if (tbox)
			group.selected.value.setTitle(tbox.value)
		endEdit()
	}, [group.selected.value, renameTbox.current])

	const addProfile = useCallback(() => group.addProfile(), [group])
	const removeProfile = useCallback(() => group.removeSelectedProfile(), [group])

	let internal: VNode
	if (editMode) {
		internal = html`
			<input class="input col-span-3 w-full" ref=${renameTbox} value=${group.selected.value.title} onchange=${applyEdit}/>
			<button class="btn btn-primary btn-square" onclick=${applyEdit}>
				<span class="iconify-[tabler--check]"></span>
			</button>
			<button class="btn btn-error btn-square" onclick=${endEdit}>
				<span class="iconify-[tabler--cancel]"></span>
			</button>
		`
	} else {
		internal = html`
			<button class="btn btn-neutral btn-square" onclick=${addProfile}>
				<span class="iconify-[tabler--plus]"></span>
			</button>
			<button class="btn btn-neutral btn-square" disabled=${group.isSingle} onclick=${removeProfile}>
				<span class="iconify-[tabler--trash-x]"></span>
			</button>
			<select class="select w-full}" onchange=${onSelect} value=${group.selectedId}>
				${group.profiles.value.map(p => html`<option value=${p.getId()}>${p.title}</option>`)}
			</select>
			<button class="btn btn-accent btn-square" onclick=${startEdit}>
				<span class="iconify-[tabler--pencil-minus]"></span>
			</button>
		`
	}

	return html`
		<div class="grid grid-cols-[1fr_1fr_8fr_1fr_1fr] gap-2 ${props.class ?? ""}">
			${internal}
		</div>
	`
}
