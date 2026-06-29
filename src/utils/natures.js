// Each nature boosts one stat by 1.1x and reduces another by 0.9x
export const NATURES = [
  { name: 'hardy',   boost: 'atk', reduce: 'atk' },  // neutral
  { name: 'lonely',  boost: 'atk', reduce: 'def' },
  { name: 'brave',   boost: 'atk', reduce: 'spe' },
  { name: 'adamant', boost: 'atk', reduce: 'spa' },
  { name: 'naughty', boost: 'atk', reduce: 'spd' },
  { name: 'bold',    boost: 'def', reduce: 'atk' },
  { name: 'docile',  boost: 'def', reduce: 'def' },  // neutral
  { name: 'relaxed', boost: 'def', reduce: 'spe' },
  { name: 'impish',  boost: 'def', reduce: 'spa' },
  { name: 'lax',     boost: 'def', reduce: 'spd' },
  { name: 'timid',   boost: 'spe', reduce: 'atk' },
  { name: 'hasty',   boost: 'spe', reduce: 'def' },
  { name: 'serious', boost: 'spe', reduce: 'spe' },  // neutral
  { name: 'jolly',   boost: 'spe', reduce: 'spa' },
  { name: 'naive',   boost: 'spe', reduce: 'spd' },
  { name: 'modest',  boost: 'spa', reduce: 'atk' },
  { name: 'mild',    boost: 'spa', reduce: 'def' },
  { name: 'quiet',   boost: 'spa', reduce: 'spe' },
  { name: 'bashful', boost: 'spa', reduce: 'spa' },  // neutral
  { name: 'rash',    boost: 'spa', reduce: 'spd' },
  { name: 'calm',    boost: 'spd', reduce: 'atk' },
  { name: 'gentle',  boost: 'spd', reduce: 'def' },
  { name: 'sassy',   boost: 'spd', reduce: 'spe' },
  { name: 'careful', boost: 'spd', reduce: 'spa' },
  { name: 'quirky',  boost: 'spd', reduce: 'spd' },  // neutral
]

export function isNeutral(nature) {
  return nature.boost === nature.reduce
}

export function getNatureMultiplier(nature, stat) {
  if (!nature || isNeutral(nature)) return 1
  if (nature.boost === stat)  return 1.1
  if (nature.reduce === stat) return 0.9
  return 1
}

// Group natures by what they boost, for display
export function getNaturesByBoost() {
  const groups = {}
  NATURES.forEach((n) => {
    if (!groups[n.boost]) groups[n.boost] = []
    groups[n.boost].push(n)
  })
  return groups
}