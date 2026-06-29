// For each attacking type, which defending types does it hit for 2x, 0.5x, or 0x
export const TYPE_CHART = {
  normal:   { weak: ['rock', 'steel'], immune: ['ghost'] },
  fire:     { weak: ['fire', 'water', 'rock', 'dragon'], resist: ['grass', 'ice', 'bug', 'steel', 'fairy'] },
  water:    { weak: ['water', 'grass', 'dragon'], resist: ['fire', 'ground', 'rock'] },
  grass:    { weak: ['fire', 'grass', 'poison', 'flying', 'bug', 'dragon', 'steel'], resist: ['water', 'ground', 'rock'] },
  electric: { weak: ['grass', 'electric', 'dragon'], immune: ['ground'], resist: ['flying', 'steel'] },
  ice:      { weak: ['fire', 'water', 'ice', 'steel'], resist: ['grass', 'ground', 'flying', 'dragon'] },
  fighting: { weak: ['poison', 'flying', 'psychic', 'bug', 'fairy'], immune: ['ghost'], resist: ['rock', 'bug', 'dark'] },
  poison:   { weak: ['poison', 'ground', 'rock', 'ghost'], immune: ['steel'], resist: ['grass', 'fairy'] },
  ground:   { weak: ['grass', 'bug'], immune: ['flying'], resist: ['poison', 'rock'] },
  flying:   { weak: ['electric', 'rock', 'steel'], resist: ['grass', 'fighting', 'bug'] },
  psychic:  { weak: ['psychic', 'steel', 'dark'], immune: ['dark'], resist: ['fighting', 'psychic'] },
  bug:      { weak: ['fire', 'flying', 'rock'], resist: ['grass', 'fighting', 'ground'] },
  rock:     { weak: ['fighting', 'ground', 'steel', 'water', 'grass'], resist: ['normal', 'fire', 'poison', 'flying'] },
  ghost:    { weak: ['normal', 'dark'], immune: ['normal', 'fighting'], resist: ['poison', 'bug'] },
  dragon:   { weak: ['steel'], immune: ['fairy'], resist: ['fire', 'water', 'grass', 'electric'] },
  dark:     { weak: ['fighting', 'dark', 'fairy'], immune: ['psychic'], resist: ['ghost', 'dark'] },
  steel:    { weak: ['steel', 'fire', 'water', 'electric'], resist: ['normal', 'grass', 'ice', 'flying', 'psychic', 'bug', 'rock', 'dragon', 'steel', 'fairy'] },
  fairy:    { weak: ['fire', 'poison', 'steel'], resist: ['fighting', 'bug', 'dark'] },
}

export const ALL_TYPES = Object.keys(TYPE_CHART)

// Given a defending Pokemon's types, calculate its multiplier against each attacking type
export function getDefenseMultipliers(defenderTypes) {
  const multipliers = {}

  ALL_TYPES.forEach((attackType) => {
    let multiplier = 1
    const chart = TYPE_CHART[attackType]

    defenderTypes.forEach((defType) => {
      if (chart.immune?.includes(defType)) multiplier *= 0
      else if (chart.weak?.includes(defType)) multiplier *= 0.5
      else if (chart.resist?.includes(defType)) multiplier *= 2
    })

    multipliers[attackType] = multiplier
  })

  return multipliers
}

// Summarize the whole team's defensive weaknesses
export function getTeamWeaknesses(team) {
  const summary = {}

  ALL_TYPES.forEach((type) => { summary[type] = 0 })

  team.forEach((pokemon) => {
    const defTypes = pokemon.types.map((t) => t.type.name)
    const multipliers = getDefenseMultipliers(defTypes)

    ALL_TYPES.forEach((type) => {
      if (multipliers[type] > 1) summary[type] += multipliers[type]
    })
  })

  return summary
}