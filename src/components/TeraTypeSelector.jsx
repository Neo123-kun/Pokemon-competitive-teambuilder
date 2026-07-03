import { TYPE_COLORS } from '../utils/typeColors'
import { useTeamStore } from '../store/teamStore'

const ALL_TYPES = Object.keys(TYPE_COLORS)

export default function TeraTypeSelector({ pokemon, selectedTera, onChange }) {
  const { canApplyTera } = useTeamStore()
  const teraBlocked = !selectedTera && !canApplyTera(pokemon.id)

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex flex-col gap-4">

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {selectedTera ? (
            <div>
              <p className="text-white font-semibold capitalize">{selectedTera} Tera Type</p>
              <p className="text-gray-400 text-xs">Overrides typing when Terastallized</p>
            </div>
          ) : teraBlocked ? (
            <div>
              <p className="text-gray-400 text-sm font-semibold">Tera unavailable</p>
              <p className="text-gray-500 text-xs">Another Pokémon on your team already has a Tera Type</p>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No Tera Type selected</p>
          )}
        </div>
        {selectedTera && (
          <button
            onClick={() => onChange(null)}
            className="text-red-400 text-xs hover:text-red-300 transition-colors"
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* Type grid — greyed out when blocked */}
      <div className={`flex flex-wrap gap-2 ${teraBlocked ? 'opacity-40 pointer-events-none' : ''}`}>
        {ALL_TYPES.map((type) => {
          const colors = TYPE_COLORS[type]
          const active = selectedTera === type
          return (
            <button
              key={type}
              onClick={() => onChange(active ? null : type)}
              disabled={teraBlocked}
              className={`capitalize text-xs font-semibold px-3 py-1.5 rounded-full border transition-all
                ${active
                  ? `${colors.bg} ${colors.text} border-transparent ring-2 ring-white/30`
                  : 'bg-transparent text-gray-400 border-gray-600 hover:border-gray-400'
                }`}
            >
              {type}
            </button>
          )
        })}
      </div>

    </div>
  )
}