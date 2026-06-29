import { useState } from 'react'
import { TYPE_COLORS } from '../utils/typeColors'
import { GENERATIONS } from '../utils/generations'

const ALL_TYPES = Object.keys(TYPE_COLORS)

const REGIONAL_VARIANTS = [
  { id: 'alolan',   label: 'Alolan' },
  { id: 'galarian', label: 'Galarian' },
  { id: 'hisuian',  label: 'Hisuian' },
  { id: 'paldean',  label: 'Paldean' },
]

export default function FilterPanel({
  selectedTypes, selectedGens, selectedFormCategories,
  onTypesChange, onGensChange, onFormCategoriesChange
}) {
  const [open, setOpen] = useState(false)

  const activeCount = selectedTypes.length + selectedGens.length + selectedFormCategories.length

  function toggleType(type) {
    onTypesChange(selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type])
  }

  function toggleGen(genId) {
    onGensChange(selectedGens.includes(genId)
      ? selectedGens.filter((g) => g !== genId)
      : [...selectedGens, genId])
  }

  function toggleFormCategory(id) {
    onFormCategoriesChange(selectedFormCategories.includes(id)
      ? selectedFormCategories.filter((f) => f !== id)
      : [...selectedFormCategories, id])
  }

  function clearAll() {
    onTypesChange([])
    onGensChange([])
    onFormCategoriesChange([])
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 bg-gray-800 border border-gray-700 hover:border-gray-500 text-white text-sm px-4 py-2.5 rounded-xl transition-colors"
        >
          <span>{open ? '▲' : '▼'}</span>
          <span>Filters</span>
          {activeCount > 0 && (
            <span className="bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
        </button>
        {activeCount > 0 && (
          <button onClick={clearAll} className="text-gray-400 text-xs hover:text-white transition-colors">
            Clear all
          </button>
        )}
      </div>

      {open && (
        <div className="mt-3 bg-gray-800 border border-gray-700 rounded-2xl p-5 flex flex-col gap-5">

          {/* Form filters */}
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-3">Forms</p>
            <div className="flex flex-wrap gap-2">

              {/* One pill per region */}
              {REGIONAL_VARIANTS.map(({ id, label }) => {
                const active = selectedFormCategories.includes(id)
                return (
                  <button
                    key={id}
                    onClick={() => toggleFormCategory(id)}
                    className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all
                      ${active
                        ? 'bg-yellow-400 text-gray-900 border-transparent'
                        : 'bg-transparent text-gray-400 border-gray-600 hover:border-gray-400'
                      }`}
                  >
                    {label}
                  </button>
                )
              })}

              {/* Single alternate forms pill */}
              {(() => {
                const active = selectedFormCategories.includes('form')
                return (
                  <button
                    onClick={() => toggleFormCategory('form')}
                    className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all
                      ${active
                        ? 'bg-yellow-400 text-gray-900 border-transparent'
                        : 'bg-transparent text-gray-400 border-gray-600 hover:border-gray-400'
                      }`}
                  >
                    Alternate Forms
                  </button>
                )
              })()}

            </div>
          </div>

          {/* Type filter */}
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-3">Type</p>
            <div className="flex flex-wrap gap-2">
              {ALL_TYPES.map((type) => {
                const colors = TYPE_COLORS[type]
                const active = selectedTypes.includes(type)
                return (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    className={`capitalize text-xs font-semibold px-3 py-1 rounded-full border transition-all
                      ${active
                        ? `${colors.bg} ${colors.text} border-transparent`
                        : 'bg-transparent text-gray-400 border-gray-600 hover:border-gray-400'
                      }`}
                  >
                    {type}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Generation filter */}
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-3">Generation</p>
            <div className="flex flex-wrap gap-2">
              {GENERATIONS.map(({ label, id }) => {
                const active = selectedGens.includes(id)
                return (
                  <button
                    key={id}
                    onClick={() => toggleGen(id)}
                    className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all
                      ${active
                        ? 'bg-yellow-400 text-gray-900 border-transparent'
                        : 'bg-transparent text-gray-400 border-gray-600 hover:border-gray-400'
                      }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

        </div>
      )}
    </div>
  )
}