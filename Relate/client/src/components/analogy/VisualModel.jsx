import './VisualModel.css'

import React from 'react'

import { getWorldTheme } from '../../utils/worldThemes'

/**
 * VisualModel
 *
 * Displays concept → analogy mappings as a visual relationship map.
 *
 * Desktop/tablet:
 *   Concept  →  Analogy
 *
 * Mobile:
 *   Concept
 *      ↓
 *   Analogy
 *
 * The actual mapping data remains unchanged.
 */

export default function VisualModel({
  nodes = [],
  mappings = [],
  analogyWorld,
}) {
  /**
   * Build display rows from mappings.
   *
   * Every mapping connects:
   * conceptComponent → analogyElement
   */
  const rows = mappings
    .map((mapping) => {
      const node = nodes.find(
        (item) =>
          item.conceptLabel === mapping.conceptComponent &&
          item.analogyLabel === mapping.analogyElement
      )

      return {
        concept:
          mapping.conceptComponent ||
          node?.conceptLabel ||
          'Concept',

        analogy:
          mapping.analogyElement ||
          node?.analogyLabel ||
          'Analogy',
      }
    })
    .filter((row) => row.concept && row.analogy)

  /**
   * Fallback:
   * If mappings are unavailable, pair nodes directly.
   */
  const displayRows =
    rows.length > 0
      ? rows
      : nodes.map((node) => ({
          concept: node.conceptLabel,
          analogy: node.analogyLabel,
        }))

  const theme = getWorldTheme(analogyWorld)

  return (
    <div
      className={`visual-model visual-model--${
        theme.pattern || 'minimal'
      }`}
      style={{
        '--world-accent': theme.accent,
        '--world-edge': theme.edgeColor,
        '--world-node-bg':
          theme.nodeBg || 'rgba(255,255,255,0.72)',
      }}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}
      <div className="visual-model__header">

        {/* REAL CONCEPT */}
        <div className="visual-model__column-title">
          <span className="visual-model__eyebrow">
            Real concept
          </span>

          <span className="visual-model__main-title">
            SFTP protocol
          </span>
        </div>

        {/* RELATE MARKER */}
        <div
          className="visual-model__connection-heading"
          aria-hidden="true"
        >
          <span>RELATE</span>
        </div>

        {/* ANALOGY */}
        <div className="visual-model__column-title visual-model__column-title--analogy">
          <span className="visual-model__eyebrow">
            {analogyWorld || 'Analogy'}
          </span>

          <span className="visual-model__main-title">
  {analogyWorld ? `${analogyWorld} version` : 'Analogy version'}
</span>
        </div>
      </div>

      {/* =====================================================
          RELATIONSHIP MAP
      ===================================================== */}
      <div className="visual-model__rows">

        {displayRows.map((row, index) => (
          <div
            className="visual-model__row"
            key={`${row.concept}-${row.analogy}-${index}`}
          >
            {/* =================================================
                CONCEPT
            ================================================= */}
            <div className="visual-model__node visual-model__node--concept">
              <span className="visual-model__node-label">
                CONCEPT
              </span>

              <span className="visual-model__node-text">
                {row.concept}
              </span>
            </div>

            {/* =================================================
                CONNECTION
            ================================================= */}
            <div
              className="visual-model__connector"
              aria-hidden="true"
            >
              <span className="visual-model__connector-line" />

              <span className="visual-model__connector-arrow">
                →
              </span>
            </div>

            {/* =================================================
                ANALOGY
            ================================================= */}
            <div className="visual-model__node visual-model__node--analogy">
              <span className="visual-model__node-label">
                ANALOGY
              </span>

              <span className="visual-model__node-text">
                {row.analogy}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* =====================================================
          MOBILE FOOTER
      ===================================================== */}
      <div className="visual-model__mobile-note">
        <span className="visual-model__mobile-note-dot" />

        <span>
          Each pair shows how the real concept maps to the analogy.
        </span>
      </div>
    </div>
  )
}