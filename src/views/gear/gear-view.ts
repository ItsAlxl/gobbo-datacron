import { html } from "htm/preact"
import { LocalizedElement } from "../../localize/preact"
import { GearModel, NUM_AUGS } from "./models/gear-model"
import { BodyGearSlots, GearStats, type TargetStatIdent } from "./sets"
import { Budget, Threshold } from "./components/preset-number"
import { Recommendation } from "./components/recommendation"
import { StatToggle } from "./components/stat-toggle"
import { LoneSlot, SettedSlot } from "./components/planner-slot"
import { PlannedAug } from "./components/planner-aug"
import { PlannerResult } from "./components/planner-result"
import { ProfileSelect } from "../../components/profile-select"

function selectImplant(e: InputEvent) {
	const elm = e.currentTarget as HTMLSelectElement
	const name = elm.name
	gear.getImplant(parseInt(name.charAt(name.length - 1))).value = elm.value as TargetStatIdent
}

function listRecommendations() {
	const recs = gear.gearRecommendations.value
	if (recs.length === 0)
		return LocalizedElement({ tr: "title_no_recs" })
	if (recs.length === 1)
		return Recommendation({ gear, rec: recs[0], idx: -1 })
	return gear.gearRecommendations.value.map((rec, idx) => Recommendation({ gear, rec, idx }))
}

const gear = new GearModel()
export function GearView() {
	return html`
		<${ProfileSelect} class="self-start" profileGroup=${gear.profileGroup}/>
		<${LocalizedElement} tr="title_gear_calculator" class="font-bold text-xl pb-4"/>
		<div class="grid grid-cols-3 gap-8">
			<div class="flex flex-col">
				<${LocalizedElement} tr="title_stat_budget" class="font-bold"/>
				<${Budget} ident="gear_tert" gear=${gear}/>
				<${Budget} ident="imp_tert" gear=${gear}/>
				<${Budget} ident="aug_tert" gear=${gear}/>
			</div>
			<div class="flex flex-col">
				<${LocalizedElement} tr="title_stat_targets" class="font-bold"/>
				<${Threshold} ident="acc" gear=${gear}/>
				<${StatToggle} tr="cbox_acc_bonus" toggle=${gear.accBonusToggle}/>
				<${Threshold} ident="alac_bonus" gear=${gear}/>
				<${Threshold} ident="alac" gear=${gear}/>
				<${StatToggle} tr="cbox_alac_buffer" toggle=${gear.alacBufferToggle}/>
				<fieldset class="fieldset">
					<${LocalizedElement} tag="legend" tr="gear_implants" class="fieldset-legend"/>
					<div class="flex flex-row gap-2">
						${[0, 1].map(idx => html`
							<select class="select" onchange=${selectImplant} name="implant${idx}" value=${gear.getImplant(idx).value}>
								${GearStats.map(s => html`<${LocalizedElement} tag="option" tr="stat_${s}" value=${s}/>`)}
							</select>
						`)}
					</div>
				</fieldset>
			</div>
			<div class="flex flex-col gap-2">
				<${LocalizedElement} tr="title_gear_recs" class="font-bold"/>
				<div class="flex flex-col gap-6">
					${listRecommendations()}
				</div>
			</div>
		</div>
		<div class="divider"></div>
		<${LocalizedElement} tr="title_gear_planner" class="font-bold text-xl pb-4"/>
		<div class="grid grid-cols-[2fr_1fr_2fr] self-stretch gap-8">
			<div class="grid grid-cols-2 gap-2">
				<${SettedSlot} ident="mainhand" gear=${gear} slot=${gear.mainhandSlot}/>
				<${SettedSlot} ident="offhand" gear=${gear} slot=${gear.offhandSlot}/>
				<div></div>
				${BodyGearSlots.map(s => html`<${SettedSlot} ident=${s} gear=${gear}/>`)}
				<${LoneSlot} ident="ear" stat=${gear.earStat} setter=${gear.setEarStat}/>
			</div>
			<div class="flex flex-col items-center gap-4">
				<div class="flex flex-row gap-2">
					<div class=${gear.totalPlannedAugs.value > NUM_AUGS ? "text-error" : undefined}>${gear.totalPlannedAugs}/${NUM_AUGS}</div>
					<${LocalizedElement} tr="plan_aug_total"/>
				</div>
				<div class="grid grid-cols-2 gap-4">
					${GearStats.map(s => PlannedAug({ gear: gear, stat: s }))}
				</div>
			</div>
			<${PlannerResult} gear=${gear}/>
		</div>
	`
}