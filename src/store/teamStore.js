import { create } from 'zustand'
import axios from 'axios'

const DEFAULT_BUILD = {
  moves:  [null, null, null, null],
  item:   null,
  form:   null,
  nature: null,
  tera:   null,
  evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
  ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
}

export const useTeamStore = create((set) => ({
  team: [],

  addPokemon: (pokemon) =>
    set((state) => ({
      team: state.team.length < 6
        ? [...state.team, { ...pokemon, build: DEFAULT_BUILD }]
        : state.team,
    })),

  removePokemon: (id) =>
    set((state) => ({
      team: state.team.filter((p) => p.id !== id),
    })),

  updateBuild: (id, build) =>
    set((state) => ({
      team: state.team.map((p) =>
        p.id === id ? { ...p, build } : p
      ),
    })),

  randomizeTeam: async (allPokemon, queryClient) =>
    {
      const baseForms = allPokemon.filter((p) => p.formCategory === 'base')
      const shuffled  = [...baseForms].sort(() => Math.random() - 0.5)
      const picked    = shuffled.slice(0, 6)

      // Fetch full pokemon data for each picked entry
      const fullData = await Promise.all(
        picked.map(async (entry) => {
          const cached = queryClient.getQueryData(['pokemon', entry.name])
          if (cached) return cached
          const { data } = await axios.get(`https://pokeapi.co/api/v2/pokemon/${entry.fetchName}`)
          const result = { ...data, name: entry.name, fetchName: entry.fetchName, formLabel: null, formCategory: 'base' }
          queryClient.setQueryData(['pokemon', entry.name], result)
          return result
        })
      )

      set(() => ({
        team: fullData.map((p) => ({ ...p, build: DEFAULT_BUILD })),
      }))
    },

  clearTeam: () => set({ team: [] }),
}))