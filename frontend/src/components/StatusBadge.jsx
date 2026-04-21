const COLOR_MAP = {
  Pending:   { bg: '#fff3cd', color: '#856404' },
  Validated: { bg: '#cfe2ff', color: '#084298' },
  Fulfilled: { bg: '#d1e7dd', color: '#0a3622' },
  Rejected:  { bg: '#f8d7da', color: '#842029' },
  Accepted:  { bg: '#d1e7dd', color: '#0a3622' },
  Draft:     { bg: '#e2e3e5', color: '#41464b' },
  Submitted: { bg: '#cfe2ff', color: '#084298' },
}

export default function StatusBadge({ status }) {
  const style = COLOR_MAP[status] || { bg: '#e2e3e5', color: '#41464b' }
  return (
    <span
      style={{
        background: style.bg,
        color: style.color,
        padding: '2px 10px',
        borderRadius: '12px',
        fontSize: '0.78rem',
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      {status}
    </span>
  )
}
