import { useTeamStore } from '../store/teamStore'
import { ALL_TYPES, getDefenseMultipliers } from '../utils/typeChart'
import { TYPE_COLORS } from '../utils/typeColors'
import TypeBadge from '../components/TypeBadge'
import { Link } from 'react-router-dom'
import { getFormBadgeStyle } from '../utils/pokemonForms'

function MultiplierCell({ value }) {
  if (value === 0)    return <td className="text-center py-2 px-1"><span className="bg-gray-700 text-gray-300 text-xs font-bold px-2 py-0.5 rounded">0×</span></td>
  if (value === 0.25) return <td className="text-center py-2 px-1"><span className="bg-green-900 text-green-300 text-xs font-bold px-2 py-0.5 rounded">¼×</span></td>
  if (value === 0.5)  return <td className="text-center py-2 px-1"><span className="bg-green-800 text-green-300 text-xs font-bold px-2 py-0.5 rounded">½×</span></td>
  if (value === 1)    return <td className="text-center py-2 px-1"><span className="text-gray-600 text-xs">—</span></td>
  if (value === 2)    return <td className="text-center py-2 px-1"><span className="bg-red-900 text-red-300 text-xs font-bold px-2 py-0.5 rounded">2×</span></td>
  if (value === 4)    return <td className="text-center py-2 px-1"><span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">4×</span></td>
  return <td className="text-center py-2 px-1"><span className="text-gray-500 text-xs">{value}×</span></td>
}

// Compute team weaknesses
function getTeamWeaknesses(team) {
  const summary = {}
  ALL_TYPES.forEach((type) => { summary[type] = 0 })

  team.forEach((pokemon) => {
    const form     = pokemon.build?.form ?? null
    const defTypes = (form?.data?.types ?? pokemon.types).map((t) => t.type.name)
    const multipliers = getDefenseMultipliers(defTypes)

    ALL_TYPES.forEach((type) => {
      if (multipliers[type] > 1) summary[type] += multipliers[type]
    })
  })

  return summary
}

export default function Analysis() {
  const { team } = useTeamStore()

  if (team.length === 0) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400 text-lg">Your team is empty.</p>
        <Link to="/" className="text-yellow-400 hover:underline">← Go build a team</Link>
      </div>
    )
  }

  const teamWeaknesses = getTeamWeaknesses(team)
  const sortedThreats  = [...ALL_TYPES].sort((a, b) => teamWeaknesses[b] - teamWeaknesses[a])

  return (
    <div className="min-h-screen bg-gray-950 p-6 flex flex-col items-center gap-8">
      <div className="w-full max-w-5xl flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Team Analysis</h1>
        <Link to="/" className="text-yellow-400 text-sm hover:underline">← Back to builder</Link>
      </div>

      {/* Team summary row */}
      <div className="flex gap-4 flex-wrap justify-center">
        {team.map((p) => {
          const form          = p.build?.form ?? null
          const displayTypes  = form?.data?.types ?? p.types
          const displaySprite =
            form?.data?.sprites?.other?.['official-artwork']?.front_default ??
            form?.data?.sprites?.front_default ??
            p.sprites?.front_default

          return (
            <div key={p.id} className="flex flex-col items-center gap-1">
              <img src={displaySprite} alt={p.name} className="w-14 h-14 object-contain" />
              <p className="text-white text-xs capitalize font-semibold">{p.name}</p>
              {form && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${getFormBadgeStyle(form.type)}`}>
                  {form.label}
                </span>
              )}
              <div className="flex gap-1 flex-wrap justify-center">
                {displayTypes.map((t) => <TypeBadge key={t.type.name} type={t.type.name} />)}
              </div>
            </div>
          )
        })}
      </div>

      {/* Defensive coverage grid */}
      <div className="w-full max-w-5xl">
        <h2 className="text-white font-bold text-xl mb-1">Defensive coverage</h2>
        <p className="text-gray-400 text-sm mb-4">How each Pokémon takes damage from every attack type</p>
        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-900">
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Pokémon</th>
                {ALL_TYPES.map((type) => (
                  <th key={type} className="py-3 px-1">
                    <span className={`${TYPE_COLORS[type]?.bg ?? 'bg-gray-500'} text-white text-xs px-1.5 py-0.5 rounded capitalize block text-center`}>
                      {type.slice(0, 3)}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {team.map((pokemon, i) => {
                const form          = pokemon.build?.form ?? null
                const defTypes      = (form?.data?.types ?? pokemon.types).map((t) => t.type.name)
                const multipliers   = getDefenseMultipliers(defTypes)
                const displaySprite =
                  form?.data?.sprites?.front_default ??
                  pokemon.sprites?.front_default

                return (
                  <tr key={pokemon.id} className={i % 2 === 0 ? 'bg-gray-900/40' : 'bg-gray-900/20'}>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <img src={displaySprite} alt={pokemon.name} className="w-8 h-8 object-contain" />
                        <div>
                          <span className="text-white capitalize text-xs font-semibold block">{pokemon.name}</span>
                          {form && (
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold capitalize ${getFormBadgeStyle(form.type)}`}>
                              {form.label}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    {ALL_TYPES.map((type) => (
                      <MultiplierCell key={type} value={multipliers[type]} />
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Biggest threats */}
      <div className="w-full max-w-5xl">
        <h2 className="text-white font-bold text-xl mb-1">Biggest threats to your team</h2>
        <p className="text-gray-400 text-sm mb-4">Attack types that hit the most Pokémon on your team for super effective damage</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {sortedThreats.filter((t) => teamWeaknesses[t] > 0).map((type) => (
            <div key={type} className="bg-gray-800 border border-gray-700 rounded-xl p-3 flex flex-col items-center gap-2">
              <TypeBadge type={type} />
              <div className="text-white font-bold text-lg">{teamWeaknesses[type].toFixed(1)}</div>
              <div className="text-gray-400 text-xs">threat score</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}