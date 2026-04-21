import { useEffect, useState } from 'react'
import api from '../../api/client'
import Navbar from '../../components/Navbar'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function MyBills() {
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/bills').then(r => { setBills(r.data); setLoading(false) })
  }, [])

  const total = bills.reduce((sum, b) => sum + b.amount, 0)

  if (loading) return <><Navbar /><LoadingSpinner /></>

  return (
    <>
      <Navbar />
      <main className="page-content">
        <h1 className="page-title">My Bills</h1>

        {bills.length === 0 ? (
          <div className="empty-state">No bills generated yet.</div>
        ) : (
          <>
            <div className="stat-grid" style={{ marginBottom: '1.5rem' }}>
              <div className="stat-card">
                <div className="stat-number">{bills.length}</div>
                <div className="stat-label">Total Bills</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">₹{total.toFixed(2)}</div>
                <div className="stat-label">Total Amount</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{bills.filter(b => b.printed).length}</div>
                <div className="stat-label">Printed</div>
              </div>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Bill #</th>
                  <th>Order #</th>
                  <th>Part</th>
                  <th>Qty</th>
                  <th>Amount (₹)</th>
                  <th>Generated</th>
                  <th>Printed</th>
                </tr>
              </thead>
              <tbody>
                {bills.map(b => (
                  <tr key={b.id}>
                    <td>#{b.id}</td>
                    <td>#{b.order_id}</td>
                    <td>{b.part_name}</td>
                    <td>{b.quantity_ordered}</td>
                    <td>{b.amount.toFixed(2)}</td>
                    <td>{new Date(b.generated_at).toLocaleDateString()}</td>
                    <td>{b.printed ? '✔ Yes' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </main>
    </>
  )
}
