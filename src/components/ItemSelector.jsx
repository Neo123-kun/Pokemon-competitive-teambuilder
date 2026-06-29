import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useItemList } from '../hooks/usePokemon'

const BASE = 'https://pokeapi.co/api/v2'

function useItemDetail(itemName) {
  return useQuery({
    queryKey: ['item-detail', itemName],
    queryFn: async () => {
      const { data } = await axios.get(`${BASE}/item/${itemName}`)
      return data
    },
    enabled: !!itemName,
    staleTime: Infinity,
  })
}

function ItemIcon({ itemName, size = 'md' }) {
  const { data } = useItemDetail(itemName)
  const sprite = data?.sprites?.default
  const px = size === 'sm' ? 'w-6 h-6' : 'w-10 h-10'

  if (!sprite) return (
    <div className={`${px} bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 text-xs`}>?</div>
  )

  return <img src={sprite} alt={itemName} className={`${px} object-contain`} />
}

export default function ItemSelector({ selectedItem, onChange }) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const { data: allItems = [], isLoading } = useItemList()

  const filtered = useMemo(() =>
    allItems
      .filter((i) => i.includes(search.toLowerCase()))
      .slice(191, 304),
    [search, allItems]
  )

  function handleSelect(item) {
    onChange(item)
    setOpen(false)
    setSearch('')
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white font-semibold">Held Item</h3>
        {selectedItem && (
          <button onClick={() => onChange(null)} className="text-red-400 text-xs hover:text-red-300">✕ Remove</button>
        )}
      </div>

      {selectedItem ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ItemIcon itemName={selectedItem} size="md" />
            <p className="text-yellow-400 font-semibold capitalize">{selectedItem.replace(/-/g, ' ')}</p>
          </div>
          <button onClick={() => setOpen(!open)} className="text-gray-400 text-xs hover:text-white">Change</button>
        </div>
      ) : (
        <button onClick={() => setOpen(!open)} className="text-yellow-400 text-sm hover:underline">
          + Select item
        </button>
      )}

      {open && (
        <div className="mt-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isLoading ? 'Loading items...' : 'Search items...'}
            disabled={isLoading}
            className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-yellow-400"
          />
          <ul className="mt-2 max-h-56 overflow-y-auto flex flex-col gap-1">
            {filtered.map((item) => (
              <li
                key={item}
                onClick={() => handleSelect(item)}
                className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-gray-700 cursor-pointer"
              >
                <ItemIcon itemName={item} size="sm" />
                <span className="text-sm text-gray-200 capitalize">{item.replace(/-/g, ' ')}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}