import { useEffect, useState } from 'react'
import api from '../../api/client'
import Navbar from '../../components/Navbar'
import StatusBadge from '../../components/StatusBadge'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function ManageQuotations() {
  const [quotations, setQuotations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [actionError, setActionError] = useState('')

  const load = () => api.get('/quotations').then(r => { setQuotations(r.data); setLoading(false) })
  useEffect(() => { load() }, [])

  const evaluate = async (id, status) => {
    setActionError('')
    try {
      await api.put(`/quotations/${id}/evaluate`, { status })
      load()
    } catch (err) {
      setActionError(err.response?.data?.error || 'Action failed')
    }
  }

  const statuses = ['All', 'Pending', 'Accepted', 'Rejected']
  const visible = filter === 'All' ? quotations : quotations.filter(q => q.status === filter)

  if (loading) return <><Navbar /><LoadingSpinner /></>

  return (
    <>
      <Navbar />
      <main className="page-content">
        <h1 className="page-title">Manage Quotations</h1>

        {actionError && <div className="alert alert-error">{actionError}</div>}

        <div className="filter-bar">
          {statuses.map(s => (
            <button key={s} className={`filter-btn ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
              {s}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <div className="empty-state">No quotations found.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th><th>Supplier</th><th>Part</th><th>Unit Price (₹)</th>
                <th>Qty Offered</th><th>Terms</th><th>Expiry</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(q => (
                <tr key={q.id}>
                  <td>#{q.id}</td>
                  <td>{q.supplier_name}</td>
                  <td>{q.part_name}</td>
                  <td>{q.unit_price.toFixed(2)}</td>
                  <td>{q.quantity_offered}</td>
                  <td className="text-muted">{q.terms || '—'}</td>
                  <td>{q.expiry_date ? new Date(q.expiry_date).toLocaleDateString() : '—'}</td>
                  <td><StatusBadge status={q.status} /></td>
                  <td>
                    {q.status === 'Pending' && (
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn btn-success btn-sm" onClick={() => evaluate(q.id, 'Accepted')}>
                          Accept
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => evaluate(q.id, 'Rejected')}>
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </>
  )
}
