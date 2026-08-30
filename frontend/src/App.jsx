import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import { useKeycloak } from "@react-keycloak/web"
import Navbar from "./components/Navbar"
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import AvailablePackages from './pages/AvailablePackages'
import PackageDetail from './pages/PackageDetail'
import MyReservations from './pages/MyReservations'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'
import AdminPackages from './pages/AdminPackages'
import AdminClients from './pages/AdminClients'
import AdminReservations from './pages/AdminReservations'
import AdminDiscounts from './pages/AdminDiscounts'
import AdminPromotions from './pages/AdminPromotions'
import AdminReports from './pages/AdminReports'
import AdminLayout from './components/AdminLayout'
import RegisterProfile from './pages/RegisterProfile'

// Definido a nivel de módulo (no dentro de App) para que React no lo recree en
// cada render: obtiene la sesión por su propio hook en lugar del closure padre.
const PrivateRoute = ({ element, rolesAllowed }) => {
  const { keycloak } = useKeycloak()

  if (!keycloak.authenticated) {
    keycloak.login()
    return null
  }

  const roles = keycloak.tokenParsed?.realm_access?.roles || []
  if (rolesAllowed && !rolesAllowed.some(r => roles.includes(r))) {
    return <h2>No tienes permiso para ver esta página.</h2>
  }
  return element
}

function App() {
  const { initialized } = useKeycloak()

  if (!initialized) return <div>Loading...</div>

  return (
    <Router>
      <div style={{ fontFamily: "'Poppins', sans-serif" }}>
        <Navbar />
        <div style={{ padding: '24px 0' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/packages" element={<AvailablePackages />} />
            <Route path="/packages/:id" element={<PackageDetail />} />
            <Route path="/my-reservations" element={<PrivateRoute element={<MyReservations />} rolesAllowed={["USER", "ADMIN"]} />} />
            <Route path="/profile" element={<PrivateRoute element={<Profile />} rolesAllowed={["USER", "ADMIN"]} />} />
            <Route path="/admin" element={<PrivateRoute element={<AdminLayout />} rolesAllowed={["ADMIN"]} />}>
              <Route index element={<Navigate to="/admin/packages" replace />} />
              <Route path="packages" element={<AdminPackages />} />
              <Route path="clients" element={<AdminClients />} />
              <Route path="reservations" element={<AdminReservations />} />
              <Route path="discounts" element={<AdminDiscounts />} />
              <Route path="promotions" element={<AdminPromotions />} />
              <Route path="reports" element={<AdminReports />} />
            </Route>
            <Route path="/register-profile" element={<RegisterProfile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App