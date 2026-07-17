import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useTeamStore } from '../store/teamStore'
import {
  exportShowdown, parseShowdown,
  exportJSON, parseJSON,
  downloadText,
} from '../utils/teamExport'

const BASE = 'https://pokeapi.co/api/v2'

const DEFAULT_BUILD = {
  moves:  [null, null, null, null],
  item:   null, form: null, nature: null, tera: null,
  evs:    { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
  ivs:    { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
}

export default function TeamExportImport({ isOpen, onClose }) {
  const { team, updateBuild }  = useTeamStore()
  const queryClient            = useQueryClient()

  const [tab, setTab]          = useState('export')  
  const [format, setFormat]    = useState('showdown')
  const [importText, setImportText] = useState('')
  const [importError, setImportError] = useState('')
  const [importing, setImporting]     = useState(false)
  const [copied, setCopied]           = useState(false)

  if (!isOpen) return null

  const exportText = format === 'showdown'
    ? exportShowdown(team)
    : exportJSON(team)

  const filename = format === 'showdown'
    ? 'team.txt'
    : 'team.json'

  async function handleCopy() {
    await navigator.clipboard.writeText(exportText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownload() {
    downloadText(exportText, filename)
  }

  async function handleImport() {
    setImportError('')
    setImporting(true)

    try {
      let parsed

      if (format === 'showdown') {
        parsed = parseShowdown(importText)
      } else {
        parsed = parseJSON(importText)
      }

      if (!parsed.length) throw new Error('No Pokémon found in the code.')
      if (parsed.length > 6) throw new Error('Too many Pokémon — max 6 per team.')

      // Fetch full Pokémon data for each entry
      const fullTeam = await Promise.all(
        parsed.map(async (entry) => {
          const fetchName = entry.fetchName ?? entry.name

          // Check cache first
          const cached = queryClient.getQueryData(['pokemon', entry.name])
          if (cached) {
            return { ...cached, build: { ...DEFAULT_BUILD, ...entry.build } }
          }

          const { data } = await axios.get(`${BASE}/pokemon/${fetchName}`)
          const pokemon  = {
            ...data,
            name:         entry.name,
            fetchName:    fetchName,
            formLabel:    null,
            formCategory: 'base',
          }
          queryClient.setQueryData(['pokemon', entry.name], pokemon)
          return { ...pokemon, build: { ...DEFAULT_BUILD, ...entry.build } }
        })
      )

      // Load into store
      useTeamStore.setState({ team: fullTeam })
      onClose()

    } catch (err) {
      setImportError(err.message)
    } finally {
      setImporting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-white font-bold text-xl">Export / Import Team</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {['export', 'import'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-semibold capitalize transition-colors
                ${tab === t
                  ? 'text-yellow-400 border-b-2 border-yellow-400'
                  : 'text-gray-400 hover:text-white'
                }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4 p-6 overflow-y-auto">

          {/* Format selector */}
          <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-xl p-1 w-fit">
            {['showdown', 'json'].map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all
                  ${format === f
                    ? 'bg-yellow-400 text-gray-900'
                    : 'text-gray-400 hover:text-white'
                  }`}
              >
                {f === 'showdown' ? 'Showdown' : '{ } JSON'}
              </button>
            ))}
          </div>

          {tab === 'export' ? (
            <>
              {team.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">Your team is empty — add some Pokémon first.</p>
              ) : (
                <>
                  {/* Format description */}
                  <p className="text-gray-400 text-xs">
                    {format === 'showdown'
                      ? 'Compatible with Pokémon Showdown. Import directly into the teambuilder.'
                      : 'Full build data in JSON format. Use this to back up and restore teams exactly.'
                    }
                  </p>

                  {/* Code block */}
                  <pre className="bg-gray-950 border border-gray-700 rounded-xl p-4 text-xs text-gray-300 overflow-auto max-h-64 whitespace-pre-wrap font-mono">
                    {exportText}
                  </pre>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleCopy}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors border
                        ${copied
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'bg-gray-800 text-white border-gray-700 hover:border-gray-500'
                        }`}
                    >
                      {copied ? 'Copied!' : 'Copy to clipboard'}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-yellow-400 text-gray-900 hover:bg-yellow-300 transition-colors"
                    >
                      ⬇ Download {filename}
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <p className="text-gray-400 text-xs">
                {format === 'showdown'
                  ? 'Paste a Pokémon Showdown team export below. Builds, EVs, IVs, natures and moves will be imported.'
                  : 'Paste a JSON team code exported from this app. All build data will be fully restored.'
                }
              </p>

              <textarea
                value={importText}
                onChange={(e) => { setImportText(e.target.value); setImportError('') }}
                placeholder={format === 'showdown'
                  ? 'Paste Showdown export here...'
                  : 'Paste JSON code here...'
                }
                className="w-full bg-gray-950 border border-gray-600 text-gray-300 rounded-xl px-4 py-3 text-xs font-mono outline-none focus:border-yellow-400 transition-colors resize-none h-48"
              />

              {importError && (
                <p className="text-red-400 text-xs bg-red-900/20 border border-red-900 rounded-xl px-3 py-2">
                  ⚠ {importError}
                </p>
              )}

              <button
                onClick={handleImport}
                disabled={!importText.trim() || importing}
                className="w-full py-2.5 rounded-xl text-sm font-semibold bg-yellow-400 text-gray-900 hover:bg-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importing ? 'Importing...' : '⬆ Import team'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}