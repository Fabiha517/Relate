import React from 'react'

export default function InfoModal({
  isOpen,
  title,
  message,
  buttonText = 'Got it',
  onClose,
}) {
  if (!isOpen) return null

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-[#071a38]/55
        px-5
        py-8
        backdrop-blur-sm
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="info-modal-title"
    >
      <div
        className="
          relative
          w-full
          max-w-[630px]
          rounded-[30px]
          border-[3px]
          border-[#071a38]
          bg-[#fffaf1]
          px-7
          py-8
          shadow-[10px_12px_0_#071a38]
          sm:px-10
          sm:py-10
        "
      >
        {/* Sparkle */}
        <div
          className="
            mb-8
            flex
            h-[78px]
            w-[78px]
            items-center
            justify-center
            rounded-full
            border-2
            border-[#071a38]
            bg-[#ffb800]
            text-[34px]
            text-[#071a38]
            shadow-[3px_4px_0_#071a38]
          "
          aria-hidden="true"
        >
          <span>✦</span>
        </div>

        {/* Title */}
        <h2
          id="info-modal-title"
          className="
            max-w-[520px]
            text-[30px]
            font-black
            uppercase
            leading-[1.15]
            tracking-[-0.03em]
            text-[#071a38]
            sm:text-[36px]
          "
        >
          {title}
        </h2>

        {/* Message */}
        <p
          className="
            mt-6
            max-w-[540px]
            text-[17px]
            font-medium
            leading-[1.55]
            text-[#526477]
            sm:text-[19px]
          "
        >
          {message}
        </p>

        {/* Action */}
        <button
          type="button"
          onClick={onClose}
          className="
            mt-8
            w-full
            rounded-[16px]
            border-2
            border-[#071a38]
            bg-[#5424c7]
            px-6
            py-4
            text-base
            font-black
            text-white
            shadow-[5px_6px_0_#071a38]
            transition-all
            hover:-translate-y-0.5
            hover:bg-[#6435dc]
            hover:shadow-[6px_7px_0_#071a38]
            active:translate-y-0
            active:shadow-[2px_3px_0_#071a38]
          "
        >
          {buttonText}
        </button>
      </div>
    </div>
  )
}