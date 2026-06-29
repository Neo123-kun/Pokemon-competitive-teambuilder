import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useQueries } from '@tanstack/react-query'
import axios from 'axios'
import { usePokemonList, usePokemonIndex } from '../hooks/usePokemon'
import FilterPanel from './FilterPanel'
import PokemonCard from './PokemonCard'

const BASE = 'https://pokeapi.co/api/v2'
const PAGE_SIZE = 40

function PokemonCardSkeleton() {
  return (
    <div className="bg-gray-800 rounded-2xl flex flex-col items-center gap-2 p-4 border border-gray-700 animate-pulse">
      <div className="w-24 h-24 bg-gray-700 rounded-full" />
      <div className="h-3 w-20 bg-gray-700 rounded-full" />
      <div className="h-3 w-12 bg-gray-700 rounded-full" />
      <div className="h-6 w-24 bg-gray-700 rounded-full mt-1" />
    </div>
  )
}

export default function SearchBar({ onHover }) {
  const [query, setQuery]                         = useState('')
  const [selectedTypes, setSelectedTypes]         = useState([])
  const [selectedGens, setSelectedGens]           = useState([])
  const [selectedFormCategories, setSelectedFormCategories] = useState([])
  const [visibleCount, setVisibleCount]           = useState(PAGE_SIZE)

  const bottomRef = useRef(null)

  const { data: allPokemon = [] }                     = usePokemonList()
  const { data: index = {}, isLoading: indexLoading } = usePokemonIndex()

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [query, selectedTypes, selectedGens, selectedFormCategories])

  const filteredEntries = useMemo(() => {
    let list = allPokemon

    // Name search — match against species name
    if (query.length > 0) {
      list = list.filter((p) => p.name.startsWith(query.toLowerCase()))
    }

    // Form category filter
    if (selectedFormCategories.length > 0) {
      list = list.filter((p) => selectedFormCategories.includes(p.formCategory))
    }

    // Type filter
    if (selectedTypes.length > 0) {
      list = list.filter((p) => {
        const entry = index[p.fetchName]
        if (!entry) return false
        return selectedTypes.every((t) => entry.types.includes(t))
      })
    }

    // Generation filter
    if (selectedGens.length > 0) {
      list = list.filter((p) => {
        const entry = index[p.fetchName]
        if (!entry) return false
        return selectedGens.includes(entry.genId)
      })
    }

    return list
  }, [allPokemon, index, query, selectedTypes, selectedGens, selectedFormCategories])

  const toFetch   = filteredEntries.slice(0, visibleCount)
  const hasMore   = visibleCount < filteredEntries.length

  const handleIntersect = useCallback((entries) => {
    if (entries[0].isIntersecting && hasMore) {
      setVisibleCount((prev) => prev + PAGE_SIZE)
    }
  }, [hasMore])

  useEffect(() => {
    const sentinel = bottomRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(handleIntersect, { rootMargin: '200px' })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [handleIntersect])

  const results = useQueries({
    queries: toFetch.map((entry) => ({
      queryKey: ['pokemon', entry.fetchName],
      queryFn: async () => {
        const { data } = await axios.get(`${BASE}/pokemon/${entry.fetchName}`)
        return {
          ...data,
          name:         entry.name,
          fetchName:    entry.fetchName,
          formLabel:    entry.formLabel,
          formCategory: entry.formCategory,
        }
      },
      staleTime: Infinity,
    })),
  })

  const isIndexLoading = indexLoading && allPokemon.length === 0

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filter Pokémon by name..."
        className="w-full bg-gray-800 border border-gray-600 text-white rounded-xl px-4 py-2.5 outline-none focus:border-yellow-400 transition-colors text-sm"
      />

      <div className="w-full">
        <FilterPanel
          selectedTypes={selectedTypes}
          selectedGens={selectedGens}
          selectedFormCategories={selectedFormCategories}
          onTypesChange={setSelectedTypes}
          onGensChange={setSelectedGens}
          onFormCategoriesChange={setSelectedFormCategories}
        />
      </div>

      {(selectedTypes.length > 0 || selectedGens.length > 0 || selectedFormCategories.length > 0 || query.length > 0) && (
        <div className="w-full text-xs text-gray-400">
          <span className="text-white font-semibold">{filteredEntries.length}</span> Pokémon match
          {selectedTypes.length > 0 && (
            <span> · Type: <span className="text-yellow-400 capitalize">{selectedTypes.join(' + ')}</span></span>
          )}
          {selectedGens.length > 0 && (
            <span> · Gen: <span className="text-yellow-400">{selectedGens.join(', ')}</span></span>
          )}
          {selectedFormCategories.length > 0 && (
            <span> · Form: <span className="text-yellow-400 capitalize">{selectedFormCategories.join(', ')}</span></span>
          )}
          {filteredEntries.length > visibleCount && (
            <span className="text-gray-600"> · showing {visibleCount}</span>
          )}
        </div>
      )}

      {isIndexLoading ? (
        <div className="flex flex-col items-center gap-3 py-16 text-gray-400">
          <p className="text-sm">Building Pokémon index...</p>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-sm">No Pokémon match these filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
            {results.map((result, i) =>
              result.data
                ? <PokemonCard key={toFetch[i].fetchName} pokemon={result.data} onHover={onHover} />
                : <PokemonCardSkeleton key={toFetch[i].fetchName} />
            )}
          </div>

          <div ref={bottomRef} className="w-full py-4 flex justify-center">
            {hasMore ? (
              <p className="text-gray-600 text-xs">Loading more...</p>
            ) : filteredEntries.length > PAGE_SIZE ? (
              <p className="text-gray-700 text-xs">All {filteredEntries.length} entries loaded</p>
            ) : null}
          </div>
        </>
      )}
    </div>
  )
}