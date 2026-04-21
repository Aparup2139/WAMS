import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client'
import Navbar from '../../components/Navbar'
import StatusBadge from '../../components/StatusBadge'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useAuth } from '../../context/AuthContext'

export default function DealerDashboard() {
  const { user } = useAuth()
  const [parts, setParts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/parts'), api.get('/orders')]).then(([p, o]) => {
      setParts(p.data)
      setOrders(o.data)
      setLoading(false)
    })
  }, [])

  const recentOrders = orders.slice(0, 5)

  if (loading) return <><Navbar /><LoadingSpinner /></>

  return (
    <>
      <Navbar />
      <main className="page-content">
        <h1 className="page-title">Welcome, {user.username}</h1>

        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-number">{parts.length}</div>
            <div className="stat-label">Parts Available</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{orders.length}</div>
            <div className="stat-label">Total Orders</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{orders.filter(o => o.status === 'Fulfilled').length}</div>
            <div className="stat-label">Fulfilled</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{orders.filter(o => o.status === 'Validated').length}</div>
            <div className="stat-label">Processing</div>
          </div>
        </div>

        <div className="section-header">
          <h2>Recent Orders</h2>
          <Link to="/dealer/orders" className="btn btn-outline btn-sm">View All</Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="empty-state">
            <p>No orders yet.</p>
            <Link to="/dealer/place-order" className="btn btn-primary">Place Your First Order</Link>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th><th>Part</th><th>Qty</th><th>Total</th><th>Status</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(o => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.part_name}</td>
                  <td>{o.quantity_ordered}</td>
                  <td>{o.total_amount != null ? `₹${o.total_amount.toFixed(2)}` : '—'}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td>{new Date(o.order_date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="section-header" style={{ marginTop: '2rem' }}>
          <h2>Parts Catalog</h2>
          <Link to="/dealer/place-order" className="btn btn-primary btn-sm">Place Order</Link>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>#</th><th>Part Name</th><th>Category</th><th>In Stock</th><th>Unit</th></tr>
          </thead>
          <tbody>
            {parts.map(p => (
              <tr key={p.id} className={p.quantity_in_stock === 0 ? 'row-muted' : ''}>
                <td>{p.id}</td>
                <td>{p.part_name}</td>
                <td>{p.category || '—'}</td>
                <td>
                  {p.quantity_in_stock === 0
                    ? <span style={{ color: '#dc3545' }}>Out of stock</span>
                    : p.quantity_in_stock}
                </td>
                <td>{p.unit_of_measure}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </>
  )
}
