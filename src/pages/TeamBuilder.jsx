import { useState } from "react";
import { Link } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import TeamDisplay from "../components/TeamDisplay";
import PokemonSidePanel from "../components/PokemonSidePanel";
import ConfirmModal from "../components/ConfirmModal";
import { useTeamStore } from "../store/teamStore";
import { usePokemonList } from "../hooks/usePokemon";
import { useQueryClient } from "@tanstack/react-query";
import RulesetToggle from "../components/RulesetToggle";
import TeamExportImport from '../components/TeamExportImport'

export default function TeamBuilder() {
  const { team, randomizeTeam, clearTeam } = useTeamStore();
  const { data: allPokemon = [] } = usePokemonList();
  const queryClient = useQueryClient();

  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [showRandomConfirm, setShowRandomConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const [showExportImport, setShowExportImport] = useState(false)

  function handleRandomize() {
    if (team.length === 0) {
      randomizeTeam(allPokemon, queryClient);
    } else {
      setShowRandomConfirm(true);
    }
  }

  function handleConfirmRandomize() {
    randomizeTeam(allPokemon, queryClient);
    setShowRandomConfirm(false);
  }

  function handleConfirmClear() {
    clearTeam();
    setShowClearConfirm(false);
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Main content */}
      <div className="flex-1 p-6 flex flex-col gap-8 min-w-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">
              Pokémon Team Builder
            </h1>
            <p className="text-gray-400 mt-1">Build your perfect team of 6</p>
          </div>

          {/* All action buttons in one row */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Ruleset toggle, randomize, clear team, and analyse team buttons */}
            <div className="flex items-center gap-3 shrink-0">
              <RulesetToggle />

              <button
                onClick={handleRandomize}
                className="flex items-center gap-2 bg-gray-800 border border-gray-700 hover:border-gray-500 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm"
              >
                Randomize
              </button>
              
              <button
                onClick={() => setShowExportImport(true)}
                className="flex items-center gap-2 bg-gray-800 border border-gray-700 hover:border-gray-500 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm"
              >
                Export / Import
              </button>

              {team.length > 0 && (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="flex items-center gap-2 bg-gray-800 border border-red-900 hover:border-red-700 text-red-400 font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm"
                >
                  Clear team
                </button>
              )}

              {team.length > 0 && (
                <Link
                  to="/analysis"
                  className="bg-yellow-400 text-gray-900 font-bold px-5 py-2.5 rounded-xl hover:bg-yellow-300 transition-colors"
                >
                  Analyse team →
                </Link>
              )}

              <TeamExportImport
                isOpen={showExportImport}
                onClose={() => setShowExportImport(false)}
              />
            </div>
          </div>
        </div>

        <TeamDisplay />
        <SearchBar onHover={setSelectedPokemon} />
      </div>

      {/* Side panel */}
      <div className="w-80 shrink-0 border-l border-gray-800 bg-gray-900 sticky top-0 h-screen overflow-hidden">
        <PokemonSidePanel pokemon={selectedPokemon} />
      </div>

      {/* Randomize confirmation */}
      <ConfirmModal
        isOpen={showRandomConfirm}
        title="Randomize team?"
        message="This will replace your team with a bunch of random pokemon, are you sure you want to do this?"
        confirmLabel="Yes, randomize"
        cancelLabel="Keep my team"
        onConfirm={handleConfirmRandomize}
        onCancel={() => setShowRandomConfirm(false)}
      />

      {/* Clear confirmation */}
      <ConfirmModal
        isOpen={showClearConfirm}
        title="Clear team?"
        message="This will remove all pokemon in your team and all their items. Are you sure you want to do this?"
        confirmLabel="Yes, clear team"
        cancelLabel="Cancel"
        onConfirm={handleConfirmClear}
        onCancel={() => setShowClearConfirm(false)}
        danger
      />
    </div>
  );
}
