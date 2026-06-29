import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,    // never refetch what we already have
      gcTime: 1000 * 60 * 60, // keep cache for 1 hour
    },
  },
})

const BASE = 'https://pokeapi.co/api/v2'

// Kick off the species list fetch immediately on app load,
// before React even renders — so data is already arriving
// by the time SearchBar mounts and asks for it
async function prefetch() {
  try {
    const { data } = await axios.get(`${BASE}/pokemon-species?limit=1025`)
    const species  = await Promise.all(
      data.results.map((s) => axios.get(s.url).then((r) => r.data))
    )

    const list = species.map((s) => {
      const defaultVariety = s.varieties.find((v) => v.is_default)
      return {
        name:      s.name,
        fetchName: defaultVariety?.pokemon?.name ?? s.name,
      }
    })

    // Seed the cache so usePokemonList returns instantly
    queryClient.setQueryData(['pokemon-list'], list)

    // Pre-fetch the first 40 Pokémon in parallel
    const first40 = list.slice(0, 40)
    await Promise.all(
      first40.map(({ name, fetchName }) =>
        axios.get(`${BASE}/pokemon/${fetchName}`).then(({ data: d }) => {
          queryClient.setQueryData(['pokemon', name], { ...d, name })
        })
      )
    )
  } catch (e) {
    // Prefetch failing is fine — SearchBar will fetch normally as fallback
    console.warn('Prefetch failed:', e)
  }
}

prefetch()  // fire and forget — doesn't block render

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)