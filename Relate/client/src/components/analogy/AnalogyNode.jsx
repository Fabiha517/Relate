/** @jsxImportSource react */

import { Handle, Position } from 'reactflow'
import { truncate } from '../../utils/truncate'
import { getWorldTheme } from '../../utils/worldThemes'

export default function AnalogyNode({ data, isSelected }) {
  const conceptLabel = data.conceptLabel || ''
  const analogyLabel = data.analogyLabel || ''
  const analogyWorld = data.analogyWorld || ''

  const theme = getWorldTheme(analogyWorld)

  const truncatedConcept = truncate(conceptLabel, 60)
  const truncatedAnalogy = truncate(analogyLabel, 60)

  const nodeStyle = {
    position: 'relative',

    minWidth: '180px',
    maxWidth: '230px',

    padding: '15px 17px',

    borderRadius: '14px',

    border: `${isSelected ? '2px' : '1.5px'} solid ${
      theme.nodeBorder
    }`,

    background: theme.nodeBackground,

    boxShadow: isSelected
      ? `0 5px 18px rgba(7,26,56,0.14), 0 0 0 4px ${theme.accent}22`
      : '0 4px 12px rgba(7,26,56,0.08)',

    cursor: 'default',
    userSelect: 'none',

    fontFamily: 'inherit',

    overflow: 'hidden',

    transition:
      'transform 180ms ease, box-shadow 180ms ease',
  }

  return (
    <div
      style={nodeStyle}
      className={`analogy-node analogy-node--${theme.decoration}`}
    >

      {/* WORLD DECORATIVE LAYER */}
      <WorldDecoration theme={theme} />

      {/* TOP ACCENT */}
      <div
        style={{
          position: 'absolute',
          left: '0',
          top: '0',
          width: '100%',
          height: '4px',
          background: theme.accent,
          opacity: 1,
        }}
      />

      {/* CONCEPT */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,

          fontSize: '10px',
          fontWeight: '800',

          textTransform: 'uppercase',
          letterSpacing: '0.08em',

          color: theme.accent,

          marginBottom: '7px',

          lineHeight: '1.3',

          overflow: 'hidden',
          textOverflow: 'ellipsis',

          display: '-webkit-box',
          WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {truncatedConcept}
      </div>

      {/* ANALOGY */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,

          fontSize: '15px',
          fontWeight: '750',

          color: '#071A38',

          lineHeight: '1.35',

          overflow: 'hidden',
          textOverflow: 'ellipsis',

          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {truncatedAnalogy}
      </div>

      {/* SMALL WORLD DETAIL */}
      <div
        style={{
          position: 'absolute',
          right: '10px',
          bottom: '8px',

          width: '18px',
          height: '18px',

          borderRadius: '50%',

          border: `1px solid ${theme.accent}`,

          opacity: 1,
        }}
      />

      {/* REACT FLOW HANDLES */}

      <Handle
        type="target"
        position={Position.Top}
        isConnectable={false}
        style={{
          opacity: 0,
        }}
      />

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={false}
        style={{
          opacity: 0,
        }}
      />
    </div>
  )
}


/* =========================================================
   WORLD DECORATION
========================================================= */

function WorldDecoration({ theme }) {
  const commonStyle = {
    position: 'absolute',
    inset: 0,

    pointerEvents: 'none',

    opacity: 0.0,

    zIndex: 0,
  }

  /* SPACE */
  if (theme.decoration === 'space') {
    return (
      <svg
        style={commonStyle}
        viewBox="0 0 230 120"
        fill="none"
      >
        <circle
          cx="180"
          cy="40"
          r="25"
          stroke={theme.accent}
          strokeWidth="1"
        />

        <ellipse
          cx="180"
          cy="40"
          rx="45"
          ry="13"
          stroke={theme.accent}
          strokeWidth="1"
          transform="rotate(-20 180 40)"
        />

        <circle
          cx="30"
          cy="25"
          r="2"
          fill={theme.accent}
        />

        <circle
          cx="65"
          cy="90"
          r="1.5"
          fill={theme.accent}
        />

        <circle
          cx="205"
          cy="95"
          r="2"
          fill={theme.accent}
        />
      </svg>
    )
  }

  /* CITY */
  if (theme.decoration === 'city') {
    return (
      <svg
        style={commonStyle}
        viewBox="0 0 230 120"
        fill="none"
      >
        <path
          d="M0 90H230"
          stroke={theme.accent}
        />

        <path
          d="M20 90V55H42V90"
          stroke={theme.accent}
        />

        <path
          d="M50 90V35H75V90"
          stroke={theme.accent}
        />

        <path
          d="M82 90V65H105V90"
          stroke={theme.accent}
        />

        <path
          d="M112 90V45H142V90"
          stroke={theme.accent}
        />

        <path
          d="M150 90V30H180V90"
          stroke={theme.accent}
        />

        <path
          d="M190 90V58H215V90"
          stroke={theme.accent}
        />
      </svg>
    )
  }

  /* SPORTS */
  if (theme.decoration === 'sports') {
    return (
      <svg
        style={commonStyle}
        viewBox="0 0 230 120"
        fill="none"
      >
        <rect
          x="15"
          y="15"
          width="200"
          height="90"
          rx="6"
          stroke={theme.accent}
        />

        <line
          x1="115"
          y1="15"
          x2="115"
          y2="105"
          stroke={theme.accent}
        />

        <circle
          cx="115"
          cy="60"
          r="18"
          stroke={theme.accent}
        />

        <path
          d="M15 40H42C55 40 60 50 60 60C60 70 55 80 42 80H15"
          stroke={theme.accent}
        />

        <path
          d="M215 40H188C175 40 170 50 170 60C170 70 175 80 188 80H215"
          stroke={theme.accent}
        />
      </svg>
    )
  }

  /* MOVIES */
  if (theme.decoration === 'movies') {
    return (
      <svg
        style={commonStyle}
        viewBox="0 0 230 120"
        fill="none"
      >
        <rect
          x="18"
          y="25"
          width="194"
          height="70"
          rx="8"
          stroke={theme.accent}
        />

        <circle cx="35" cy="18" r="7" stroke={theme.accent} />
        <circle cx="65" cy="18" r="7" stroke={theme.accent} />
        <circle cx="95" cy="18" r="7" stroke={theme.accent} />

        <circle cx="135" cy="102" r="7" stroke={theme.accent} />
        <circle cx="165" cy="102" r="7" stroke={theme.accent} />
        <circle cx="195" cy="102" r="7" stroke={theme.accent} />
      </svg>
    )
  }

  /* NATURE */
  if (theme.decoration === 'nature') {
    return (
      <svg
        style={commonStyle}
        viewBox="0 0 230 120"
        fill="none"
      >
        <path
          d="M25 105C35 70 50 45 80 25"
          stroke={theme.accent}
        />

        <path
          d="M48 72C28 62 22 45 28 30C45 34 57 50 48 72Z"
          stroke={theme.accent}
        />

        <path
          d="M63 52C65 30 80 18 97 16C99 35 85 49 63 52Z"
          stroke={theme.accent}
        />

        <path
          d="M28 100C65 85 105 90 135 108"
          stroke={theme.accent}
        />
      </svg>
    )
  }

  /* RESTAURANT / KITCHEN */
  if (
    theme.decoration === 'restaurant' ||
    theme.decoration === 'kitchen'
  ) {
    return (
      <svg
        style={commonStyle}
        viewBox="0 0 230 120"
        fill="none"
      >
        <path
          d="M20 30H210"
          stroke={theme.accent}
        />

        <path
          d="M20 90H210"
          stroke={theme.accent}
        />

        <circle
          cx="185"
          cy="60"
          r="25"
          stroke={theme.accent}
        />

        <circle
          cx="185"
          cy="60"
          r="15"
          stroke={theme.accent}
        />

        <path
          d="M38 42V78"
          stroke={theme.accent}
        />

        <path
          d="M48 42V78"
          stroke={theme.accent}
        />

        <path
          d="M38 60H48"
          stroke={theme.accent}
        />
      </svg>
    )
  }

  /* FACTORY */
  if (theme.decoration === 'factory') {
    return (
      <svg
        style={commonStyle}
        viewBox="0 0 230 120"
        fill="none"
      >
        <path
          d="M20 95V55L70 75V45L120 70V35L170 60V95"
          stroke={theme.accent}
        />

        <path
          d="M20 95H210"
          stroke={theme.accent}
        />

        <circle
          cx="195"
          cy="75"
          r="10"
          stroke={theme.accent}
        />
      </svg>
    )
  }

  /* LIBRARY */
  if (theme.decoration === 'library') {
    return (
      <svg
        style={commonStyle}
        viewBox="0 0 230 120"
        fill="none"
      >
        <path
          d="M25 100V30"
          stroke={theme.accent}
        />

        <path
          d="M45 100V25"
          stroke={theme.accent}
        />

        <path
          d="M65 100V35"
          stroke={theme.accent}
        />

        <path
          d="M85 100V22"
          stroke={theme.accent}
        />

        <path
          d="M105 100V32"
          stroke={theme.accent}
        />

        <path
          d="M20 100H215"
          stroke={theme.accent}
        />
      </svg>
    )
  }

  /* GENERIC */
  return null
}