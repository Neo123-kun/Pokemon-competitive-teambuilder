// Form types we support
export const FORM_TYPES = {
  MEGA:   'mega',
  GMAX:   'gmax',
  CROWNED:'crowned',  // Calyrex fused / "crystalized" forms
}

// Rayquaza is the only Mega that can hold an item,
// but only if it knows Dragon Ascent
export const RAYQUAZA_ID = 384
export const DRAGON_ASCENT = 'dragon-ascent'

// Given a base pokemon name, return available special forms
// by checking which variant names exist in PokeAPI
export function getFormCandidates(pokemonName, pokemonId) {
  const candidates = []

  // Mega forms — single mega
  candidates.push({
    type: FORM_TYPES.MEGA,
    label: 'Mega',
    apiName: `${pokemonName}-mega`,
  })

  // Some Pokemon have Mega X and Mega Y (Charizard, Mewtwo)
  candidates.push({
    type: FORM_TYPES.MEGA,
    label: 'Mega X',
    apiName: `${pokemonName}-mega-x`,
  })
  candidates.push({
    type: FORM_TYPES.MEGA,
    label: 'Mega Y',
    apiName: `${pokemonName}-mega-y`,
  })

  // Primal forms (Groudon, Kyogre) — treated like Mega
  candidates.push({
    type: FORM_TYPES.MEGA,
    label: 'Primal',
    apiName: `${pokemonName}-primal`,
  })

  // Gmax forms
  candidates.push({
    type: FORM_TYPES.GMAX,
    label: 'Gigantamax',
    apiName: `${pokemonName}-gmax`,
  })

  // Crowned / fused forms (Calyrex)
  candidates.push({
    type: FORM_TYPES.CROWNED,
    label: 'Ice Rider',
    apiName: `${pokemonName}-ice-rider`,
  })
  candidates.push({
    type: FORM_TYPES.CROWNED,
    label: 'Shadow Rider',
    apiName: `${pokemonName}-shadow-rider`,
  })

  return candidates
}

// Can this pokemon in this form hold an item?
export function canHoldItem(pokemonId, formType, selectedMoves) {
  if (!formType) return true  // base form — yes
  if (formType === FORM_TYPES.CROWNED) return false
  if (formType === FORM_TYPES.MEGA) {
    // Rayquaza exception — can hold item if it knows Dragon Ascent
    if (pokemonId === RAYQUAZA_ID) {
      return selectedMoves.includes(DRAGON_ASCENT)
    }
    return false  // all other megas cannot hold items
  }
  return true
}

export function getFormBadgeStyle(formType) {
  switch (formType) {
    case FORM_TYPES.MEGA:    return 'bg-purple-600 text-purple-100'
    case FORM_TYPES.GMAX:    return 'bg-red-600 text-red-100'
    case FORM_TYPES.CROWNED: return 'bg-cyan-600 text-cyan-100'
    default: return ''
  }
}

export function getFormLabel(formType, formLabel) {
  switch (formType) {
    case FORM_TYPES.MEGA:    return ` Mega — ${formLabel}`
    case FORM_TYPES.GMAX:    return ` Gigantamax`
    case FORM_TYPES.CROWNED: return ` Crowned — ${formLabel}`
    default: return 'Base form'
  }
}