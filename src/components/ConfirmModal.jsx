export default function ConfirmModal({ isOpen, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel, danger = false }) {
  if (!isOpen) return null

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      {/* Panel — stop clicks from closing via backdrop */}
      <div
        className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm flex flex-col gap-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-2">
          <h2 className="text-white font-bold text-xl">{title}</h2>
          <p className="text-gray-400 text-sm leading-relaxed">{message}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-300 text-sm font-semibold hover:bg-gray-800 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors
              ${danger
                ? 'bg-red-500 hover:bg-red-400 text-white'
                : 'bg-yellow-400 hover:bg-yellow-300 text-gray-900'
              }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}