export const GENERATIONS = [
  { label: 'Gen 1', id: 'gen1', range: [1, 151] },
  { label: 'Gen 2', id: 'gen2', range: [152, 251] },
  { label: 'Gen 3', id: 'gen3', range: [252, 386] },
  { label: 'Gen 4', id: 'gen4', range: [387, 493] },
  { label: 'Gen 5', id: 'gen5', range: [494, 649] },
  { label: 'Gen 6', id: 'gen6', range: [650, 721] },
  { label: 'Gen 7', id: 'gen7', range: [722, 809] },
  { label: 'Gen 8', id: 'gen8', range: [810, 905] },
  { label: 'Gen 9', id: 'gen9', range: [906, 1025] },
]

export function getGeneration(pokemonId) {
  return GENERATIONS.find(({ range }) => pokemonId >= range[0] && pokemonId <= range[1])?.id ?? null
}