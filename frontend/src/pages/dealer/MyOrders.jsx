import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client'
import Navbar from '../../components/Navbar'
import StatusBadge from '../../components/StatusBadge'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function MyOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    api.get('/orders').then(r => { setOrders(r.data); setLoading(false) })
  }, [])

  const statuses = ['All', 'Validated', 'Fulfilled', 'Rejected', 'Pending']
  const visible = filter === 'All' ? orders : orders.filter(o => o.status === filter)

  if (loading) return <><Navbar /><LoadingSpinner /></>

  return (
    <>
      <Navbar />
      <main className="page-content">
        <div className="section-header">
          <h1 className="page-title">My Orders</h1>
          <Link to="/dealer/place-order" className="btn btn-primary btn-sm">+ New Order</Link>
        </div>

        <div className="filter-bar">
          {statuses.map(s => (
            <button
              key={s}
              className={`filter-btn ${filter === s ? 'active' : ''}`}
              onClick={() => setFilter(s)}
            >
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
                <th>Order #</th>
                <th>Part</th>
                <th>Qty</th>
                <th>Total (₹)</th>
                <th>Status</th>
                <th>Date</th>
                <th>Delivery Address</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(o => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td>{o.part_name}</td>
                  <td>{o.quantity_ordered}</td>
                  <td>{o.total_amount != null ? o.total_amount.toFixed(2) : '—'}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td>{new Date(o.order_date).toLocaleDateString()}</td>
                  <td className="text-muted">{o.delivery_address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </>
  )
}
