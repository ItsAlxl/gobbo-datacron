import data from "./sets.json"

export const SetData = data as Record<GearBodySlotIdent, BodyGear> & {
	mainhand: MainhandGear
	offhand: OffhandGear
}

export const GearSlots = ["mainhand", "offhand", "head", "chest", "gloves", "boots", "pants"] as const
export const BodyGearSlots = GearSlots.filter(s => s !== "mainhand" && s !== "offhand")
export type GearSlotIdent = typeof GearSlots[number]
export type GearBodySlotIdent = Exclude<GearSlotIdent, "mainhand" | "offhand">

export const GearStats = ["acc", "alac", "crit", "abs", "shield"] as const
export type GearStatIdent = typeof GearStats[number]
export type BodyGear = Record<GearStatIdent, GearSetIdent[]>

export const MainhandStats = ["crit", "shield"] as const
export type MainhandStatIdent = typeof MainhandStats[number]
export type MainhandGear = Record<MainhandStatIdent, GearSetIdent[]>

export const OffhandStats = ["alac", "abs"] as const
export type OffhandStatIdent = typeof OffhandStats[number]
export type OffhandGear = Record<OffhandStatIdent, GearSetIdent[]>

export const GearSets = ["forcelord", "pummeler", "targeter", "boltblaster", "forcehealer", "medtech", "mender", "duelist", "bulwark", "demolisher"] as const
export type GearSetIdent = typeof GearSets[number]

export function getSlotSetsForStat(slot: GearSlotIdent, stat: GearStatIdent) {
	const s = SetData[slot]
	if (s.hasOwnProperty(stat))
		return (s as any)[stat] as GearSetIdent[]
	return []
}

export function findStatForSlot(slot: GearSlotIdent, set: GearSetIdent) {
	let first = undefined
	for (const stat of Object.keys(SetData[slot])) {
		first = first || stat as GearStatIdent
		if (getSlotSetsForStat(slot, stat as GearStatIdent).includes(set))
			return stat as GearStatIdent
	}
	return first || "crit"
}