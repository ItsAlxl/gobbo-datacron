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
import { Collapsible } from "../../components/collapsible"
import { GenericNumericInput } from "../../components/generic-numeric-input"
import { findCalcPerc, findCalcRating, setStatExpBase, setStatExpDenom, setStatPercLimit, statCalcFinderK, statCalcFinderPerc, statCalcFinderRating, statExpBase, statExpDenom, statPercLimit } from "./calc-config"

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

function createGearExplainer(type: string) {
	return html`
		<div>
			<${LocalizedElement} class="font-bold" tr="faq_gear_${type}_title"/>
			<${LocalizedElement} tr="faq_gear_${type}_desc"/>
		</div>
	`
}

const gear = new GearModel()
export function GearView() {
	return html`
		<div class="flex flex-col self-stretch">
			<${Collapsible} tr="faq_calc_config_title">
				<${LocalizedElement} tr="faq_calc_config_preamble" ctx=${{ ver: "7.9" }}/>
				<div class="flex flex-row items-center justify-center gap-8">
					<div class="flex flex-col gap-4 max-w-100">
						<div class="flex flex-row items-end justify-center">
							<${LocalizedElement} class="italic" tr="calc_name_percentage"/>
							<div class="whitespace-pre-wrap"> = </div>
							<${LocalizedElement} class="italic" tr="calc_name_limit"/>
							<div class="whitespace-pre-wrap"> * ( 1 - </div>
							<${LocalizedElement} class="italic" tr="calc_name_expbase"/>
							<div class="flex flex-row mb-3">
								<div class="whitespace-pre-wrap">( </div>
								<${LocalizedElement} class="italic" tr="calc_name_rating"/>
								<div class="whitespace-pre-wrap"> / </div>
								<${LocalizedElement} class="italic" tr="calc_name_expdenom"/>
								<div class="whitespace-pre-wrap"> )</div>
							</div>
							<div class="whitespace-pre-wrap"> )</div>
						</div>
						<div class="grid grid-cols-[repeat(2,auto)] gap-2 items-center grow">
							<${LocalizedElement} class="justify-self-end" tr="calc_name_limit"/>
							<${GenericNumericInput} step=${0.0001} value=${statPercLimit} setter=${setStatPercLimit} parser=${parseFloat}/>
							<${LocalizedElement} class="justify-self-end" tr="calc_name_expbase"/>
							<${GenericNumericInput} step=${0.0001} value=${statExpBase} setter=${setStatExpBase} parser=${parseFloat}/>
							<${LocalizedElement} class="justify-self-end" tr="calc_name_expdenom"/>
							<${GenericNumericInput} step=${0.0001} value=${statExpDenom} setter=${setStatExpDenom} parser=${parseFloat}/>
						</div>
					</div>
					<div class="divider divider-horizontal"></div>
					<div class="flex flex-col gap-4 max-w-100">
						<${LocalizedElement} class="text-center" tr="faq_calc_findk_preamble"/>
						<div class="flex flex-row gap-8">
							<div class="grid grid-cols-[repeat(2,auto)] gap-2 items-center grow">
								<${LocalizedElement} class="justify-self-end" tr="calc_name_rating"/>
								<${GenericNumericInput} step=${0.0001} value=${statCalcFinderRating} setter=${findCalcRating} parser=${parseFloat}/>
								<${LocalizedElement} class="justify-self-end" tr="calc_name_percentage"/>
								<${GenericNumericInput} step=${0.0001} value=${statCalcFinderPerc} setter=${findCalcPerc} parser=${parseFloat}/>
							</div>
							<div class="flex flex-row items-center">
								<${LocalizedElement} tr="calc_name_expdenom"/>
								<div class="whitespace-pre-wrap"> ≈ ${statCalcFinderK.value.toFixed(2)}</div>
							</div>
						</div>
					</div>
				</div>
			<//>
			<${Collapsible} tr="faq_gear_title">
				${createGearExplainer("acc")}
				${createGearExplainer("alac")}
				${createGearExplainer("crit")}
				${createGearExplainer("tank")}
			<//>
		</div>
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
							<select class="select" onchange=${selectImplant} name="implant${idx}" value=${gear.getImplant(idx)}>
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