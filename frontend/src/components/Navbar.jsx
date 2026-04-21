import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_LINKS = {
  Dealer: [
    { to: '/dealer', label: 'Dashboard' },
    { to: '/dealer/place-order', label: 'Place Order' },
    { to: '/dealer/orders', label: 'My Orders' },
    { to: '/dealer/bills', label: 'My Bills' },
  ],
  Admin: [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/parts', label: 'Parts' },
    { to: '/admin/orders', label: 'Orders' },
    { to: '/admin/quotations', label: 'Quotations' },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/reports', label: 'Reports' },
    { to: '/admin/logs', label: 'Logs' },
  ],
  Supplier: [
    { to: '/supplier', label: 'Dashboard' },
    { to: '/supplier/submit', label: 'Submit Quotation' },
  ],
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const links = NAV_LINKS[user?.role] || []

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="navbar-logo">⚙</span>
        <span className="navbar-title">WAMS</span>
        <span className="navbar-role-badge">{user?.role}</span>
      </div>
      <ul className="navbar-links">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to}>{l.label}</Link>
          </li>
        ))}
      </ul>
      <div className="navbar-user">
        <span className="navbar-username">{user?.username}</span>
        <button className="btn btn-outline btn-sm" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  )
}
