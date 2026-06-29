import { getNatureMultiplier } from '../utils/natures'

const STAT_LABELS = {
  hp:  'HP',
  atk: 'Attack',
  def: 'Defense',
  spa: 'Sp. Atk',
  spd: 'Sp. Def',
  spe: 'Speed',
}

const EV_TOTAL_CAP = 510
const EV_STAT_CAP  = 252

function calcStat(base, iv, ev, nature, stat, level = 50) {
  const isHp = stat === 'hp'
  const raw = isHp
    ? Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10
    : Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5
  return isHp ? raw : Math.floor(raw * getNatureMultiplier(nature, stat))
}

const NATURE_COLORS = {
  boost:  'text-red-400',
  reduce: 'text-blue-400',
}

export default function StatSliders({ baseStats, evs, ivs, nature, onEvsChange, onIvsChange }) {
  const totalEvs    = Object.values(evs).reduce((a, b) => a + b, 0)
  const remaining   = EV_TOTAL_CAP - totalEvs

  function handleEvChange(stat, value) {
    const parsed     = Math.min(Number(value), EV_STAT_CAP)
    const otherTotal = totalEvs - evs[stat]
    const capped     = Math.min(parsed, EV_TOTAL_CAP - otherTotal)
    onEvsChange({ ...evs, [stat]: capped })
  }

  function handleIvChange(stat, value) {
    onIvsChange({ ...ivs, [stat]: Math.min(31, Math.max(0, Number(value))) })
  }

  function getNatureColor(stat) {
    if (!nature || stat === 'hp') return ''
    if (nature.boost  === stat && nature.boost  !== nature.reduce) return NATURE_COLORS.boost
    if (nature.reduce === stat && nature.boost  !== nature.reduce) return NATURE_COLORS.reduce
    return ''
  }

  return (
    <div className="flex flex-col gap-4">

      {/* EV total bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>EVs used: {totalEvs} / {EV_TOTAL_CAP}</span>
          <span>{remaining} remaining</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${totalEvs >= EV_TOTAL_CAP ? 'bg-red-500' : 'bg-yellow-400'}`}
            style={{ width: `${(totalEvs / EV_TOTAL_CAP) * 100}%` }}
          />
        </div>
      </div>

      {/* Stat rows */}
      <div className="grid grid-cols-1 gap-3">
        {Object.entries(STAT_LABELS).map(([stat, label]) => {
          const base      = baseStats?.[stat] ?? 0
          const finalStat = calcStat(base, ivs[stat], evs[stat], nature, stat)
          const natColor  = getNatureColor(stat)

          return (
            <div key={stat} className="bg-gray-800 border border-gray-700 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-semibold ${natColor || 'text-white'}`}>
                  {label}
                  {natColor === NATURE_COLORS.boost  && <span className="ml-1 text-xs">▲</span>}
                  {natColor === NATURE_COLORS.reduce && <span className="ml-1 text-xs">▼</span>}
                </span>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>Base <strong className="text-white">{base}</strong></span>
                  <span className={`font-bold text-sm ${natColor || 'text-yellow-400'}`}>{finalStat}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>EV</span><span>{evs[stat]}</span>
                  </div>
                  <input
                    type="range" min={0} max={EV_STAT_CAP} step={4}
                    value={evs[stat]}
                    onChange={(e) => handleEvChange(stat, e.target.value)}
                    className="w-full accent-yellow-400"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>IV</span><span>{ivs[stat]}</span>
                  </div>
                  <input
                    type="range" min={0} max={31}
                    value={ivs[stat]}
                    onChange={(e) => handleIvChange(stat, e.target.value)}
                    className="w-full accent-blue-400"
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}