import './VisualModel.css'

import React from 'react'
import { getWorldTheme } from '../../utils/worldThemes'

/**
 * VisualModel
 *
 * Displays the analogy as a simple two-column mapping diagram.
 *
 * The visual is intentionally based on `nodes` / `mappings`
 * rather than `relationships`.
 *
 * This prevents unnecessary branches, crossing arrows,
 * reverse arrows, and confusing relationship labels.
 */
export default function VisualModel({
  nodes = [],
  mappings = [],
  analogyWorld,
}) {
  /**
   * Build the rows from mappings.
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
   *
   * If mappings are missing for some reason, pair the nodes directly.
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
      className={`visual-model visual-model--${theme.pattern || 'minimal'}`}
      style={{
        '--world-accent': theme.accent,
        '--world-edge': theme.edgeColor,
        '--world-node-bg': theme.nodeBg || 'rgba(255,255,255,0.72)',
      }}
    >
      <div className="visual-model__header">
        <div className="visual-model__column-title">
          <span className="visual-model__eyebrow">
            Concept
          </span>
          <span className="visual-model__main-title">
            What it is
          </span>
        </div>

        <div
          className="visual-model__connection-heading"
          aria-hidden="true"
        >
          <span>RELATE</span>
        </div>

        <div className="visual-model__column-title visual-model__column-title--analogy">
          <span className="visual-model__eyebrow">
            {analogyWorld || 'Analogy'}
          </span>
          <span className="visual-model__main-title">
            What it’s like
          </span>
        </div>
      </div>

      <div className="visual-model__rows">
        {displayRows.map((row, index) => (
          <div
            className="visual-model__row"
            key={`${row.concept}-${row.analogy}-${index}`}
          >
            <div className="visual-model__node visual-model__node--concept">
              <span className="visual-model__node-text">
                {row.concept}
              </span>
            </div>

            <div
              className="visual-model__connector"
              aria-hidden="true"
            >
              <span className="visual-model__connector-line" />
              <span className="visual-model__connector-dot" />
            </div>

            <div className="visual-model__node visual-model__node--analogy">
              <span className="visual-model__node-text">
                {row.analogy}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
