/** @jsxImportSource react */

/**
 * EmptyState - Generic empty state placeholder
 * Used for no results scenarios (e.g., empty library, no practice sessions)
 * 
 * Requirements: 6.7, 6.8, 6.9, 6.13
 */
export default function EmptyState({
  title = 'Nothing here yet',
  message = 'Start by creating something new',
  icon = null,
  action = null,
  actionLabel = 'Get started',
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-content">
        {icon && <div className="empty-state-icon">{icon}</div>}

        <h3 className="empty-state-title">{title}</h3>

        {message && <p className="empty-state-message">{message}</p>}

        {action && (
          <button onClick={action} className="btn btn-primary">
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  )
}
