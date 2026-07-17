// ── STAT KEY MAPS ──────────────────────────────────────────────────────────
const EV_KEY_TO_SHOWDOWN = {
  hp: 'HP', atk: 'Atk', def: 'Def', spa: 'SpA', spd: 'SpD', spe: 'Spe',
}
const SHOWDOWN_TO_EV_KEY = Object.fromEntries(
  Object.entries(EV_KEY_TO_SHOWDOWN).map(([k, v]) => [v, k])
)

// ── SHOWDOWN EXPORT ────────────────────────────────────────────────────────
export function exportShowdown(team) {
  return team.map((pokemon) => {
    const build  = pokemon.build
    const name   = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)
    const form   = build.form
    // Showdown uses the form's display name appended e.g. "Charizard-Mega-X"
    const showdownName = form
      ? `${name}-${form.label.replace(/\s+/g, '-')}`
      : name

    const lines = []

    // Name + item
    if (build.item) {
      lines.push(`${showdownName} @ ${build.item
        .split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`)
    } else {
      lines.push(showdownName)
    }

    // Ability placeholder (not implemented yet)
    lines.push('Ability: (Unknown)')

    // Tera type
    if (build.tera) {
      lines.push(`Tera Type: ${build.tera.charAt(0).toUpperCase() + build.tera.slice(1)}`)
    }

    // EVs — only show non-zero
    const evParts = Object.entries(build.evs)
      .filter(([, val]) => val > 0)
      .map(([key, val]) => `${val} ${EV_KEY_TO_SHOWDOWN[key]}`)
    if (evParts.length > 0) lines.push(`EVs: ${evParts.join(' / ')}`)

    // Nature
    if (build.nature) {
      lines.push(`${build.nature.name.charAt(0).toUpperCase() + build.nature.name.slice(1)} Nature`)
    }

    // IVs — only show non-31
    const ivParts = Object.entries(build.ivs)
      .filter(([, val]) => val !== 31)
      .map(([key, val]) => `${val} ${EV_KEY_TO_SHOWDOWN[key]}`)
    if (ivParts.length > 0) lines.push(`IVs: ${ivParts.join(' / ')}`)

    // Moves
    build.moves
      .filter(Boolean)
      .forEach((move) => {
        lines.push(`- ${move.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`)
      })

    return lines.join('\n')
  }).join('\n\n')
}

// ── SHOWDOWN IMPORT ────────────────────────────────────────────────────────
export function parseShowdown(text) {
  const blocks = text.trim().split(/\n\n+/)
  const team   = []

  blocks.forEach((block) => {
    const lines   = block.trim().split('\n')
    if (!lines.length) return

    // First line: "Name @ Item" or just "Name"
    const firstLine = lines[0]
    const [namePart, itemPart] = firstLine.split(' @ ')
    const rawName = namePart.trim().toLowerCase().replace(/\s+/g, '-')

    const build = {
      moves:  [null, null, null, null],
      item:   itemPart ? itemPart.trim().toLowerCase().replace(/\s+/g, '-') : null,
      form:   null,
      nature: null,
      tera:   null,
      evs:    { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
      ivs:    { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
    }

    let moveIndex = 0

    lines.slice(1).forEach((line) => {
      line = line.trim()

      if (line.startsWith('Tera Type:')) {
        build.tera = line.replace('Tera Type:', '').trim().toLowerCase()

      } else if (line.startsWith('EVs:')) {
        line.replace('EVs:', '').trim().split('/').forEach((part) => {
          const [val, key] = part.trim().split(' ')
          const storeKey   = SHOWDOWN_TO_EV_KEY[key]
          if (storeKey) build.evs[storeKey] = parseInt(val)
        })

      } else if (line.startsWith('IVs:')) {
        line.replace('IVs:', '').trim().split('/').forEach((part) => {
          const [val, key] = part.trim().split(' ')
          const storeKey   = SHOWDOWN_TO_EV_KEY[key]
          if (storeKey) build.ivs[storeKey] = parseInt(val)
        })

      } else if (line.endsWith('Nature')) {
        const natureName = line.replace('Nature', '').trim().toLowerCase()
        build.nature     = { name: natureName }

      } else if (line.startsWith('- ')) {
        if (moveIndex < 4) {
          build.moves[moveIndex++] = line.slice(2).toLowerCase().replace(/\s+/g, '-')
        }
      }
    })

    team.push({ name: rawName, build })
  })

  return team
}

// ── JSON EXPORT ────────────────────────────────────────────────────────────
export function exportJSON(team) {
  const exportData = team.map((pokemon) => ({
    name:      pokemon.name,
    id:        pokemon.id,
    fetchName: pokemon.fetchName,
    build:     {
      form:   pokemon.build.form
        ? { type: pokemon.build.form.type, label: pokemon.build.form.label, apiName: pokemon.build.form.apiName }
        : null,
      item:   pokemon.build.item,
      nature: pokemon.build.nature,
      tera:   pokemon.build.tera,
      evs:    pokemon.build.evs,
      ivs:    pokemon.build.ivs,
      moves:  pokemon.build.moves,
    },
  }))

  return JSON.stringify(exportData, null, 2)
}

// ── JSON IMPORT ────────────────────────────────────────────────────────────
export function parseJSON(text) {
  try {
    const data = JSON.parse(text)
    if (!Array.isArray(data)) throw new Error('Invalid format')
    return data
  } catch {
    throw new Error('Invalid JSON — make sure you paste the full exported code.')
  }
}

// ── DOWNLOAD HELPER ────────────────────────────────────────────────────────
export function downloadText(content, filename) {
  const blob = new Blob([content], { type: 'text/plain' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}