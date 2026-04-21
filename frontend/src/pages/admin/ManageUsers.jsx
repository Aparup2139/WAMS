import { useEffect, useState } from 'react'
import api from '../../api/client'
import Navbar from '../../components/Navbar'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useAuth } from '../../context/AuthContext'

const ROLES = ['Admin', 'Supplier', 'Dealer']

export default function ManageUsers() {
  const { user: me } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(null)
  const [error, setError] = useState('')

  const load = () => api.get('/admin/users').then(r => { setUsers(r.data); setLoading(false) })
  useEffect(() => { load() }, [])

  const changeRole = async (uid, role) => {
    setSaving(uid)
    setError('')
    try {
      await api.put(`/admin/users/${uid}/role`, { role })
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update role')
    } finally {
      setSaving(null)
    }
  }

  if (loading) return <><Navbar /><LoadingSpinner /></>

  return (
    <>
      <Navbar />
      <main className="page-content">
        <h1 className="page-title">Manage Users</h1>
        {error && <div className="alert alert-error">{error}</div>}

        <table className="data-table">
          <thead>
            <tr>
              <th>#</th><th>Username</th><th>Email</th>
              <th>Role</th><th>Created</th><th>Last Login</th><th>Change Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className={u.id === me.id ? 'row-highlight' : ''}>
                <td>{u.id}</td>
                <td>{u.username} {u.id === me.id && <span className="badge-you">you</span>}</td>
                <td>{u.email}</td>
                <td><span className={`role-tag role-${u.role.toLowerCase()}`}>{u.role}</span></td>
                <td>{new Date(u.created_at).toLocaleDateString()}</td>
                <td>{u.last_login ? new Date(u.last_login).toLocaleString() : '—'}</td>
                <td>
                  {u.id !== me.id && (
                    <select
                      className="form-input form-input-sm"
                      value={u.role}
                      disabled={saving === u.id}
                      onChange={(e) => changeRole(u.id, e.target.value)}
                    >
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </>
  )
}
