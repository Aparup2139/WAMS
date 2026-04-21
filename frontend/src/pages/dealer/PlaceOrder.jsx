import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'
import Navbar from '../../components/Navbar'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function PlaceOrder() {
  const navigate = useNavigate()
  const [parts, setParts] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ part_id: '', quantity_ordered: '', delivery_address: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    api.get('/parts').then(r => { setParts(r.data); setLoading(false) })
  }, [])

  const selectedPart = parts.find(p => p.id === Number(form.part_id))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)
    try {
      const payload = {
        part_id: Number(form.part_id),
        quantity_ordered: Number(form.quantity_ordered),
        delivery_address: form.delivery_address,
      }
      const { data } = await api.post('/orders', payload)
      setSuccess(`Order #${data.order.id} placed successfully!`)
      setForm({ part_id: '', quantity_ordered: '', delivery_address: '' })
      setTimeout(() => navigate('/dealer/orders'), 1500)
    } catch (err) {
      const d = err.response?.data
      if (d?.inventory_check === 'failed') {
        setError(`Insufficient stock. Available: ${d.available}, Requested: ${d.requested}`)
      } else {
        setError(d?.error || 'Failed to place order')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <><Navbar /><LoadingSpinner /></>

  return (
    <>
      <Navbar />
      <main className="page-content">
        <h1 className="page-title">Place New Order</h1>

        <div className="form-card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Select Part</label>
              <select
                className="form-input"
                value={form.part_id}
                onChange={(e) => setForm({ ...form, part_id: e.target.value })}
                required
              >
                <option value="">— Choose a part —</option>
                {parts.map(p => (
                  <option key={p.id} value={p.id} disabled={p.quantity_in_stock === 0}>
                    {p.part_name} ({p.category}) — Stock: {p.quantity_in_stock}
                  </option>
                ))}
              </select>
            </div>

            {selectedPart && (
              <div className="info-box">
                <strong>{selectedPart.part_name}</strong>
                <p>{selectedPart.description}</p>
                <p>In stock: <strong>{selectedPart.quantity_in_stock} {selectedPart.unit_of_measure}</strong></p>
              </div>
            )}

            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                className="form-input"
                placeholder="Enter quantity"
                min="1"
                max={selectedPart?.quantity_in_stock || 9999}
                value={form.quantity_ordered}
                onChange={(e) => setForm({ ...form, quantity_ordered: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Delivery Address</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Full delivery address"
                value={form.delivery_address}
                onChange={(e) => setForm({ ...form, delivery_address: e.target.value })}
                required
              />
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={() => navigate('/dealer')}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Placing…' : 'Place Order'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  )
}
