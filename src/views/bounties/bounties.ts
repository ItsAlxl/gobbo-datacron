import data from "./bounties.json"

export const BountyPlanets = Object.keys(data) as BountyPlanetIdent[]
export type BountyPlanetIdent = keyof typeof data

export const BountyTargets = ["aja", "d3x", "kar", "nov", "sog", "trb", "udo", "zin"] as const
export type BountyTargetIdent = typeof BountyTargets[number]

export function getBountyTargetsOn(p: BountyPlanetIdent): BountyTargetIdent[] {
	return data[p] as BountyTargetIdent[]
}

export function isBountyOn(t: BountyTargetIdent, p: BountyPlanetIdent) {
	return getBountyTargetsOn(p).includes(t)
}
