import { useState } from 'react'
import { Link } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import TeamDisplay from '../components/TeamDisplay'
import PokemonSidePanel from '../components/PokemonSidePanel'
import ConfirmModal from '../components/ConfirmModal'
import { useTeamStore } from '../store/teamStore'
import { usePokemonList } from '../hooks/usePokemon'
import { useQueryClient } from '@tanstack/react-query'

export default function TeamBuilder() {
  const { team, randomizeTeam }       = useTeamStore()
  const { data: allPokemon = [] }     = usePokemonList()
  const queryClient = useQueryClient()
  const [selectedPokemon, setSelectedPokemon] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)

  function handleRandomize() {
    // If team is empty skip the confirmation
    if (team.length === 0) {
      randomizeTeam(allPokemon, queryClient)
    } else {
      setShowConfirm(true)
    }
  }

  function handleConfirm() {
    randomizeTeam(allPokemon, queryClient)
    setShowConfirm(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">

      {/* Main content */}
      <div className="flex-1 p-6 flex flex-col gap-8 min-w-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">Pokémon Team Builder</h1>
            <p className="text-gray-400 mt-1">Build your perfect team of 6</p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleRandomize}
              className="flex items-center gap-2 bg-gray-800 border border-gray-700 hover:border-gray-500 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm"
            >
              Randomize
            </button>
            {team.length > 0 && (
              <Link
                to="/analysis"
                className="bg-yellow-400 text-gray-900 font-bold px-5 py-2.5 rounded-xl hover:bg-yellow-300 transition-colors"
              >
                Analyse team →
              </Link>
            )}
          </div>
        </div>

        <TeamDisplay />
        <SearchBar onHover={setSelectedPokemon} />
      </div>

      {/* Side panel */}
      <div className="w-80 shrink-0 border-l border-gray-800 bg-gray-900 sticky top-0 h-screen overflow-hidden">
        <PokemonSidePanel pokemon={selectedPokemon} />
      </div>

      {/* Confirmation modal */}
      <ConfirmModal
        isOpen={showConfirm}
        title="Randomize team?"
        message="This will replace your current team of 6 with randomly picked Pokémon. Any builds you've set up will be lost."
        confirmLabel="Yes, randomize"
        cancelLabel="Keep my team"
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
        danger={false}
      />

    </div>
  )
}