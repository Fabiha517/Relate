import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import AnalogyCard from './AnalogyCard'
import EmptyState from '../ui/EmptyState'
import ConfirmModal from '../ui/ConfirmModal'

export default function LibraryGrid({
  analogies = [],
  onDelete,
}) {
  const navigate = useNavigate()

  const [pendingDeleteId, setPendingDeleteId] = useState(null)

function handleOpen(analogyId) {
  if (!analogyId) return

  navigate(`/library/${analogyId}`)
}


function handlePractice(analogyId) {
  if (!analogyId) return

  navigate(`/practice/${analogyId}`)
}


  function handleDeleteRequest(analogyId) {
    setPendingDeleteId(analogyId)
  }

  function handleDeleteConfirm() {
    if (pendingDeleteId && onDelete) {
      onDelete(pendingDeleteId)
    }

    setPendingDeleteId(null)
  }

  function handleDeleteCancel() {
    setPendingDeleteId(null)
  }

  if (!analogies || analogies.length === 0) {
    return (
      <section className="relative py-16">
        <div className="mb-10 flex items-center gap-3">
          <span className="h-px w-10 bg-[#17233F]/25" />

          <span
            className="
              text-[11px]
              font-bold
              uppercase
              tracking-[0.2em]
              text-[#17233F]/45
            "
          >
            your idea wall
          </span>
        </div>

        <div className="relative overflow-hidden rounded-[32px] border border-[#17233F]/10 bg-[#F8F3E9] px-8 py-16 md:px-14">
          <div
            className="
              pointer-events-none
              absolute -right-20 -top-20
              h-64 w-64 rounded-full
              border border-[#9B7FE8]/25
            "
            aria-hidden="true"
          />

          <div
            className="
              pointer-events-none
              absolute -bottom-24 -left-20
              h-56 w-56 rounded-full
              bg-[#FFB800]/10
            "
            aria-hidden="true"
          />

          <div className="relative flex flex-col items-start">
            <div
              className="
                mb-8
                flex h-14 w-14
                items-center justify-center
                rounded-full
                bg-[#FFB800]
                text-2xl
                text-[#17233F]
              "
            >
              ✦
            </div>

            <p
              className="
                mb-3
                text-[11px]
                font-bold
                uppercase
                tracking-[0.2em]
                text-[#5424C7]
              "
            >
              nothing here yet
            </p>

            <EmptyState
              title="Your idea wall is empty"
              message="Create your first analogy and save it here so you can come back to it later."
              action={() => navigate('/')}
              actionLabel="Create your first analogy"
            />
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="relative py-1">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-[#17233F]/35" />

            <span
              className="
                text-[11px]
                font-bold
                uppercase
                tracking-[0.2em]
                text-[#17233F]/55
              "
            >
              recently created
            </span>
          </div>

          <span
            className="
              text-[12px]
              font-medium
              text-[#17233F]/40
            "
          >
            {analogies.length}{' '}
            {analogies.length === 1 ? 'analogy' : 'analogies'}
          </span>
        </div>

        <div
          className="
            grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
          "
        >
          {analogies.map((analogy, index) => (
            <AnalogyCard
              key={analogy._id || analogy.id}
              analogy={analogy}
              index={index}
              onOpen={handleOpen}
              onPractice={handlePractice}
              onDeleteRequest={
                onDelete
                  ? handleDeleteRequest
                  : undefined
              }
            />
          ))}

          <button
            type="button"
            onClick={() => navigate('/')}
            className="
              group
              relative
              flex min-h-[390px]
              flex-col
              justify-between
              overflow-hidden
              rounded-[28px]
              border-2
              border-dashed
              border-[#17233F]/15
              bg-[#F8F3E9]/45
              p-7
              text-left
              transition-all duration-300
              hover:-translate-y-1
              hover:border-[#5424C7]/35
              hover:bg-[#EEE7FF]/45
            "
          >
            <div
              className="
                flex h-14 w-14
                items-center justify-center
                rounded-full
                bg-[#5424C7]
                text-3xl
                font-light
                text-white
                transition-transform duration-300
                group-hover:rotate-90
              "
            >
              +
            </div>

            <div>
              <p
                className="
                  mb-4
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  text-[#5424C7]/65
                "
              >
                another idea
              </p>

              <h3
                className="
                  font-serif
                  text-[30px]
                  font-semibold
                  leading-[1.05]
                  tracking-[-0.04em]
                  text-[#17233F]
                "
              >
                Make another
                <br />
                connection.
              </h3>

              <p
                className="
                  mt-5
                  text-[13px]
                  font-medium
                  text-[#17233F]/50
                "
              >
                Start with a concept
                <span
                  className="
                    ml-2
                    text-base
                    text-[#5424C7]
                    transition-transform
                    group-hover:translate-x-1
                  "
                >
                  →
                </span>
              </p>
            </div>
          </button>
        </div>
      </section>

      <ConfirmModal
        isOpen={!!pendingDeleteId}
        title="Delete this analogy?"
        message="This will permanently remove this analogy from your library."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  )
}