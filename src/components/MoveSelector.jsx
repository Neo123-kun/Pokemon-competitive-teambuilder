import { useState } from 'react'
import { useMoveDetail } from '../hooks/usePokemon'

const CATEGORY_COLORS = {
  physical: 'bg-red-900 text-red-300',
  special:  'bg-blue-900 text-blue-300',
  status:   'bg-gray-700 text-gray-300',
}

const TYPE_COLORS = {
  fire:     'bg-orange-500',  water:    'bg-blue-500',
  grass:    'bg-green-500',   electric: 'bg-yellow-400',
  psychic:  'bg-pink-500',    ice:      'bg-cyan-400',
  dragon:   'bg-indigo-600',  dark:     'bg-gray-700',
  fairy:    'bg-pink-300',    fighting: 'bg-red-700',
  poison:   'bg-purple-500',  ground:   'bg-amber-600',
  rock:     'bg-stone-500',   bug:      'bg-lime-500',
  ghost:    'bg-violet-700',  steel:    'bg-slate-400',
  normal:   'bg-gray-400',    flying:   'bg-sky-400',
}

function MovePreviewPanel({ moveName }) {
  const { data, isLoading } = useMoveDetail(moveName)

  if (!moveName) return (
    <div className="flex items-center justify-center h-full min-h-48">
      <p className="text-gray-600 text-sm text-center">Hover a move<br />to preview it</p>
    </div>
  )

  if (isLoading) return (
    <div className="flex items-center justify-center h-full min-h-48">
      <p className="text-gray-500 text-sm animate-pulse">Loading...</p>
    </div>
  )

  if (!data) return null

  const category    = data.damage_class?.name ?? 'status'
  const power       = data.power     ?? '—'
  const accuracy    = data.accuracy  ?? '—'
  const pp          = data.pp        ?? '—'
  const type        = data.type?.name ?? '?'
  const effect      = data.effect_entries?.find((e) => e.language.name === 'en')
  const shortEffect = effect?.short_effect ?? '—'
  const formatEffect = (text) =>
    text?.replace(/\$effect_chance/g, data.effect_chance ?? '?') ?? ''

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h3 className="text-white font-bold text-lg capitalize">
          {moveName.replace(/-/g, ' ')}
        </h3>
        <div className="flex gap-2 mt-2 flex-wrap">
          <span className={`${TYPE_COLORS[type] ?? 'bg-gray-500'} text-white text-xs px-2.5 py-1 rounded-full capitalize font-semibold`}>
            {type}
          </span>
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${CATEGORY_COLORS[category]}`}>
            {category}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[['Power', power], ['Accuracy', accuracy], ['PP', pp]].map(([label, val]) => (
          <div key={label} className="bg-gray-900 rounded-xl p-3 text-center">
            <p className="text-gray-500 text-xs mb-1">{label}</p>
            <p className="text-white font-bold text-lg">{val}</p>
          </div>
        ))}
      </div>
      <div className="bg-gray-900 rounded-xl p-3">
        <p className="text-gray-300 text-xs leading-relaxed">
          {formatEffect(shortEffect)}
        </p>
      </div>
    </div>
  )
}

// Compact card shown for a selected move slot
function SelectedMoveCard({ moveName, slot, onClear, onChangePicker }) {
  const { data, isLoading } = useMoveDetail(moveName)

  const category    = data?.damage_class?.name ?? 'status'
  const power       = data?.power     ?? '—'
  const accuracy    = data?.accuracy  ?? '—'
  const pp          = data?.pp        ?? '—'
  const type        = data?.type?.name ?? '?'
  const effect      = data?.effect_entries?.find((e) => e.language.name === 'en')
  const shortEffect = effect?.short_effect ?? ''
  const formatEffect = (text) =>
    text?.replace(/\$effect_chance/g, data?.effect_chance ?? '?') ?? ''

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-3 flex flex-col gap-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-gray-500 text-xs font-semibold uppercase tracking-widest">
            Move {slot + 1}
          </span>
          <h4 className="text-white font-bold capitalize">
            {moveName.replace(/-/g, ' ')}
          </h4>
          {!isLoading && (
            <div className="flex gap-1">
              <span className={`${TYPE_COLORS[type] ?? 'bg-gray-500'} text-white text-xs px-2 py-0.5 rounded-full capitalize font-semibold`}>
                {type}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${CATEGORY_COLORS[category]}`}>
                {category}
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={onChangePicker}
            className="text-yellow-400 text-xs hover:underline"
          >
            Change
          </button>
          <button
            onClick={onClear}
            className="text-red-400 text-xs hover:text-red-300"
          >
            ✕
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-gray-500 text-xs animate-pulse">Loading...</p>
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            {[['Power', power], ['Accuracy', accuracy], ['PP', pp]].map(([label, val]) => (
              <div key={label} className="bg-gray-800 rounded-lg p-2 text-center">
                <p className="text-gray-500 text-xs">{label}</p>
                <p className="text-white font-semibold text-sm">{val}</p>
              </div>
            ))}
          </div>

          {/* Effect description */}
          {shortEffect && (
            <p className="text-gray-400 text-xs leading-relaxed">
              {formatEffect(shortEffect)}
            </p>
          )}
        </>
      )}
    </div>
  )
}

