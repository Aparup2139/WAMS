import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import Login from './pages/Login'

import DealerDashboard   from './pages/dealer/DealerDashboard'
import PlaceOrder        from './pages/dealer/PlaceOrder'
import MyOrders          from './pages/dealer/MyOrders'
import MyBills           from './pages/dealer/MyBills'

import AdminDashboard    from './pages/admin/AdminDashboard'
import ManageParts       from './pages/admin/ManageParts'
import ManageOrders      from './pages/admin/ManageOrders'
import ManageQuotations  from './pages/admin/ManageQuotations'
import ManageUsers       from './pages/admin/ManageUsers'
import GenerateReports   from './pages/admin/GenerateReports'
import AdminLogs         from './pages/admin/AdminLogs'

import SupplierDashboard from './pages/supplier/SupplierDashboard'
import SubmitQuotation   from './pages/supplier/SubmitQuotation'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Dealer routes */}
          <Route path="/dealer" element={<ProtectedRoute role="Dealer"><DealerDashboard /></ProtectedRoute>} />
          <Route path="/dealer/place-order" element={<ProtectedRoute role="Dealer"><PlaceOrder /></ProtectedRoute>} />
          <Route path="/dealer/orders"      element={<ProtectedRoute role="Dealer"><MyOrders /></ProtectedRoute>} />
          <Route path="/dealer/bills"       element={<ProtectedRoute role="Dealer"><MyBills /></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin"             element={<ProtectedRoute role="Admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/parts"       element={<ProtectedRoute role="Admin"><ManageParts /></ProtectedRoute>} />
          <Route path="/admin/orders"      element={<ProtectedRoute role="Admin"><ManageOrders /></ProtectedRoute>} />
          <Route path="/admin/quotations"  element={<ProtectedRoute role="Admin"><ManageQuotations /></ProtectedRoute>} />
          <Route path="/admin/users"       element={<ProtectedRoute role="Admin"><ManageUsers /></ProtectedRoute>} />
          <Route path="/admin/reports"     element={<ProtectedRoute role="Admin"><GenerateReports /></ProtectedRoute>} />
          <Route path="/admin/logs"        element={<ProtectedRoute role="Admin"><AdminLogs /></ProtectedRoute>} />

          {/* Supplier routes */}
          <Route path="/supplier"        element={<ProtectedRoute role="Supplier"><SupplierDashboard /></ProtectedRoute>} />
          <Route path="/supplier/submit" element={<ProtectedRoute role="Supplier"><SubmitQuotation /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
