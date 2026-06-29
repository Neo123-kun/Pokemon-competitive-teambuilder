import { Routes, Route } from 'react-router-dom'
import TeamBuilder from './pages/TeamBuilder'
import Analysis from './pages/Analysis'
import PokemonBuild from './pages/PokemonBuild'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Routes>
        <Route path="/" element={<TeamBuilder />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/build/:pokemonName" element={<PokemonBuild />} />
      </Routes>
    </div>
  )
}