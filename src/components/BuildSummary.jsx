import { useState } from 'react'
import { useMoveDetail } from '../hooks/usePokemon'
import TypeBadge from './TypeBadge'
import { getFormBadgeStyle, getFormLabel } from '../utils/pokemonForms'
import { getNatureMultiplier } from '../utils/natures'


const STAT_LABELS = {
  hp: 'HP', atk: 'Attack', def: 'Defense',
  spa: 'Sp. Atk', spd: 'Sp. Def', spe: 'Speed',
}

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

function calcStat(base, iv, ev, nature, stat, level = 50) {
  const isHp = stat === 'hp'
  const raw = isHp
    ? Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10
    : Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5
  return isHp ? raw : Math.floor(raw * getNatureMultiplier(nature, stat))
}

function MoveSummaryRow({ moveName }) {
  const { data } = useMoveDetail(moveName)
  if (!data) return (
    <div className="bg-gray-800 rounded-lg px-3 py-2">
      <p className="text-gray-500 text-xs animate-pulse">Loading {moveName.replace(/-/g, ' ')}...</p>
    </div>
  )

  const type     = data.type?.name ?? '?'
  const category = data.damage_class?.name ?? 'status'
  const power    = data.power    ?? '—'
  const accuracy = data.accuracy ?? '—'
  const pp       = data.pp       ?? '—'
  const effect   = data.effect_entries?.find((e) => e.language.name === 'en')
  const desc     = effect?.short_effect?.replace(/\$effect_chance/g, data.effect_chance ?? '?') ?? ''

  return (
    <div className="bg-gray-800 rounded-xl p-3 flex flex-col gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-white font-semibold capitalize text-sm">
          {moveName.replace(/-/g, ' ')}
        </p>
        <span className={`${TYPE_COLORS[type] ?? 'bg-gray-500'} text-white text-xs px-2 py-0.5 rounded-full capitalize font-semibold`}>
          {type}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-semibold ${CATEGORY_COLORS[category]}`}>
          {category}
        </span>
        <span className="text-gray-500 text-xs ml-auto">
          PWR {power} · ACC {accuracy} · PP {pp}
        </span>
      </div>
      {desc && <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>}
    </div>
  )
}

export default function BuildSummary({ pokemon, build, baseStats, displayTypes, displaySprite }) {
  const [open, setOpen] = useState(false)

  const selectedMoves = build.moves.filter(Boolean)
  const totalEvs      = Object.values(build.evs).reduce((a, b) => a + b, 0)

  const natureName = build.nature
    ? build.nature.name.charAt(0).toUpperCase() + build.nature.name.slice(1)
    : 'None'

  return (
    <div className="border border-gray-700 rounded-2xl overflow-hidden">

      {/* Toggle header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-gray-800 hover:bg-gray-750 transition-colors"
      >
        <div className="flex items-center gap-3">
          <img
            src={displaySprite}
            alt={pokemon.name}
            className="w-10 h-10 object-contain"
          />
          <div className="text-left">
            <p className="text-white font-bold capitalize">{pokemon.name}</p>
            <p className="text-gray-400 text-xs">
              {selectedMoves.length}/4 moves ·{' '}
              {build.item ? build.item.replace(/-/g, ' ') : 'No item'} ·{' '}
              {natureName} nature ·{' '}
              {build.tera ? `${build.tera} Tera` : 'No Tera'} ·{' '}
              {totalEvs} EVs
            </p>
          </div>
        </div>
        <span className="text-gray-400 text-sm">{open ? '▲ Close' : '▼ Full summary'}</span>
      </button>

      {/* Expanded summary */}
      {open && (
        <div className="bg-gray-850 border-t border-gray-700 p-5 flex flex-col gap-6">

          {/* Identity */}
          <div className="flex items-center gap-4">
            <img src={displaySprite} alt={pokemon.name} className="w-20 h-20 object-contain" />
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-white font-bold text-xl capitalize">{pokemon.name}</h3>
                <span className="text-gray-500 text-sm">
                  #{String(pokemon.id).padStart(4, '0')}
                </span>
                {build.form && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${getFormBadgeStyle(build.form.type)}`}>
                    {getFormLabel(build.form.type, build.form.label)}
                  </span>
                )}
              </div>
              <div className="flex gap-1 flex-wrap">
                {displayTypes.map((t) => <TypeBadge key={t.type.name} type={t.type.name} />)}
              </div>
              <p className="text-gray-400 text-sm">
                Nature: <span className="text-white font-semibold">{natureName}</span>
                {build.nature && !['hardy','docile','serious','bashful','quirky'].includes(build.nature.name) && (
                  <span className="text-gray-500">
                    {' '}(+{STAT_LABELS[build.nature.boost]} / −{STAT_LABELS[build.nature.reduce]})
                  </span>
                )}
                {build.tera && (
                  <p className="text-gray-400 text-sm">
                    Tera Type:{' '}
                    <span className={`font-semibold capitalize px-2 py-0.5 rounded-full text-xs ${TYPE_COLORS[build.tera]?.bg} ${TYPE_COLORS[build.tera]?.text}`}>
                    {build.tera}
                    </span>
                  </p>
                )}
              </p>
              {build.item && (
                <p className="text-gray-400 text-sm">
                  Item: <span className="text-white font-semibold capitalize">{build.item.replace(/-/g, ' ')}</span>
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-3">Final Stats (Lv. 50)</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(STAT_LABELS).map(([stat, label]) => {
                const base  = baseStats?.[stat] ?? 0
                const final = calcStat(base, build.ivs[stat], build.evs[stat], build.nature, stat)
                const natMult = getNatureMultiplier(build.nature, stat)
                const color = stat === 'hp' ? '' : natMult > 1 ? 'text-red-400' : natMult < 1 ? 'text-blue-400' : ''

                return (
                  <div key={stat} className="bg-gray-800 rounded-xl p-3">
                    <p className="text-gray-500 text-xs">{label}</p>
                    <div className="flex items-end gap-2 mt-1">
                      <span className={`font-bold text-xl ${color || 'text-white'}`}>{final}</span>
                      <span className="text-gray-600 text-xs mb-0.5">
                        base {base} · EV {build.evs[stat]} · IV {build.ivs[stat]}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Moves */}
          {selectedMoves.length > 0 && (
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-3">Moves</p>
              <div className="flex flex-col gap-2">
                {selectedMoves.map((move) => (
                  <MoveSummaryRow key={move} moveName={move} />
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {selectedMoves.length === 0 && (
            <p className="text-gray-600 text-sm text-center py-2">No moves selected yet.</p>
          )}
          {!build.item && (
            <p className="text-gray-600 text-xs">No held item.</p>
          )}
          {totalEvs < 508 && (
            <p className="text-gray-600 text-xs">{510 - totalEvs} EVs remaining — consider spreading them further.</p>
          )}

        </div>
      )}
    </div>
  )
}