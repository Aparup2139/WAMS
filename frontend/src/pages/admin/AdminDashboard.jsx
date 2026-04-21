import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client'
import Navbar from '../../components/Navbar'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get('/admin/dashboard').then(r => setStats(r.data))
  }, [])

  if (!stats) return <><Navbar /><LoadingSpinner /></>

  const cards = [
    { label: 'Total Parts',        value: stats.total_parts,        to: '/admin/parts',       color: '#0d6efd' },
    { label: 'Low Stock Alerts',   value: stats.low_stock_alerts,   to: '/admin/parts',       color: '#dc3545' },
    { label: 'Total Orders',       value: stats.total_orders,       to: '/admin/orders',      color: '#198754' },
    { label: 'Pending Orders',     value: stats.pending_orders,     to: '/admin/orders',      color: '#fd7e14' },
    { label: 'Total Quotations',   value: stats.total_quotations,   to: '/admin/quotations',  color: '#6f42c1' },
    { label: 'Pending Quotations', value: stats.pending_quotations, to: '/admin/quotations',  color: '#d63384' },
    { label: 'Total Users',        value: stats.total_users,        to: '/admin/users',       color: '#0dcaf0' },
    { label: 'Total Bills',        value: stats.total_bills,        to: '/admin/orders',      color: '#20c997' },
  ]

  return (
    <>
      <Navbar />
      <main className="page-content">
        <h1 className="page-title">Admin Dashboard</h1>
        <div className="stat-grid">
          {cards.map(c => (
            <Link key={c.label} to={c.to} className="stat-card stat-card-link" style={{ borderTop: `4px solid ${c.color}` }}>
              <div className="stat-number" style={{ color: c.color }}>{c.value}</div>
              <div className="stat-label">{c.label}</div>
            </Link>
          ))}
        </div>

        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-grid">
            <Link to="/admin/quotations" className="action-card">
              <span className="action-icon">📋</span>
              <span>Review Quotations</span>
            </Link>
            <Link to="/admin/orders" className="action-card">
              <span className="action-icon">📦</span>
              <span>Manage Orders</span>
            </Link>
            <Link to="/admin/parts" className="action-card">
              <span className="action-icon">🔧</span>
              <span>Manage Parts</span>
            </Link>
            <Link to="/admin/reports" className="action-card">
              <span className="action-icon">📊</span>
              <span>View Reports</span>
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
