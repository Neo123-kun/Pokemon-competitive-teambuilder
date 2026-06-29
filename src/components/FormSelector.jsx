import { useAvailableForms } from '../hooks/usePokemon'
import { getFormBadgeStyle, getFormLabel, FORM_TYPES } from '../utils/pokemonForms'

export default function FormSelector({ pokemon, selectedForm, onFormChange }) {
  const { available, isLoading } = useAvailableForms(pokemon.name, pokemon.id)

  if (isLoading) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
        <p className="text-gray-400 text-sm">Checking available forms...</p>
      </div>
    )
  }

  if (available.length === 0) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
        <p className="text-gray-500 text-sm">No special forms available for this Pokémon.</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex flex-col gap-4">

      {/* Base form option */}
      <button
        onClick={() => onFormChange(null)}
        className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left
          ${!selectedForm
            ? 'border-yellow-400 bg-yellow-400/10'
            : 'border-gray-700 hover:border-gray-500'
          }`}
      >
        <img
          src={pokemon.sprites?.other?.['official-artwork']?.front_default ?? pokemon.sprites?.front_default}
          alt={pokemon.name}
          className="w-12 h-12 object-contain"
        />
        <div>
          <p className="text-white font-semibold capitalize text-sm">{pokemon.name}</p>
          <p className="text-gray-400 text-xs">Base form · Can hold item</p>
        </div>
        {!selectedForm && <span className="ml-auto text-yellow-400 text-xs font-bold">Selected</span>}
      </button>

      {/* Special forms grouped by type */}
      {[FORM_TYPES.MEGA, FORM_TYPES.GMAX, FORM_TYPES.CROWNED].map((formType) => {
        const formsOfType = available.filter((f) => f.type === formType)
        if (formsOfType.length === 0) return null

        const typeLabels = {
          [FORM_TYPES.MEGA]:    'Mega Evolution',
          [FORM_TYPES.GMAX]:    'Gigantamax',
          [FORM_TYPES.CROWNED]: 'Crowned',
        }

        return (
          <div key={formType}>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-2">
              {typeLabels[formType]}
            </p>
            <div className="flex flex-col gap-2">
              {formsOfType.map((form) => {
                const isSelected = selectedForm?.apiName === form.apiName
                const sprite =
                  form.data?.sprites?.other?.['official-artwork']?.front_default ??
                  form.data?.sprites?.front_default

                return (
                  <button
                    key={form.apiName}
                    onClick={() => onFormChange(isSelected ? null : form)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left
                      ${isSelected
                        ? 'border-yellow-400 bg-yellow-400/10'
                        : 'border-gray-700 hover:border-gray-500'
                      }`}
                  >
                    {sprite ? (
                      <img src={sprite} alt={form.label} className="w-12 h-12 object-contain" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-700 rounded-lg" />
                    )}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-semibold text-sm capitalize">{form.label}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getFormBadgeStyle(form.type)}`}>
                          {form.type.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs">
                        {form.type === FORM_TYPES.MEGA && pokemon.id === 384
                          ? 'Rayquaza · Can hold item with Dragon Ascent'
                          : form.type === FORM_TYPES.MEGA
                            ? 'Mega Stone required · Cannot hold other items'
                            : form.type === FORM_TYPES.GMAX
                              ? 'Can hold items'
                              : 'Can hold items'
                        }
                      </p>
                    </div>
                    {isSelected && <span className="ml-auto text-yellow-400 text-xs font-bold">Selected</span>}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}