const FORM_NAME_MAP = {
  // Regional
  'alola':   'Alolan',
  'galar':   'Galarian',
  'hisui':   'Hisuian',
  'paldea':  'Paldean',

  // Castform
  'sunny':  'Sunny',
  'rainy':  'Rainy',
  'snowy':  'Snowy',

  // Deoxys
  'attack':  'Attack',
  'defense': 'Defense',
  'speed':   'Speed',

  // Lycanroc
  'midday':   'Midday',
  'midnight': 'Midnight',
  'dusk':     'Dusk',

  // Rotom
  'heat':  'Heat',
  'wash':  'Wash',
  'frost': 'Frost',
  'fan':   'Fan',
  'mow':   'Mow',

  // Oricorio
  'baile':   'Baile',
  'pom-pom': 'Pom-Pom',
  'pau':     "Pa'u",
  'sensu':   'Sensu',

  // Toxtricity
  'amped':   'Amped',
  'low-key': 'Low Key',

  // Basculin
  'blue-striped':  'Blue Striped',
  'white-striped': 'White Striped',

  // Darmanitan
  'standard': 'Standard',
  'zen':      'Zen',

  // Meloetta
  'aria':      'Aria',
  'pirouette': 'Pirouette',

  // Kyurem
  'black': 'Black',
  'white': 'White',

  // Wormadam
  'plant': 'Plant',
  'sandy': 'Sandy',
  'trash': 'Trash',

  // Indeedee / Basculegion / Oinkologne
  'male':   'Male',
  'female': 'Female',

  // Urshifu
  'single-strike': 'Single Strike',
  'rapid-strike':  'Rapid Strike',

  // Calyrex
  'ice-rider':    'Ice Rider',
  'shadow-rider': 'Shadow Rider',

  // Giratina / Meowstic etc
  'altered':   'Altered',
  'origin':    'Origin',

  // Shaymin
  'land': 'Land',
  'sky':  'Sky',

  // Tornadus / Thundurus / Landorus / Enamorus
  'incarnate': 'Incarnate',
  'therian':   'Therian',

  // Hoopa
  'confined': 'Confined',
  'unbound':  'Unbound',

  // Zygarde
  'fifty':    '50%',
  'complete': 'Complete',
  'ten':      '10%',

  // Wishiwashi
  'solo':   'Solo',
  'school': 'School',

  // Necrozma
  'dusk-mane':  'Dusk Mane',
  'dawn-wings': 'Dawn Wings',
  'ultra':      'Ultra',

  // Cramorant
  'gulping': 'Gulping',
  'gorging': 'Gorging',

  // Morpeko
  'full-belly': 'Full Belly',
  'hangry':     'Hangry',

  // Eiscue
  'ice-face':   'Ice Face',
  'noice-face': 'Noice Face',

  // Pumpkaboo / Gourgeist
  'small':   'Small',
  'average': 'Average',
  'large':   'Large',
  'super':   'Super',

  // Flabebe / Florges / Floette
  'red':    'Red',
  'yellow': 'Yellow',
  'orange': 'Orange',
  'blue':   'Blue',

  // Minior
  'red-meteor':    'Red Meteor',
  'blue-meteor':   'Blue Meteor',
  'orange-meteor': 'Orange Meteor',
  'yellow-meteor': 'Yellow Meteor',
  'green-meteor':  'Green Meteor',
  'indigo-meteor': 'Indigo Meteor',
  'violet-meteor': 'Violet Meteor',

  // Maushold
  'family-of-three': 'Family of Three',
  'family-of-four':  'Family of Four',

  // Squawkabilly
  'green-plumage':  'Green Plumage',
  'blue-plumage':   'Blue Plumage',
  'yellow-plumage': 'Yellow Plumage',
  'white-plumage':  'White Plumage',

  // Dudunsparce
  'two-segment':   'Two Segment',
  'three-segment': 'Three Segment',

  // Tatsugiri
  'curly':    'Curly',
  'droopy':   'Droopy',
  'stretchy': 'Stretchy',

  // Palafin
  'zero': 'Zero',
  'hero': 'Hero',

  // Gimmighoul
  'roaming': 'Roaming',
  'chest':   'Chest',

  // Terapagos
  'terastal': 'Terastal',
  'stellar':  'Stellar',
}

export function getFormDisplayLabel(speciesName, formApiName) {
  const suffix = formApiName.replace(`${speciesName}-`, '')
  return FORM_NAME_MAP[suffix] ?? suffix.charAt(0).toUpperCase() + suffix.slice(1)
}

export function getFormCategory(speciesName, formApiName) {
  const suffix = formApiName.replace(`${speciesName}-`, '')
  if (suffix === 'alola')  return 'alolan'
  if (suffix === 'galar')  return 'galarian'
  if (suffix === 'hisui')  return 'hisuian'
  if (suffix === 'paldea') return 'paldean'
  return 'form'
}

export function shouldSkipForm(formApiName) {
  return (
    formApiName.includes('-mega')        ||
    formApiName.includes('-gmax')        ||
    formApiName.includes('-primal')      ||
    formApiName.includes('-eternamax')   ||
    formApiName.includes('-totem')       ||
    formApiName.includes('-original')    ||
    formApiName.includes('-starter')     ||
    formApiName.includes('-own-tempo')   ||
    formApiName.endsWith('-cosplay')     ||
    formApiName.endsWith('-cap')
  )
}