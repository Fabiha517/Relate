/** @jsxImportSource react */

/**
 * LoadingSpinner - Accessible loading indicator
 * Used during async operations
 * 
 * Displays a CSS-based spinner with aria-label for accessibility
 */
export default function LoadingSpinner({ size = 'medium', ariaLabel = 'Loading...' }) {
  const sizeClass = `spinner-${size}`

  return (
    <div className={`loading-spinner ${sizeClass}`} role="status" aria-label={ariaLabel}>
      <div className="spinner-ring"></div>
      <div className="spinner-text">{ariaLabel}</div>
    </div>
  )
}
