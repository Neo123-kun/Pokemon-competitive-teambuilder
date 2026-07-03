import { useTeamStore } from '../store/teamStore'

export default function RulesetToggle() {
  const { ruleset, setRuleset } = useTeamStore()

  return (
    <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-xl p-1">
      <button
        onClick={() => setRuleset('default')}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
          ${ruleset === 'default'
            ? 'bg-yellow-400 text-gray-900'
            : 'text-gray-400 hover:text-white'
          }`}
      >
        Default
      </button>
      <button
        onClick={() => setRuleset('unlimited')}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
          ${ruleset === 'unlimited'
            ? 'bg-yellow-400 text-gray-900'
            : 'text-gray-400 hover:text-white'
          }`}
      >
        Unlimited
      </button>
    </div>
  )
}