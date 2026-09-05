import { useCallback, useState } from 'react'
import InlineError from '../ui/InlineError'

/**
 * ModificationControls
 *
 * Provides:
 * - Simplify
 * - More Detail
 * - Regenerate
 * - Switch World
 *
 * Regenerate:
 *   keeps the current analogy world and creates a different analogy.
 *
 * Switch World:
 *   uses the newly selected world and creates a new analogy for that world.
 */
export default function ModificationControls({
  analogy,
  onModify,
  modifying = false,
  error = null,
  onError,
  worlds = [],
}) {
  const [selectedWorld, setSelectedWorld] = useState('')
  const [showWorldSelector, setShowWorldSelector] = useState(false)

  const nodeCount = analogy?.nodes?.length || 0

  const canSimplify = nodeCount > 1
  const canExpand = nodeCount < 20

  const handleSimplify = useCallback(async () => {
    if (!canSimplify || modifying) return

    try {
      await onModify('simplify', {})
    } catch (err) {
      onError?.(err)
    }
  }, [canSimplify, modifying, onModify, onError])

  const handleExpand = useCallback(async () => {
    if (!canExpand || modifying) return

    try {
      await onModify('expand', {})
    } catch (err) {
      onError?.(err)
    }
  }, [canExpand, modifying, onModify, onError])

  const handleRegenerate = useCallback(async () => {
    if (modifying) return

    try {
      console.log('=== REGENERATE CLICKED ===')
      console.log('Current world:', analogy?.analogyWorld)

      // IMPORTANT:
      // Regenerate deliberately keeps the CURRENT world.
      await onModify('regenerate', {})
    } catch (err) {
      onError?.(err)
    }
  }, [analogy?.analogyWorld, modifying, onModify, onError])

  const handleSwitchWorld = useCallback(async () => {
    if (!selectedWorld || modifying) return

    try {
      console.log('=== SWITCH WORLD CLICKED ===')
      console.log('Previous world:', analogy?.analogyWorld)
      console.log('New world:', selectedWorld)

      // IMPORTANT:
      // Switch World is a completely separate operation from Regenerate.
      await onModify('switchWorld', {
        analogyWorld: selectedWorld,
      })

      setShowWorldSelector(false)
      setSelectedWorld('')
    } catch (err) {
      onError?.(err)
    }
  }, [
    selectedWorld,
    analogy?.analogyWorld,
    modifying,
    onModify,
    onError,
  ])

  const handleWorldChange = (event) => {
    const world = event.target.value

    console.log('=== WORLD SELECTED ===')
    console.log('Selected world:', world)

    setSelectedWorld(world)
  }

  return (
    <div className="w-full space-y-4">
      {/* Modification buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleSimplify}
          disabled={!canSimplify || modifying}
          title={
            !canSimplify
              ? 'Cannot simplify further'
              : 'Simplify the analogy'
          }
          className="
            rounded-full
            border-2
            border-[#6d4aff]
            bg-white
            px-4
            py-2
            text-sm
            font-bold
            text-[#6d4aff]
            transition
            hover:-translate-y-0.5
            hover:bg-[#f3efff]
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          Simplify
        </button>

        <button
          type="button"
          onClick={handleExpand}
          disabled={!canExpand || modifying}
          title={
            !canExpand
              ? 'Maximum complexity reached'
              : 'Add more detail'
          }
          className="
            rounded-full
            border-2
            border-[#6d4aff]
            bg-white
            px-4
            py-2
            text-sm
            font-bold
            text-[#6d4aff]
            transition
            hover:-translate-y-0.5
            hover:bg-[#f3efff]
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          More Detail
        </button>

        <button
          type="button"
          onClick={handleRegenerate}
          disabled={modifying}
          title="Generate a different analogy using the same world"
          className="
            rounded-full
            border-2
            border-[#6d4aff]
            bg-white
            px-4
            py-2
            text-sm
            font-bold
            text-[#6d4aff]
            transition
            hover:-translate-y-0.5
            hover:bg-[#f3efff]
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          Regenerate
        </button>

        <button
          type="button"
          onClick={() => {
            if (modifying) return

            setShowWorldSelector((prev) => !prev)
          }}
          disabled={modifying}
          title="Create an analogy using a different world"
          className="
            rounded-full
            border-2
            border-[#17aaa7]
            bg-[#17aaa7]
            px-4
            py-2
            text-sm
            font-bold
            text-[#071a38]
            transition
            hover:-translate-y-0.5
            hover:bg-[#20bbb7]
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          Switch World
        </button>
      </div>

      {/* World selector */}
      {showWorldSelector && (
        <div
          className="
            flex
            flex-col
            gap-3
            rounded-2xl
            border-2
            border-[#17aaa7]
            bg-[#f2fffe]
            p-4
            sm:flex-row
            sm:items-center
          "
        >
          <select
            value={selectedWorld}
            onChange={handleWorldChange}
            disabled={modifying}
            className="
              min-w-0
              flex-1
              rounded-xl
              border-2
              border-[#b8c8c7]
              bg-white
              px-3
              py-2
              text-sm
              font-semibold
              text-[#071a38]
              outline-none
              focus:border-[#17aaa7]
            "
          >
            <option value="">
              Choose a world...
            </option>

            {worlds
              .filter(
                (world) => world !== analogy?.analogyWorld
              )
              .map((world) => (
                <option key={world} value={world}>
                  {world}
                </option>
              ))}
          </select>

          <button
            type="button"
            onClick={handleSwitchWorld}
            disabled={!selectedWorld || modifying}
            className="
              rounded-xl
              border-2
              border-[#071a38]
              bg-[#071a38]
              px-4
              py-2
              text-sm
              font-bold
              text-white
              transition
              hover:-translate-y-0.5
              hover:bg-[#172b4d]
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            Switch
          </button>

          <button
            type="button"
            onClick={() => {
              setShowWorldSelector(false)
              setSelectedWorld('')
            }}
            disabled={modifying}
            className="
              rounded-xl
              border-2
              border-[#d3cbc0]
              bg-white
              px-4
              py-2
              text-sm
              font-bold
              text-[#5d5364]
              transition
              hover:bg-[#f5f0e8]
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            Cancel
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <InlineError
          message={error.message}
          onDismiss={() => onError?.(null)}
          showRetry={false}
        />
      )}

      {/* Constraint messages */}
      {!canSimplify && (
        <p className="text-xs font-medium text-[#7d7180]">
          Cannot simplify further (minimum 1 node).
        </p>
      )}

      {!canExpand && (
        <p className="text-xs font-medium text-[#7d7180]">
          Maximum complexity reached (20 nodes).
        </p>
      )}
    </div>
  )
}