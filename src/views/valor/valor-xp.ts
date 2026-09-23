import xps from "./valor-xp.json"

export const maxValorLevel = xps.length
export const maxValorXp = xps[maxValorLevel - 1]

export const aggregatedValorXp = new Array<number>(maxValorLevel)
aggregatedValorXp[0] = 0
for (let i = 1; i < maxValorLevel; i++) {
	aggregatedValorXp[i] = aggregatedValorXp[i - 1] + xps[i]
}