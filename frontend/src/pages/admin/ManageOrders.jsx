import { useEffect, useState } from 'react'
import api from '../../api/client'
import Navbar from '../../components/Navbar'
import StatusBadge from '../../components/StatusBadge'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function ManageOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [actionError, setActionError] = useState('')

  const load = () => api.get('/orders').then(r => { setOrders(r.data); setLoading(false) })
  useEffect(() => { load() }, [])

  const updateStatus = async (id, status) => {
    setActionError('')
    try {
      await api.put(`/orders/${id}/status`, { status })
      // Auto-generate bill when fulfilling
      if (status === 'Fulfilled') {
        try { await api.post(`/bills/generate/${id}`) } catch (_) { /* bill may already exist */ }
      }
      load()
    } catch (err) {
      setActionError(err.response?.data?.error || 'Action failed')
    }
  }

  const statuses = ['All', 'Validated', 'Fulfilled', 'Rejected', 'Pending']
  const visible = filter === 'All' ? orders : orders.filter(o => o.status === filter)

  if (loading) return <><Navbar /><LoadingSpinner /></>

  return (
    <>
      <Navbar />
      <main className="page-content">
        <h1 className="page-title">Manage Orders</h1>

        {actionError && <div className="alert alert-error">{actionError}</div>}

        <div className="filter-bar">
          {statuses.map(s => (
            <button key={s} className={`filter-btn ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
              {s}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <div className="empty-state">No orders found.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th><th>Dealer</th><th>Part</th><th>Qty</th>
                <th>Total (₹)</th><th>Status</th><th>Date</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(o => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td>{o.dealer_name}</td>
                  <td>{o.part_name}</td>
                  <td>{o.quantity_ordered}</td>
                  <td>{o.total_amount != null ? o.total_amount.toFixed(2) : '—'}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td>{new Date(o.order_date).toLocaleDateString()}</td>
                  <td>
                    {o.status === 'Validated' && (
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn btn-success btn-sm" onClick={() => updateStatus(o.id, 'Fulfilled')}>
                          Fulfill
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => updateStatus(o.id, 'Rejected')}>
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
