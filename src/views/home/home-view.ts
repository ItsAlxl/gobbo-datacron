import { html } from "htm/preact"
import { useEffect } from "preact/hooks"
import { LocalizedElement } from "../../localize/preact"
import { ViewNames, Views, type ViewIdent } from "../../systems/view-control"
import { Collapsible } from "../../components/collapsible"
import { signal } from "@preact/signals"
import { closeModal, showModal } from "../../systems/modal"
import { getExportText, importText } from "../../saveload/saveload"

const MB_SIZE = 1024 * 1024

function filterToHome(v: ViewIdent) {
	return Views[v].showInHome ?? true
}

function createViewButton(v: ViewIdent) {
	const data = Views[v]
	return html`
		<button class="btn grid grid-rows-2 w-32 h-32 p-4 items-stretch" onclick=${data.open}>
			<div class="w-12 h-12 m-auto">
				<span class="w-full h-full ${data.icon}"></span>
			</div>
			<${LocalizedElement} tr=${data.title} class="self-center"/>
		</button>
	`
}

function showExportModal() {
	showModal(
		"modal_export_title",
		() => html`
			<${LocalizedElement} tr="modal_export_desc"/>
			<textarea readonly spellcheck="false" class="textarea textarea-bordered bg-base-200 resize-none leading-snug w-full">
				${getExportText()}
			</textarea>
		`
	)
}

function showImportModal() {
	showModal(
		"modal_import_title",
		() => html`
			<${LocalizedElement} tr="modal_import_desc"/>
			<textarea id="tbox-import" spellcheck="false" class="textarea textarea-bordered bg-base-200 resize-none leading-snug w-full"></textarea>
		`,
		{
			tr: "modal_act_import",
			onclick: () => {
				importText((document.getElementById("tbox-import") as HTMLTextAreaElement).value)
				refreshStorageUsage()
				closeModal()
			}
		}
	)
}

function showWipeModal() {
	showModal(
		"modal_wipe_title",
		() => html`
			<${LocalizedElement} tr="modal_wipe_desc"/>
		`,
		{
			tr: "modal_act_confirm",
			style: "btn-error",
			onclick: () => {
				localStorage.clear()
				refreshStorageUsage()
				closeModal()
			}
		},
		"btn-primary"
	)
}

const storageUsage = {
	at: signal("??"),
	perc: signal("??")
}
function readEstimateMb(v: number | undefined) {
	return v ? (v / MB_SIZE).toFixed(2) + "MB" : "??"
}

function refreshStorageUsage() {
	navigator.storage.estimate().then(est => {
		storageUsage.at.value = readEstimateMb(est.usage)
		storageUsage.perc.value = est.usage && est.quota ? (est.usage / est.quota).toFixed(2) : "??"
	})
}

export function HomeView() {
	useEffect(refreshStorageUsage)

	return html`
		<div class="flex flex-row flex-wrap gap-8 text-lg grow">
			${ViewNames.filter(filterToHome).map(createViewButton)}
		</div>
		<div class="flex flex-col self-stretch">
			<${Collapsible} tr="faq_about_title">
				<${LocalizedElement} class="flex flex-col gap-2" tr="faq_about_desc"/>
			<//>
			<${Collapsible} tr="faq_storage_title">
				<${LocalizedElement} tr="faq_storage_preamble" ctx=${storageUsage}/>
				<div class="flex flex-row gap-2">
					<button class="btn btn-primary" onclick=${showExportModal}>
						<span class="iconify-[tabler--upload]"></span>
						<${LocalizedElement} tr="faq_storage_export"/>
					</button>
					<button class="btn btn-accent" onclick=${showImportModal}>
						<span class="iconify-[tabler--download]"></span>
						<${LocalizedElement} tr="faq_storage_import"/>
					</button>
					<button class="btn btn-outline btn-error" onclick=${showWipeModal}>
						<span class="iconify-[tabler--trash-x]"></span>
						<${LocalizedElement} tr="faq_storage_clear"/>
					</button>
				</div>
			<//>
		</div>
	`
}