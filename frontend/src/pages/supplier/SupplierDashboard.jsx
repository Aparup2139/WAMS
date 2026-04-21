import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client'
import Navbar from '../../components/Navbar'
import StatusBadge from '../../components/StatusBadge'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useAuth } from '../../context/AuthContext'

export default function SupplierDashboard() {
  const { user } = useAuth()
  const [quotations, setQuotations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/quotations').then(r => { setQuotations(r.data); setLoading(false) })
  }, [])

  const pending  = quotations.filter(q => q.status === 'Pending').length
  const accepted = quotations.filter(q => q.status === 'Accepted').length
  const rejected = quotations.filter(q => q.status === 'Rejected').length

  if (loading) return <><Navbar /><LoadingSpinner /></>

  return (
    <>
      <Navbar />
      <main className="page-content">
        <h1 className="page-title">Welcome, {user.username}</h1>

        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-number">{quotations.length}</div>
            <div className="stat-label">Total Quotations</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: '#fd7e14' }}>{pending}</div>
            <div className="stat-label">Pending Review</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: '#198754' }}>{accepted}</div>
            <div className="stat-label">Accepted</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: '#dc3545' }}>{rejected}</div>
            <div className="stat-label">Rejected</div>
          </div>
        </div>

        <div className="section-header">
          <h2>My Quotations</h2>
          <Link to="/supplier/submit" className="btn btn-primary btn-sm">+ Submit New</Link>
        </div>

        {quotations.length === 0 ? (
          <div className="empty-state">
            <p>No quotations submitted yet.</p>
            <Link to="/supplier/submit" className="btn btn-primary">Submit First Quotation</Link>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th><th>Part</th><th>Unit Price (₹)</th>
                <th>Qty Offered</th><th>Submitted</th><th>Expiry</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {quotations.map(q => (
                <tr key={q.id}>
                  <td>#{q.id}</td>
                  <td>{q.part_name}</td>
                  <td>{q.unit_price.toFixed(2)}</td>
                  <td>{q.quantity_offered}</td>
                  <td>{new Date(q.submission_date).toLocaleDateString()}</td>
                  <td>{q.expiry_date ? new Date(q.expiry_date).toLocaleDateString() : '—'}</td>
                  <td><StatusBadge status={q.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </>
  )
}