export default function MoveSelector({ availableMoves, selectedMoves, onChange }) {
  const [openSlot, setOpenSlot]       = useState(null)
  const [search, setSearch]           = useState('')
  const [hoveredMove, setHoveredMove] = useState(null)

  const filtered = availableMoves
    .filter((m) => m.move.name.includes(search.toLowerCase()))
    .slice(0, 50)

  function selectMove(slot, moveName) {
    const updated = [...selectedMoves]
    updated[slot] = moveName
    onChange(updated)
    setOpenSlot(null)
    setSearch('')
    setHoveredMove(null)
  }

  function clearMove(slot) {
    const updated = [...selectedMoves]
    updated[slot] = null
    onChange(updated)
    if (openSlot === slot) setOpenSlot(null)
  }

  function openPicker(slot) {
    setOpenSlot(openSlot === slot ? null : slot)
    setSearch('')
    setHoveredMove(null)
  }

  return (
    <div className="flex flex-col gap-3">
      {[0, 1, 2, 3].map((slot) => (
        <div key={slot}>
          {/* If move selected and picker is closed — show the full card */}
          {selectedMoves[slot] && openSlot !== slot ? (
            <SelectedMoveCard
              moveName={selectedMoves[slot]}
              slot={slot}
              onClear={() => clearMove(slot)}
              onChangePicker={() => openPicker(slot)}
            />
          ) : (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
              {/* Empty slot prompt */}
              {!selectedMoves[slot] && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-xs font-semibold uppercase tracking-widest">
                    Move {slot + 1}
                  </span>
                  <button
                    onClick={() => openPicker(slot)}
                    className="text-yellow-400 text-sm hover:underline"
                  >
                    + Select move
                  </button>
                </div>
              )}

              {/* Picker open */}
              {openSlot === slot && (
                <div className={`${selectedMoves[slot] ? '' : 'mt-3 border-t border-gray-700 pt-3'} grid grid-cols-2 gap-3`}>
                  {/* Left — list */}
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search moves..."
                      className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-yellow-400 transition-colors"
                      autoFocus
                    />
                    <ul className="max-h-64 overflow-y-auto flex flex-col gap-0.5">
                      {filtered.map(({ move }) => (
                        <li
                          key={move.name}
                          onClick={() => selectMove(slot, move.name)}
                          onMouseEnter={() => setHoveredMove(move.name)}
                          onMouseLeave={() => setHoveredMove(null)}
                          className={`text-sm capitalize px-3 py-2 rounded-lg cursor-pointer transition-colors
                            ${hoveredMove === move.name
                              ? 'bg-gray-600 text-white'
                              : selectedMoves[slot] === move.name
                                ? 'bg-yellow-400/20 text-yellow-400'
                                : 'text-gray-300 hover:bg-gray-700'
                            }`}
                        >
                          {move.name.replace(/-/g, ' ')}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Right — preview */}
                  <div className="bg-gray-900 rounded-xl border border-gray-700 min-h-48">
                    <MovePreviewPanel moveName={hoveredMove ?? selectedMoves[slot]} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}