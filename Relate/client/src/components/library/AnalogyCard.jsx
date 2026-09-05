
/** @jsxImportSource react */

const WORLD_STYLES = {
  Restaurant: {
    accent: 'bg-[#D69E2E]',
    text: 'text-[#8A641A]',
    chip: 'bg-[#E9E1CF]',
    line: 'border-[#D69E2E]/20',
  },

  Sports: {
    accent: 'bg-[#278F8B]',
    text: 'text-[#176B68]',
    chip: 'bg-[#DCE8E5]',
    line: 'border-[#278F8B]/20',
  },

  Movies: {
    accent: 'bg-[#7565A8]',
    text: 'text-[#594C87]',
    chip: 'bg-[#E5E1EC]',
    line: 'border-[#7565A8]/20',
  },

  City: {
    accent: 'bg-[#658957]',
    text: 'text-[#4D6C43]',
    chip: 'bg-[#E1E6DB]',
    line: 'border-[#658957]/20',
  },

  Factory: {
    accent: 'bg-[#B96D5F]',
    text: 'text-[#8C5147]',
    chip: 'bg-[#E9DFDA]',
    line: 'border-[#B96D5F]/20',
  },

  Space: {
    accent: 'bg-[#59689B]',
    text: 'text-[#475681]',
    chip: 'bg-[#E0E3EB]',
    line: 'border-[#59689B]/20',
  },
}

const DEFAULT_STYLE = {
  accent: 'bg-[#17233F]',
  text: 'text-[#17233F]',
  chip: 'bg-[#E5E0D7]',
  line: 'border-[#17233F]/15',
}

function formatDate(date) {
  if (!date) return ''

  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) {
    return ''
  }

  return parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function truncate(text, maxLength = 90) {
  if (!text) return ''

  const value = String(text)

  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, maxLength - 1)}…`
}

export default function AnalogyCard({
  analogy,
  index = 0,
  onDeleteRequest,
  onOpen,
  onPractice,
}) {
  const id = analogy?._id || analogy?.id
  const world = analogy?.analogyWorld || 'Other'
  const style = WORLD_STYLES[world] || DEFAULT_STYLE

  /*
   * OPEN
   *
   * This is used by:
   * 1. Clicking anywhere on the card
   * 2. Clicking the Open button
   */
  function handleOpen(event) {
    if (event) {
      event.stopPropagation()
    }

    if (!id) {
      console.warn('Cannot open analogy: missing analogy id')
      return
    }

    if (onOpen) {
      onOpen(id)
    }
  }

  /*
   * PRACTICE
   *
   * Stop propagation so clicking Practice does NOT
   * also trigger the card's onClick.
   */
  function handlePractice(event) {
    event.stopPropagation()

    if (id && onPractice) {
      onPractice(id)
    }
  }

  /*
   * DELETE
   *
   * Stop propagation so clicking Delete does NOT
   * open the analogy.
   */
  function handleDelete(event) {
    event.stopPropagation()

    if (!id) {
      console.warn('Cannot delete analogy: missing analogy id')
      return
    }

    if (onDeleteRequest) {
      onDeleteRequest(id)
    }
  }

  return (
    <article
      className={`
        group relative flex h-full
        min-h-[260px] max-h-[310px]
        cursor-pointer flex-col
        overflow-hidden
        rounded-[24px]
        border ${style.line}
        border-[#17233F]/[0.1]
        shadow-[0_8px_25px_rgba(23,35,63,0.7)]
        transition-all duration-300
        hover:-translate-y-1
        hover:shadow-[0_15px_35px_rgba(23,35,63,0.11)]
        hover:cursor-pointer
      `}
      onClick={handleOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          handleOpen(event)
        }
      }}
    >
      {/* Decorative circle */}
      <div
        className={`
          pointer-events-none
          absolute -right-10 -top-10
          h-28 w-28 rounded-full
          ${style.accent}
          opacity-[0.4]
          transition-transform duration-500
          group-hover:scale-125
          hover:cursor-pointer
        `}
        aria-hidden="true"
      />

      {/* Small decorative dot */}
      <div
        className={`
          pointer-events-none
          absolute right-6 top-6
          h-2.5 w-2.5 rounded-full
          ${style.accent}
          opacity-80
        `}
        aria-hidden="true"
      />

      {/* HEADER */}
      <div className="relative px-6 pb-4 pt-6">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className={`
                shrink-0
                rounded-full
                ${style.chip}
                px-2.5 py-1
                text-[9px]
                font-bold
                uppercase
                tracking-[0.14em]
                ${style.text}
              `}
            >
              {world}
            </span>

            {analogy?.createdAt && (
              <span
                className="
                  truncate
                  text-[10px]
                  font-medium
                  text-[#17233F]/40
                "
              >
                {formatDate(analogy.createdAt)}
              </span>
            )}
          </div>

          <span
            className="
              ml-3
              mt-3
              shrink-0
              font-mono
              text-[10px]
              text-[#17233F]
            "
          >
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>

        <h3
          className="
            max-w-[88%]
            font-serif
            text-[23px]
            font-semibold
            leading-[1.08]
            tracking-[-0.025em]
            text-[#17233F]
            transition-colors
            group-hover:text-[#5424C7]
            hover:cursor-pointer
          "
        >
          {analogy?.analogyTitle || 'Untitled connection'}
        </h3>

        <p
          className="
            mt-2.5
            max-w-[94%]
            text-[12px]
            leading-[1.55]
            text-[#17233F]/55
          "
          title={analogy?.concept}
        >
          {truncate(analogy?.concept, 85)}
        </p>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* FOOTER */}
      <div
        className="
          flex
          items-center
          justify-between
          border-t
          border-[#17233F]/10
          px-6
          py-4
        "
      >
        <div className="flex items-center gap-4">
          {/* OPEN */}
          <button
            type="button"
            onClick={handleOpen}
            className="
              inline-flex
              items-center
              gap-1.5
              text-[15px]
              font-bold
              text-[#17233F]/65
              transition-colors
              hover:text-[#17233F]
              hover:cursor-pointer
            "
          >
            Open
            <span className="text-[12px]">→</span>
          </button>

          {/* PRACTICE */}
          <button
            type="button"
            onClick={handlePractice}
            className={`
              inline-flex
              items-center
              gap-1.5
              text-[15px]
              font-bold
              ${style.text}
              opacity-75
              transition-opacity
              hover:opacity-100
              hover:cursor-pointer
            `}
          >
            Practice
            <span className="text-[12px]">↗</span>
          </button>
        </div>

        {/* DELETE */}
        {onDeleteRequest && (
          <button
            type="button"
            onClick={handleDelete}
            aria-label="Delete analogy"
            title="Delete analogy"
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              text-[#17233F]/70
              transition-all
              hover:bg-[#C84E40]/10
              hover:text-[#C84E40]
              hover:cursor-pointer
            "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 22 22"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-[17px] w-[17px]"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 6h18"
              />

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6"
              />

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 6l-1 14H6L5 6"
              />

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 10v6M14 10v6"
              />
            </svg>
          </button>
        )}
      </div>
    </article>
  )
}

