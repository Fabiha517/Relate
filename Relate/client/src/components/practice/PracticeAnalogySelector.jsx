export default function PracticeAnalogySelector({
  analogies = [],
  onSelect,
}) {
  if (!analogies || analogies.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-[32px] border-2 border-dashed border-[#D8D0C2] bg-[#FFFDF7] px-6 py-16 text-center shadow-[3px_4px_0_#D8D0C2]">

        <svg
          aria-hidden="true"
          className="absolute left-8 top-8 h-14 w-14 rotate-12 text-[#FFD65A]"
          viewBox="0 0 60 60"
          fill="none"
        >
          <path
            d="M30 4L35 23L55 30L35 36L30 56L24 36L5 30L24 23L30 4Z"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>

        <svg
          aria-hidden="true"
          className="absolute bottom-8 right-8 h-12 w-20 text-[#8DD8D0]"
          viewBox="0 0 80 50"
          fill="none"
        >
          <path
            d="M4 29C17 7 27 43 40 23C53 5 61 35 76 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#5424C7] bg-[#EEE7FF] text-2xl text-[#5424C7]">
          ✦
        </div>

        <h3 className="relative mt-6 text-xl font-black tracking-[-0.03em] text-[#14213D]">
          Nothing to explore yet.
        </h3>

        <p className="relative mx-auto mt-3 max-w-md text-sm leading-6 text-[#85818F]">
          Save an analogy to your Library first, then come back
          here to test your understanding.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-7 md:grid-cols-2">

      {analogies.map((analogy, index) => {
        const analogyId =
          analogy._id || analogy.id

        const palettes = [
          {
            blob: 'bg-[#EEE7FF]',
            accent: 'text-[#5424C7]',
            button: 'bg-[#5424C7]',
            dot: 'bg-[#FFD65A]',
          },
          {
            blob: 'bg-[#D8F1EE]',
            accent: 'text-[#327C7C]',
            button: 'bg-[#327C7C]',
            dot: 'bg-[#E47B62]',
          },
          {
            blob: 'bg-[#FFF0C7]',
            accent: 'text-[#B87918]',
            button: 'bg-[#D99425]',
            dot: 'bg-[#5424C7]',
          },
          {
            blob: 'bg-[#FBE0D9]',
            accent: 'text-[#B85C49]',
            button: 'bg-[#C96250]',
            dot: 'bg-[#8DD8D0]',
          },
        ]

        const palette =
          palettes[index % palettes.length]

        return (
          <button
            key={analogyId}
            type="button"
            onClick={() => onSelect(analogyId)}
            className="
              group
              relative
              min-h-[280px]
              overflow-hidden
              rounded-[32px]
              border-2
              border-[#D8D0C2]
              bg-[#FFFDF7]
              p-6
              text-left
              shadow-[4px_5px_0_#D8D0C2]
              transition-all
              duration-300
              hover:-translate-y-2
              hover:rotate-[0.3deg]
              hover:border-[#5424C7]
              hover:shadow-[6px_8px_0_#C5BBD5]
              focus:outline-none
              focus:ring-2
              focus:ring-[#5424C7]
              focus:ring-offset-4
              focus:ring-offset-[#F7F0E3]
              sm:p-7
            "
          >

            {/* organic background */}
            <div
              className={`
                absolute
                -right-14
                -top-14
                h-44
                w-44
                rounded-[44%_56%_63%_37%]
                ${palette.blob}
                transition-transform
                duration-500
                group-hover:scale-125
              `}
            />

            {/* floating dot */}
            <div
              className={`
                absolute
                right-10
                top-10
                h-4
                w-4
                rounded-full
                ${palette.dot}
                transition-transform
                duration-300
                group-hover:scale-150
              `}
            />

            <div className="relative flex h-full flex-col">

              {/* Top */}
              <div className="flex items-start justify-between">

                <div
                  className={`
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-full
                    border-2
                    border-[#D8D0C2]
                    bg-[#F7F2E9]
                    text-lg
                    ${palette.accent}
                    transition-transform
                    duration-300
                    group-hover:rotate-12
                  `}
                >
                  ✦
                </div>

                <span
                  className={`
                    rounded-full
                    bg-[#F5F0E8]
                    px-3
                    py-1.5
                    text-[9px]
                    font-black
                    uppercase
                    tracking-[0.13em]
                    text-[#918B98]
                  `}
                >
                  {analogy.analogyWorld || 'Analogy'}
                </span>
              </div>

              {/* title */}
              <div className="mt-7">

                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#A09AA5]">
                  Explore this connection
                </p>

                <h3 className="mt-2 line-clamp-2 text-2xl font-black leading-tight tracking-[-0.035em] text-[#14213D]">
                  {analogy.analogyTitle}
                </h3>
              </div>

              {/* concept */}
              {analogy.concept && (
                <p className="mt-4 line-clamp-2 max-w-sm text-sm leading-6 text-[#727986]">
                  {analogy.concept}
                </p>
              )}

              {/* bottom */}
              <div className="mt-auto flex items-center justify-between pt-7">

                <span
                  className={`
                    text-xs
                    font-black
                    ${palette.accent}
                  `}
                >
                  Start practice
                </span>

                <span
                  className={`
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    ${palette.button}
                    text-white
                    shadow-[2px_2px_0_#14213D]
                    transition-all
                    duration-300
                    group-hover:translate-x-1
                    group-hover:shadow-[3px_3px_0_#14213D]
                  `}
                >
                  →
                </span>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}