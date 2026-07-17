import { useParams, Link } from 'react-router-dom'
import { useTeamStore } from '../store/teamStore'
import { canHoldItem, RAYQUAZA_ID, DRAGON_ASCENT } from '../utils/pokemonForms'
import MoveSelector from '../components/MoveSelector'
import StatSliders from '../components/StatSliders'
import ItemSelector from '../components/ItemSelector'
import FormSelector from '../components/FormSelector'
import TypeBadge from '../components/TypeBadge'
import NatureSelector from '../components/NatureSelector'
import BuildSummary from '../components/BuildSummary'
import TeraTypeSelector from '../components/TeraTypeSelector'

export default function PokemonBuild() {
  const { pokemonName } = useParams()
  const { team, updateBuild } = useTeamStore()

  const pokemon = team.find((p) => p.name === pokemonName)

  if (!pokemon) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400">Pokémon not found on your team.</p>
        <Link to="/" className="text-yellow-400 hover:underline">← Back to builder</Link>
      </div>
    )
  }

  const build = pokemon.build
  const selectedForm = build.form

  const displaySprite =
    selectedForm?.data?.sprites?.other?.['official-artwork']?.front_default ??
    selectedForm?.data?.sprites?.front_default ??
    pokemon.sprites?.other?.['official-artwork']?.front_default ??
    pokemon.sprites?.front_default

  // Use the form's types if available
  const displayTypes = selectedForm?.data?.types ?? pokemon.types

  // Map base stats — prefer form stats if selected
  const statSource = selectedForm?.data?.stats ?? pokemon.stats
  const statKeyMap = {
    hp: 'hp', attack: 'atk', defense: 'def',
    'special-attack': 'spa', 'special-defense': 'spd', speed: 'spe',
  }
  const baseStats = {}
  statSource?.forEach((s) => {
    const key = statKeyMap[s.stat.name]
    if (key) baseStats[key] = s.base_stat
  })

  // Item eligibility
  const itemAllowed = canHoldItem(pokemon.id, selectedForm?.type, build.moves)

  // Rayquaza specific warning
  const isRayquaza = pokemon.id === RAYQUAZA_ID
  const rayquazaMissingDragonAscent =
    isRayquaza && selectedForm && !build.moves.includes(DRAGON_ASCENT)

  function updateField(field, value) {
    // If switching to a form that blocks items, clear the item
    if (field === 'form') {
      const newItemAllowed = canHoldItem(pokemon.id, value?.type, build.moves)
      updateBuild(pokemon.id, {
        ...build,
        form: value,
        item: newItemAllowed ? build.item : null,
      })
      return
    }
    // If changing moves and Rayquaza loses Dragon Ascent, clear item
    if (field === 'moves' && isRayquaza && selectedForm) {
      const stillHasDragonAscent = value.includes(DRAGON_ASCENT)
      updateBuild(pokemon.id, {
        ...build,
        moves: value,
        item: stillHasDragonAscent ? build.item : null,
      })
      return
    }
    updateBuild(pokemon.id, { ...build, [field]: value })
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-3xl mx-auto flex flex-col gap-8">

        {/* Header */}
        <Link to="/" className="text-yellow-400 text-sm hover:underline">← Back to team</Link>

        {/* Pokemon identity — updates with form */}
        <div className="flex items-center gap-6 bg-gray-800 border border-gray-700 rounded-2xl p-6">
          <img src={displaySprite} alt={pokemon.name} className="w-28 h-28 object-contain" />
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-white capitalize">
              {selectedForm ? `${selectedForm.label} ${pokemon.name}` : pokemon.name}
            </h1>
            <div className="flex gap-2 flex-wrap">
              {displayTypes.map((t) => <TypeBadge key={t.type.name} type={t.type.name} />)}
            </div>
            <p className="text-gray-400 text-sm">#{String(pokemon.id).padStart(4, '0')}</p>
            {/* Base stats summary */}
            <div className="flex gap-3 mt-1 flex-wrap">
              {Object.entries(baseStats).map(([key, val]) => (
                <span key={key} className="text-xs text-gray-400">
                  <span className="text-white font-semibold">{val}</span> {key.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Form selector */}
        <section>
          <h2 className="text-white font-bold text-xl mb-3">Form</h2>
          <FormSelector
            pokemon={pokemon}
            selectedForm={selectedForm}
            onFormChange={(form) => updateField('form', form)}
          />
        </section>

        {/* Nature */}
        <section>
          <h2 className="text-white font-bold text-xl mb-3">Nature</h2>
          <NatureSelector
            selectedNature={build.nature}
            onChange={(nature) => updateField('nature', nature)}
          />
        </section>

        {/* Tera Type */}
        <section>
          <h2 className="text-white font-bold text-xl mb-3">Tera Type</h2>
          <TeraTypeSelector
            pokemon={pokemon}
            selectedTera={build.tera}
            onChange={(tera) => updateField('tera', tera)}
          />
        </section>

        {/* Held item */}
        <section>
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-white font-bold text-xl">Held Item</h2>
            {!itemAllowed && (
              <span className="bg-red-900 text-red-300 text-xs px-3 py-1 rounded-full font-semibold">
                Not available in this form
              </span>
            )}
          </div>

          {rayquazaMissingDragonAscent && (
            <div className="mb-3 bg-amber-900/40 border border-amber-700 rounded-xl p-3 text-amber-300 text-sm">
              Rayquaza needs <strong>Dragon Ascent</strong> in its moveset to hold an item while Mega Evolved.
            </div>
          )}

          {itemAllowed ? (
            <ItemSelector
              selectedItem={build.item}
              onChange={(item) => updateField('item', item)}
            />
          ) : (
            <div className="bg-gray-900 border border-gray-800 border-dashed rounded-xl p-6 text-center text-gray-600 text-sm">
              {selectedForm?.type === 'mega'
                ? 'The Mega Stone takes this slot.'
                : 'This form cannot hold items.'
              }
            </div>
          )}
        </section>

        {/* Moves */}
        <section>
          <h2 className="text-white font-bold text-xl mb-3">Moves</h2>
          {isRayquaza && selectedForm && (
            <div className="mb-3 bg-purple-900/30 border border-purple-700 rounded-xl p-3 text-purple-300 text-sm">
              Add <strong>Dragon Ascent</strong> to allow Rayquaza to hold an item.
            </div>
          )}
          <MoveSelector
            availableMoves={pokemon.moves ?? []}
            selectedMoves={build.moves}
            onChange={(moves) => updateField('moves', moves)}
          />
        </section>

        {/* EVs and IVs */}
        <section>
          <h2 className="text-white font-bold text-xl mb-1">EVs & IVs</h2>
          <p className="text-gray-400 text-sm mb-4">
            Yellow = EVs (max 510 total, 252 per stat) · Blue = IVs (0–31) · Stats calculated at level 50
          </p>
          <StatSliders
              baseStats={baseStats}
              evs={build.evs}
              ivs={build.ivs}
              nature={build.nature}
              onEvsChange={(evs) => updateField('evs', evs)}
              onIvsChange={(ivs) => updateField('ivs', ivs)}
            />
        </section>

        {/* Build summary */}
        <section>
          <BuildSummary
            pokemon={pokemon}
            build={build}
            baseStats={baseStats}
            displayTypes={displayTypes}
            displaySprite={displaySprite}
          />
        </section>

      </div>
    </div>
  )
}