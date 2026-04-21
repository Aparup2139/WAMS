import { useEffect, useState } from 'react'
import api from '../../api/client'
import Navbar from '../../components/Navbar'
import LoadingSpinner from '../../components/LoadingSpinner'
import Modal from '../../components/Modal'

const EMPTY_FORM = {
  part_name: '', description: '', category: '',
  quantity_in_stock: '', reorder_level: '10', unit_of_measure: 'pieces',
}

export default function ManageParts() {
  const [parts, setParts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)   // null | 'add' | 'edit'
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => api.get('/parts').then(r => { setParts(r.data); setLoading(false) })
  useEffect(() => { load() }, [])

  const openAdd = () => { setForm(EMPTY_FORM); setError(''); setModal('add') }
  const openEdit = (p) => {
    setEditTarget(p)
    setForm({
      part_name: p.part_name, description: p.description || '',
      category: p.category || '', quantity_in_stock: String(p.quantity_in_stock),
      reorder_level: String(p.reorder_level), unit_of_measure: p.unit_of_measure,
    })
    setError('')
    setModal('edit')
  }
  const closeModal = () => { setModal(null); setEditTarget(null) }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...form,
        quantity_in_stock: Number(form.quantity_in_stock),
        reorder_level: Number(form.reorder_level),
      }
      if (modal === 'add') {
        await api.post('/parts', payload)
      } else {
        await api.put(`/parts/${editTarget.id}`, payload)
      }
      closeModal()
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const f = (k) => ({ value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) })

  if (loading) return <><Navbar /><LoadingSpinner /></>

  return (
    <>
      <Navbar />
      <main className="page-content">
        <div className="section-header">
          <h1 className="page-title">Manage Parts</h1>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Part</button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>#</th><th>Part Name</th><th>Category</th>
              <th>In Stock</th><th>Reorder At</th><th>Unit</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {parts.map(p => (
              <tr key={p.id} className={p.quantity_in_stock <= p.reorder_level ? 'row-warn' : ''}>
                <td>{p.id}</td>
                <td>{p.part_name}</td>
                <td>{p.category || '—'}</td>
                <td>
                  {p.quantity_in_stock <= p.reorder_level
                    ? <span style={{ color: '#dc3545', fontWeight: 600 }}>{p.quantity_in_stock} ⚠</span>
                    : p.quantity_in_stock}
                </td>
                <td>{p.reorder_level}</td>
                <td>{p.unit_of_measure}</td>
                <td>
                  <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>

      {modal && (
        <Modal title={modal === 'add' ? 'Add New Part' : 'Edit Part'} onClose={closeModal}>
          <form onSubmit={handleSave}>
            <div className="form-group"><label>Part Name</label>
              <input className="form-input" {...f('part_name')} required /></div>
            <div className="form-group"><label>Description</label>
              <textarea className="form-input" rows={2} {...f('description')} /></div>
            <div className="form-row">
              <div className="form-group"><label>Category</label>
                <input className="form-input" {...f('category')} /></div>
              <div className="form-group"><label>Unit of Measure</label>
                <input className="form-input" {...f('unit_of_measure')} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Quantity in Stock</label>
                <input className="form-input" type="number" min="0" {...f('quantity_in_stock')} /></div>
              <div className="form-group"><label>Reorder Level</label>
                <input className="form-input" type="number" min="0" {...f('reorder_level')} /></div>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}
