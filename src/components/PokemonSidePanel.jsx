import { usePokemonSpecies } from '../hooks/usePokemon'
import { useTeamStore } from '../store/teamStore'
import TypeBadge from './TypeBadge'

const STAT_LABELS = {
  hp:              { label: 'HP',      color: 'bg-red-500' },
  attack:          { label: 'Atk',     color: 'bg-orange-500' },
  defense:         { label: 'Def',     color: 'bg-yellow-500' },
  'special-attack':{ label: 'Sp.Atk', color: 'bg-blue-500' },
  'special-defense':{ label: 'Sp.Def', color: 'bg-green-500' },
  speed:           { label: 'Spd',     color: 'bg-pink-500' },
}

function StatBar({ statName, value }) {
  const meta    = STAT_LABELS[statName] ?? { label: statName, color: 'bg-gray-500' }
  const percent = Math.min((value / 255) * 100, 100)

  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-400 text-xs w-12 shrink-0">{meta.label}</span>
      <div className="flex-1 bg-gray-700 rounded-full h-1.5">
        <div
          className={`${meta.color} h-1.5 rounded-full transition-all duration-500`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-white text-xs w-7 text-right shrink-0">{value}</span>
    </div>
  )
}

export default function PokemonSidePanel({ pokemon }) {
  const speciesName = pokemon?.speciesName ?? pokemon?.name
  const { data: species, isLoading } = usePokemonSpecies(speciesName)
  const { team, addPokemon, removePokemon } = useTeamStore()

  if (!pokemon) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
        <div className="w-24 h-24 rounded-full bg-gray-800 border-2 border-dashed border-gray-700 flex items-center justify-center">
          <span className="text-4xl">.</span>
        </div>
        <p className="text-gray-500 text-sm">Click a Pokémon<br />to see its details</p>
      </div>
    )
  }

  const isOnTeam  = team.some((p) => p.id === pokemon.id)
  const teamFull  = team.length >= 6

  const sprite    = pokemon.sprites?.other?.['official-artwork']?.front_default
                 ?? pokemon.sprites?.front_default
  const types     = pokemon.types.map((t) => t.type.name)

  // Get English flavor text — pick the most recent entry
  const flavorText = species?.flavor_text_entries
    ?.filter((e) => e.language.name === 'en')
    ?.at(-1)
    ?.flavor_text
    ?.replace(/\f/g, ' ')   // PokeAPI uses \f as line break
    ?.replace(/\n/g, ' ')
    ?? ''

  const genus = species?.genera?.find((g) => g.language.name === 'en')?.genus ?? ''

  const totalStats = pokemon.stats?.reduce((sum, s) => sum + s.base_stat, 0) ?? 0

  function handleTeamToggle() {
    if (isOnTeam) removePokemon(pokemon.id)
    else if (!teamFull) addPokemon(pokemon)
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">

      {/* Pokemon artwork */}
      <div className="relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl p-6 flex flex-col items-center gap-3">
        <img
          src={sprite}
          alt={pokemon.name}
          className="w-36 h-36 object-contain drop-shadow-xl"
        />

        {/* Dex number + name */}
        <div className="text-center">
          <p className="text-gray-500 text-xs font-semibold">
            #{String(pokemon.id).padStart(4, '0')}
          </p>
          <h2 className="text-white font-bold text-2xl capitalize">{pokemon.name}</h2>
          {genus && <p className="text-gray-400 text-xs mt-0.5">{genus}</p>}
        </div>

        {/* Types */}
        <div className="flex gap-2">
          {types.map((t) => <TypeBadge key={t} type={t} />)}
        </div>

        {/* Add / remove button */}
        <button
          onClick={handleTeamToggle}
          disabled={!isOnTeam && teamFull}
          className={`w-full py-2 rounded-xl text-sm font-semibold transition-all mt-1
            ${isOnTeam
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
              : teamFull
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed border border-gray-600'
                : 'bg-yellow-400/20 text-yellow-400 hover:bg-yellow-400/30 border border-yellow-400/30'
            }`}
        >
          {isOnTeam ? '✕ Remove from team' : teamFull ? 'Team is full' : '+ Add to team'}
        </button>
      </div>

      <div className="flex flex-col gap-4 p-4">

        {/* Flavor text */}
        {isLoading ? (
          <div className="flex flex-col gap-2 animate-pulse">
            <div className="h-3 bg-gray-700 rounded-full w-full" />
            <div className="h-3 bg-gray-700 rounded-full w-4/5" />
            <div className="h-3 bg-gray-700 rounded-full w-3/5" />
          </div>
        ) : flavorText ? (
          <div className="bg-gray-800 rounded-xl p-3">
            <p className="text-gray-300 text-xs leading-relaxed italic">"{flavorText}"</p>
          </div>
        ) : null}

        {/* Base stats */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest">Base Stats</p>
            <span className="text-gray-500 text-xs">Total <span className="text-white font-bold">{totalStats}</span></span>
          </div>
          <div className="flex flex-col gap-2.5">
            {pokemon.stats?.map((s) => (
              <StatBar key={s.stat.name} statName={s.stat.name} value={s.base_stat} />
            ))}
          </div>
        </div>

        {/* Physical traits */}
        {species && (
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-800 rounded-xl p-3 text-center">
              <p className="text-gray-500 text-xs mb-1">Height</p>
              <p className="text-white font-semibold text-sm">{(pokemon.height / 10).toFixed(1)}m</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-3 text-center">
              <p className="text-gray-500 text-xs mb-1">Weight</p>
              <p className="text-white font-semibold text-sm">{(pokemon.weight / 10).toFixed(1)}kg</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-3 text-center">
              <p className="text-gray-500 text-xs mb-1">Catch Rate</p>
              <p className="text-white font-semibold text-sm">{species.capture_rate}</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-3 text-center">
              <p className="text-gray-500 text-xs mb-1">Base Happiness</p>
              <p className="text-white font-semibold text-sm">{species.base_happiness ?? '—'}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}