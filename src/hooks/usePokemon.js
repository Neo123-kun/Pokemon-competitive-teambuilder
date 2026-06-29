import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { getFormCandidates } from '../utils/pokemonForms'
import { useQueries } from '@tanstack/react-query' 
import { getFormDisplayLabel, getFormCategory, shouldSkipForm } from '../utils/formNames'

const BASE = 'https://pokeapi.co/api/v2'

export function usePokemonSearch(name) {
  return useQuery({
    queryKey: ['pokemon', name],
    queryFn: async () => {
      const { data } = await axios.get(`${BASE}/pokemon/${name.toLowerCase()}`)
      return data
    },
    enabled: !!name,
    retry: false,
  })
}

export function usePokemonList() {
  return useQuery({
    queryKey: ['pokemon-list'],
    queryFn: async () => {
      const { data } = await axios.get(`${BASE}/pokemon-species?limit=1025`)

      const speciesDetails = await Promise.all(
        data.results.map((s) => axios.get(s.url).then((r) => r.data))
      )

      const entries = []

      speciesDetails.forEach((species) => {
        const defaultVariety = species.varieties.find((v) => v.is_default)

        // Always add the base/default form
        entries.push({
          name:      species.name,
          fetchName: defaultVariety?.pokemon?.name ?? species.name,
          formLabel: null,
          formCategory: 'base',
          speciesName: species.name,
        })

        // Add non-default varieties as separate entries
        species.varieties
          .filter((v) => !v.is_default)
          .forEach((variety) => {
            const apiName = variety.pokemon.name
            if (shouldSkipForm(apiName)) return

            entries.push({
              name:         species.name,                                    // base species name for searching
              fetchName:    apiName,                                          // actual API name to fetch
              formLabel:    getFormDisplayLabel(species.name, apiName),      // e.g. "Alolan"
              formCategory: getFormCategory(species.name, apiName),          // 'regional' | 'form'
              speciesName:  species.name,
            })
          })
      })

      return entries
    },
    staleTime: Infinity,
  })
}

export function useMoveDetail(moveName) {
  return useQuery({
    queryKey: ['move', moveName],
    queryFn: async () => {
      const { data } = await axios.get(`${BASE}/move/${moveName}`)
      return data
    },
    enabled: !!moveName,
    staleTime: Infinity,
  })
}

export function useItemList() {
  return useQuery({
    queryKey: ['item-list'],
    queryFn: async () => {
      const { data } = await axios.get(`${BASE}/item?limit=2000`)
      return data.results.map((i) => i.name)
    },
    staleTime: Infinity,
  })
}

export function usePokemonIndex() {
  return useQuery({
    queryKey: ['pokemon-index'],
    queryFn: async () => {
      const allTypes = [
        'normal','fire','water','grass','electric','ice','fighting',
        'poison','ground','flying','psychic','bug','rock','ghost',
        'dragon','dark','steel','fairy'
      ]

      const [typeResults, genResults, speciesData] = await Promise.all([
        Promise.all(allTypes.map((t) => axios.get(`${BASE}/type/${t}`))),
        Promise.all([1,2,3,4,5,6,7,8,9].map((g) => axios.get(`${BASE}/generation/${g}`))),
        axios.get(`${BASE}/pokemon-species?limit=1025`).then(async (r) => {
          return Promise.all(r.data.results.map((s) => axios.get(s.url).then((d) => d.data)))
        }),
      ])

      // Build gen map from species — species name -> genId
      const genMap = {}
      genResults.forEach((res, i) => {
        const genId = `gen${i + 1}`
        res.data.pokemon_species.forEach(({ name }) => { genMap[name] = genId })
      })

      // Build fetch name -> species name map for ALL varieties
      const fetchNameToSpecies = {}
      speciesData.forEach((species) => {
        species.varieties.forEach((v) => {
          fetchNameToSpecies[v.pokemon.name] = species.name
        })
      })

      // Build type map keyed by fetchName
      const typesByFetchName = {}
      typeResults.forEach((res, i) => {
        const typeName = allTypes[i]
        res.data.pokemon.forEach(({ pokemon }) => {
          if (!typesByFetchName[pokemon.name]) typesByFetchName[pokemon.name] = []
          typesByFetchName[pokemon.name].push(typeName)
        })
      })

      // Each entry: { types, genId, speciesName }
      const index = {}

      speciesData.forEach((species) => {
        const genId = genMap[species.name] ?? null
        species.varieties.forEach((v) => {
          const fetchName = v.pokemon.name
          if (shouldSkipForm(fetchName)) return
          index[fetchName] = {
            types:       typesByFetchName[fetchName] ?? [],
            genId,
            speciesName: species.name,
          }
        })
      })

      return index
    },
    staleTime: Infinity,
  })
}

export function useAvailableForms(pokemonName, pokemonId) {
  const candidates = getFormCandidates(pokemonName, pokemonId)

  const results = useQueries({
    queries: candidates.map((candidate) => ({
      queryKey: ['pokemon-form-check', candidate.apiName],
      queryFn: async () => {
        try {
          const { data } = await axios.get(`${BASE}/pokemon/${candidate.apiName}`)
          return { ...candidate, data }
        } catch {
          return null
        }
      },
      staleTime: Infinity,
      retry: false,
    })),
  })

  const available = results
    .map((r) => r.data)
    .filter(Boolean)

  const isLoading = results.some((r) => r.isLoading)

  return { available, isLoading }
}

export function usePokemonSpecies(pokemonId) {
  return useQuery({
    queryKey: ['pokemon-species', pokemonId],
    queryFn: async () => {
      const { data } = await axios.get(`${BASE}/pokemon-species/${pokemonId}`)
      return data
    },
    enabled: !!pokemonId,
    staleTime: Infinity,
  })
}