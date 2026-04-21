import { useEffect, useState } from 'react'
import api from '../../api/client'
import Navbar from '../../components/Navbar'
import LoadingSpinner from '../../components/LoadingSpinner'

const ACTION_COLORS = {
  ADD_PART:           '#0d6efd',
  MODIFY_PART:        '#0dcaf0',
  EVALUATE_QUOTATION: '#6f42c1',
  UPDATE_ORDER_STATUS:'#198754',
  MODIFY_USER_ROLE:   '#fd7e14',
}

export default function AdminLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/admin/logs').then(r => { setLogs(r.data); setLoading(false) })
  }, [])

  const visible = logs.filter(l =>
    l.action_type.includes(search.toUpperCase()) ||
    (l.action_details || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.admin_name || '').toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <><Navbar /><LoadingSpinner /></>

  return (
    <>
      <Navbar />
      <main className="page-content">
        <h1 className="page-title">Admin Action Logs</h1>

        <input
          className="form-input search-input"
          placeholder="Search by action, admin, or detail…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {visible.length === 0 ? (
          <div className="empty-state">No logs found.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>#</th><th>Admin</th><th>Action</th><th>Details</th><th>Timestamp</th></tr>
            </thead>
            <tbody>
              {visible.map(l => (
                <tr key={l.id}>
                  <td>{l.id}</td>
                  <td>{l.admin_name}</td>
                  <td>
                    <span style={{
                      background: ACTION_COLORS[l.action_type] || '#6c757d',
                      color: '#fff', padding: '2px 8px', borderRadius: '8px',
                      fontSize: '0.75rem', fontWeight: 600,
                    }}>
                      {l.action_type}
                    </span>
                  </td>
                  <td>{l.action_details}</td>
                  <td>{new Date(l.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </>
  )
}
