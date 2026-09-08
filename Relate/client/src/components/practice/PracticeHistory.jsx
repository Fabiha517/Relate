import PracticeHistoryCard from './PracticeHistoryCard'

export default function PracticeHistory({
  sessions = [],
  onReviewSession,
  onDeleteSession,
}) {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="relative overflow-hidden py-12 sm:py-20">
        <div className="relative mx-auto max-w-2xl text-center">

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            <div className="absolute left-[5%] top-[15%] h-20 w-20 rounded-[44%_56%_61%_39%] bg-[#FFD65A] opacity-80" />

            <div className="absolute right-[5%] top-[20%] h-16 w-16 rounded-[57%_43%_36%_64%] bg-[#8DD8D0]" />

            <div className="absolute bottom-[12%] left-[15%] h-5 w-5 rounded-full bg-[#E47B62]" />

            <svg
              className="absolute bottom-[14%] right-[16%] h-12 w-12 rotate-12 text-[#5424C7]"
              viewBox="0 0 50 50"
              fill="none"
            >
              <path
                d="M25 3L30 19L47 25L30 30L25 47L20 30L3 25L20 19L25 3Z"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </div>

          <div className="relative mx-auto mb-8 h-40 w-64">
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 300 180"
              fill="none"
            >
              <path
                d="M35 115C78 54 113 137 153 88C190 43 221 105 267 57"
                stroke="#5424C7"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="7 8"
              />

              <circle
                cx="35"
                cy="115"
                r="10"
                fill="#FFD65A"
                stroke="#14213D"
                strokeWidth="2"
              />

              <circle
                cx="153"
                cy="88"
                r="13"
                fill="#8DD8D0"
                stroke="#14213D"
                strokeWidth="2"
              />

              <circle
                cx="267"
                cy="57"
                r="10"
                fill="#E47B62"
                stroke="#14213D"
                strokeWidth="2"
              />

              <path
                d="M115 35L118 45M110 40L123 40"
                stroke="#F0A23A"
                strokeWidth="2"
                strokeLinecap="round"
              />

              <path
                d="M210 125L213 135M205 130L218 130"
                stroke="#5424C7"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="relative">
            <h3 className="text-2xl font-black tracking-[-0.035em] text-[#14213D]">
              Your trail starts here.
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#7D8490]">
              Complete a practice session from one of your saved
              analogies and your first learning snapshot will appear
              here.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">

      {/* LEFT TIMELINE */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          bottom-10
          left-[22px]
          top-10
          w-px
          bg-[#C9C1D8]
          sm:left-[30px]
        "
      />

      {/* RIGHT TIMELINE */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          bottom-10
          left-[calc(50%+40px)]
          top-10
          hidden
          w-px
          bg-[#C9C1D8]
          md:block
        "
      />

      <div className="grid grid-cols-1 gap-x-5 gap-y-7 md:grid-cols-2 xl:gap-x-8">

        {sessions.map((session, index) => {
          const isRightColumn = index % 2 === 1

          return (
            <div
              key={`${session.analogyId}-${session.sessionId}`}
              className={`
                relative
                ${
                  isRightColumn
                    ? 'pl-14 sm:pl-[72px] md:pl-[72px]'
                    : 'pl-14 sm:pl-[72px]'
                }
              `}
            >

              {/* timeline node */}

              <div
                aria-hidden="true"
                className={`
                  absolute
                  top-8
                  z-20
                  flex
                  h-5
                  w-5
                  items-center
                  justify-center
                  rounded-full
                  border-[3px]
                  border-[#F7F0E3]
                  bg-[#5424C7]
                  shadow-[0_0_0_2px_#B8AECF]

                  ${
                    isRightColumn
                      ? 'left-[12px] sm:left-[20px] md:left-[20px]'
                      : 'left-[12px] sm:left-[20px]'
                  }
                `}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
              </div>

              {/* session number */}

              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  left-[82px]
                  top-[14px]
                  z-30
                  flex
                  h-6
                  min-w-6
                  items-center
                  justify-center
                  rounded-full
                  bg-[#F7F0E3]
                  px-1.5
                  text-[10px]
                  font-black
                  tracking-[0.05em]
                  text-[#8E879B]
                "
              >
                {String(index + 1).padStart(2, '0')}
              </div>

              <PracticeHistoryCard
                session={session}
                index={index}
                  onClick={() => onReviewSession?.(session)}
  onDelete={() => onDeleteSession?.(session)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}