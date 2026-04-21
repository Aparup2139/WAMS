import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'
import Navbar from '../../components/Navbar'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function SubmitQuotation() {
  const navigate = useNavigate()
  const [parts, setParts] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    part_id: '', unit_price: '', quantity_offered: '', terms: '', expiry_date: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    api.get('/parts').then(r => { setParts(r.data); setLoading(false) })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)
    try {
      const payload = {
        part_id: Number(form.part_id),
        unit_price: parseFloat(form.unit_price),
        quantity_offered: Number(form.quantity_offered),
        terms: form.terms,
        expiry_date: form.expiry_date || undefined,
      }
      const { data } = await api.post('/quotations', payload)
      setSuccess(`Quotation #${data.quotation.id} submitted successfully! Awaiting admin review.`)
      setForm({ part_id: '', unit_price: '', quantity_offered: '', terms: '', expiry_date: '' })
      setTimeout(() => navigate('/supplier'), 1800)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit quotation')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <><Navbar /><LoadingSpinner /></>

  return (
    <>
      <Navbar />
      <main className="page-content">
        <h1 className="page-title">Submit Quotation</h1>

        <div className="form-card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Part</label>
              <select
                className="form-input"
                value={form.part_id}
                onChange={(e) => setForm({ ...form, part_id: e.target.value })}
                required
              >
                <option value="">— Select a part —</option>
                {parts.map(p => (
                  <option key={p.id} value={p.id}>{p.part_name} ({p.category})</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Unit Price (₹)</label>
                <input
                  type="number" step="0.01" min="0.01"
                  className="form-input"
                  placeholder="e.g. 250.00"
                  value={form.unit_price}
                  onChange={(e) => setForm({ ...form, unit_price: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Quantity Offered</label>
                <input
                  type="number" min="1"
                  className="form-input"
                  placeholder="e.g. 100"
                  value={form.quantity_offered}
                  onChange={(e) => setForm({ ...form, quantity_offered: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Terms & Conditions</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Delivery timeline, payment terms, etc."
                value={form.terms}
                onChange={(e) => setForm({ ...form, terms: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Expiry Date (optional)</label>
              <input
                type="date"
                className="form-input"
                value={form.expiry_date}
                onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
              />
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={() => navigate('/supplier')}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit Quotation'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  )
}
