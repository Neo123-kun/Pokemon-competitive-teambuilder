import TypeBadge from './TypeBadge'
import { useTeamStore } from '../store/teamStore'
import { getFormBadgeStyle } from '../utils/pokemonForms'

export default function PokemonCard({ pokemon, onHover }) {
  const { team, addPokemon, removePokemon } = useTeamStore()

  const teamEntry  = team.find((p) => p.id === pokemon.id)
  const isOnTeam   = !!teamEntry
  const teamFull   = team.length >= 6

  const form          = teamEntry?.build?.form ?? null
  const displayTypes  = form?.data?.types ?? pokemon.types
  const displaySprite =
    form?.data?.sprites?.other?.['official-artwork']?.front_default ??
    form?.data?.sprites?.front_default ??
    pokemon.sprites?.other?.['official-artwork']?.front_default ??
    pokemon.sprites?.front_default

  function handleClick() {
    if (isOnTeam) removePokemon(pokemon.id)
    else if (!teamFull) addPokemon(pokemon)
  }

  return (
    <div
      className={`bg-gray-800 rounded-2xl flex flex-col items-center gap-2 p-4 border transition-all cursor-pointer
        ${isOnTeam
          ? 'border-yellow-400 shadow-lg shadow-yellow-400/20'
          : 'border-gray-700 hover:border-gray-500'
        }`}
      onClick={(e) => {
        e.stopPropagation()
        onHover?.(pokemon)
      }}
    >
      <img src={displaySprite} alt={pokemon.name} className="w-24 h-24 object-contain" />
      <p className="text-white font-semibold capitalize text-sm">{pokemon.name}</p>
      <p className="text-gray-500 text-xs">#{String(pokemon.id).padStart(4, '0')}</p>
      {form && (
        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${getFormBadgeStyle(form.type)}`}>
          {form.label}
        </span>
      )}
      <div className="flex gap-1 flex-wrap justify-center">
        {displayTypes.map((t) => <TypeBadge key={t.type.name} type={t.type.name} />)}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleClick()
        }}
        disabled={!isOnTeam && teamFull}
        className={`mt-1 text-xs px-3 py-1 rounded-full font-semibold transition-all
          ${isOnTeam
            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/40'
            : teamFull
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-yellow-400/20 text-yellow-400 hover:bg-yellow-400/30'
          }`}
      >
        {isOnTeam ? 'Remove' : teamFull ? 'Team full' : '+ Add to team'}
      </button>
    </div>
  )
}