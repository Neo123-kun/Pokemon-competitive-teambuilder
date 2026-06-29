import { useState } from 'react'
import { NATURES, isNeutral, getNaturesByBoost } from '../utils/natures'

const STAT_LABELS = {
  atk: 'Attack',
  def: 'Defense',
  spa: 'Sp. Atk',
  spd: 'Sp. Def',
  spe: 'Speed',
}

const BOOST_COLORS = {
  atk: 'text-red-400',
  def: 'text-yellow-400',
  spa: 'text-blue-400',
  spd: 'text-green-400',
  spe: 'text-pink-400',
}

export default function NatureSelector({ selectedNature, onChange }) {
  const [view, setView] = useState('grid')  // 'grid' | 'list'
  const groups = getNaturesByBoost()

  const stats = ['atk', 'def', 'spa', 'spd', 'spe']

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex flex-col gap-4">

      {/* Selected nature summary */}
      <div className="flex items-center justify-between">
        <div>
          {selectedNature ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-white font-bold capitalize">{selectedNature.name}</span>
              {isNeutral(selectedNature) ? (
                <span className="text-gray-400 text-xs">No stat changes</span>
              ) : (
                <>
                  <span className={`text-xs font-semibold ${BOOST_COLORS[selectedNature.boost]}`}>
                    ▲ {STAT_LABELS[selectedNature.boost]}
                  </span>
                  <span className="text-gray-500 text-xs">·</span>
                  <span className="text-gray-400 text-xs font-semibold">
                    ▼ {STAT_LABELS[selectedNature.reduce]}
                  </span>
                </>
              )}
            </div>
          ) : (
            <span className="text-gray-400 text-sm">No nature selected</span>
          )}
        </div>

        {/* View toggle */}
        <div className="flex gap-1 bg-gray-900 rounded-lg p-1">
          <button
            onClick={() => setView('grid')}
            className={`text-xs px-3 py-1 rounded-md transition-colors ${view === 'grid' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Grid
          </button>
          <button
            onClick={() => setView('list')}
            className={`text-xs px-3 py-1 rounded-md transition-colors ${view === 'list' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            List
          </button>
        </div>
      </div>

      {/* Grid view — natures organized by boosted stat */}
      {view === 'grid' && (
        <div className="flex flex-col gap-3">
          {stats.map((boostStat) => (
            <div key={boostStat}>
              <p className={`text-xs font-semibold uppercase tracking-widest mb-2 ${BOOST_COLORS[boostStat]}`}>
                ▲ {STAT_LABELS[boostStat]}
              </p>
              <div className="flex flex-wrap gap-2">
                {groups[boostStat]?.map((nature) => {
                  const selected = selectedNature?.name === nature.name
                  const neutral  = isNeutral(nature)
                  return (
                    <button
                      key={nature.name}
                      onClick={() => onChange(selected ? null : nature)}
                      className={`flex flex-col items-center px-3 py-2 rounded-xl border text-xs transition-all capitalize
                        ${selected
                          ? 'border-yellow-400 bg-yellow-400/10 text-white'
                          : neutral
                            ? 'border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300'
                            : 'border-gray-700 text-gray-300 hover:border-gray-500'
                        }`}
                    >
                      <span className="font-semibold">{nature.name}</span>
                      {!neutral && (
                        <span className="text-gray-500 mt-0.5">
                          ▼ {STAT_LABELS[nature.reduce]}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Neutral natures row */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2 text-gray-500">
              Neutral
            </p>
            <div className="flex flex-wrap gap-2">
              {NATURES.filter(isNeutral).map((nature) => {
                const selected = selectedNature?.name === nature.name
                return (
                  <button
                    key={nature.name}
                    onClick={() => onChange(selected ? null : nature)}
                    className={`px-3 py-2 rounded-xl border text-xs capitalize transition-all
                      ${selected
                        ? 'border-yellow-400 bg-yellow-400/10 text-white'
                        : 'border-gray-700 text-gray-500 hover:border-gray-500'
                      }`}
                  >
                    {nature.name}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* List view — quick flat list */}
      {view === 'list' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 max-h-64 overflow-y-auto">
          {NATURES.map((nature) => {
            const selected = selectedNature?.name === nature.name
            const neutral  = isNeutral(nature)
            return (
              <button
                key={nature.name}
                onClick={() => onChange(selected ? null : nature)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs capitalize transition-all
                  ${selected
                    ? 'bg-yellow-400/10 border border-yellow-400 text-white'
                    : 'hover:bg-gray-700 text-gray-300'
                  }`}
              >
                <span className="font-semibold">{nature.name}</span>
                {!neutral && (
                  <span className={`${BOOST_COLORS[nature.boost]} ml-1`}>▲</span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}