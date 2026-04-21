import { useEffect, useState } from 'react'
import api from '../../api/client'
import Navbar from '../../components/Navbar'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function GenerateReports() {
  const [report, setReport] = useState(null)

  useEffect(() => {
    api.get('/admin/reports').then(r => setReport(r.data))
  }, [])

  if (!report) return <><Navbar /><LoadingSpinner message="Generating reports…" /></>

  const { inventory_summary, low_stock_parts, order_counts, quotation_counts, total_revenue, user_counts } = report

  return (
    <>
      <Navbar />
      <main className="page-content">
        <h1 className="page-title">System Reports</h1>

        {/* Summary Stats */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-number">₹{total_revenue.toFixed(2)}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{low_stock_parts.length}</div>
            <div className="stat-label">Low Stock Items</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{order_counts.Fulfilled}</div>
            <div className="stat-label">Fulfilled Orders</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{quotation_counts.Accepted}</div>
            <div className="stat-label">Accepted Quotations</div>
          </div>
        </div>

        {/* Orders by Status */}
        <h2 className="section-title">Orders by Status</h2>
        <div className="report-row">
          {Object.entries(order_counts).map(([status, count]) => (
            <div key={status} className="report-pill">
              <span className="report-pill-label">{status}</span>
              <span className="report-pill-value">{count}</span>
            </div>
          ))}
        </div>

        {/* Quotations by Status */}
        <h2 className="section-title">Quotations by Status</h2>
        <div className="report-row">
          {Object.entries(quotation_counts).map(([status, count]) => (
            <div key={status} className="report-pill">
              <span className="report-pill-label">{status}</span>
              <span className="report-pill-value">{count}</span>
            </div>
          ))}
        </div>

        {/* Users by Role */}
        <h2 className="section-title">Users by Role</h2>
        <div className="report-row">
          {Object.entries(user_counts).map(([role, count]) => (
            <div key={role} className="report-pill">
              <span className="report-pill-label">{role}</span>
              <span className="report-pill-value">{count}</span>
            </div>
          ))}
        </div>

        {/* Low Stock Alert */}
        {low_stock_parts.length > 0 && (
          <>
            <h2 className="section-title" style={{ color: '#dc3545' }}>⚠ Low Stock Parts</h2>
            <table className="data-table">
              <thead>
                <tr><th>Part</th><th>Category</th><th>In Stock</th><th>Reorder Level</th></tr>
              </thead>
              <tbody>
                {low_stock_parts.map(p => (
                  <tr key={p.id} className="row-warn">
                    <td>{p.part_name}</td>
                    <td>{p.category || '—'}</td>
                    <td style={{ color: '#dc3545', fontWeight: 600 }}>{p.quantity_in_stock}</td>
                    <td>{p.reorder_level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* Full Inventory */}
        <h2 className="section-title">Full Inventory</h2>
        <table className="data-table">
          <thead>
            <tr><th>#</th><th>Part Name</th><th>Category</th><th>In Stock</th><th>Reorder At</th><th>Unit</th><th>Last Updated</th></tr>
          </thead>
          <tbody>
            {inventory_summary.map(p => (
              <tr key={p.id} className={p.quantity_in_stock <= p.reorder_level ? 'row-warn' : ''}>
                <td>{p.id}</td>
                <td>{p.part_name}</td>
                <td>{p.category || '—'}</td>
                <td>{p.quantity_in_stock}</td>
                <td>{p.reorder_level}</td>
                <td>{p.unit_of_measure}</td>
                <td>{p.last_updated ? new Date(p.last_updated).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </>
  )
}
