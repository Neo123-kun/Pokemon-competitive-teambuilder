import { Link } from 'react-router-dom'
import { useTeamStore } from '../store/teamStore'
import TypeBadge from './TypeBadge'
import { getFormBadgeStyle } from '../utils/pokemonForms'

export default function TeamDisplay() {
  const { team, removePokemon } = useTeamStore()
  const slots = Array(6).fill(null).map((_, i) => team[i] ?? null)

  return (
    <div className="w-full">
      <h2 className="text-white font-bold text-lg mb-3">
        Your Team <span className="text-gray-400 font-normal text-sm">({team.length}/6)</span>
      </h2>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {slots.map((pokemon, i) => {
          if (!pokemon) {
            return (
              <div key={i} className="rounded-xl border bg-gray-900 border-gray-800 border-dashed flex items-center justify-center min-h-24">
                <span className="text-gray-600 text-xs">Empty</span>
              </div>
            )
          }

          const form        = pokemon.build?.form ?? null
          const displayTypes  = form?.data?.types ?? pokemon.types
          const displaySprite =
            form?.data?.sprites?.other?.['official-artwork']?.front_default ??
            form?.data?.sprites?.front_default ??
            pokemon.sprites?.front_default

          return (
            <div key={i} className="rounded-xl border bg-gray-800 border-gray-700 flex flex-col items-center p-2">
              <img src={displaySprite} alt={pokemon.name} className="w-14 h-14 object-contain" />

              <p className="text-white text-xs font-semibold capitalize mt-1">{pokemon.name}</p>
              <p className="text-gray-500 text-xs">#{String(pokemon.id).padStart(4, '0')}</p>

              {/* Form badge */}
              {form && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold mt-1 capitalize ${getFormBadgeStyle(form.type)}`}>
                  {form.label}
                </span>
              )}

              <div className="flex gap-1 flex-wrap justify-center mt-1">
                {displayTypes.map((t) => (
                  <TypeBadge key={t.type.name} type={t.type.name} />
                ))}
              </div>

              <div className="flex gap-1 mt-2">
                <Link
                  to={`/build/${pokemon.name}`}
                  className="text-yellow-400 text-xs hover:text-yellow-300 border border-yellow-400/30 px-2 py-0.5 rounded-lg hover:border-yellow-400/60 transition-colors"
                >
                  Build
                </Link>
                <button
                  onClick={() => removePokemon(pokemon.id)}
                  className="text-red-400 text-xs hover:text-red-300 border border-red-400/30 px-2 py-0.5 rounded-lg hover:border-red-400/60 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}