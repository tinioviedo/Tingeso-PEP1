import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import { useKeycloak } from "@react-keycloak/web"
import Navbar from "./components/Navbar"
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import AvailablePackages from './pages/AvailablePackages'
import PackageDetail from './pages/PackageDetail'
import MyReservations from './pages/MyReservations'
import Profile from './pages/Profile'
import AdminPackages from './pages/AdminPackages'
import AdminClients from './pages/AdminClients'
import AdminReservations from './pages/AdminReservations'
import AdminDiscounts from './pages/AdminDiscounts'
import AdminPromotions from './pages/AdminPromotions'
import AdminReports from './pages/AdminReports'
import RegisterProfile from './pages/RegisterProfile'

function App() {
  const { keycloak, initialized } = useKeycloak()

  if (!initialized) return <div>Loading...</div>

  const isLoggedIn = keycloak.authenticated
  const roles = keycloak.tokenParsed?.realm_access?.roles || []

  const PrivateRoute = ({ element, rolesAllowed }) => {
    if (!isLoggedIn) {
      keycloak.login()
      return null
    }
    if (rolesAllowed && !rolesAllowed.some(r => roles.includes(r))) {
      return <h2>No tienes permiso para ver esta página.</h2>
    }
    return element
  }

  if (!isLoggedIn) {
    keycloak.login()
    return null
  }

  return (
    <Router>
      <div style={{ fontFamily: 'sans-serif' }}>
        <Navbar />
        <div style={{ padding: '24px 0' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/packages" element={<PrivateRoute element={<AvailablePackages />} rolesAllowed={["USER", "ADMIN"]} />} />
            <Route path="/packages/:id" element={<PrivateRoute element={<PackageDetail />} rolesAllowed={["USER", "ADMIN"]} />} />
            <Route path="/my-reservations" element={<PrivateRoute element={<MyReservations />} rolesAllowed={["USER", "ADMIN"]} />} />
            <Route path="/profile" element={<PrivateRoute element={<Profile />} rolesAllowed={["USER", "ADMIN"]} />} />
            <Route path="/admin/packages" element={<PrivateRoute element={<AdminPackages />} rolesAllowed={["ADMIN"]} />} />
            <Route path="/admin/clients" element={<PrivateRoute element={<AdminClients />} rolesAllowed={["ADMIN"]} />} />
            <Route path="/admin/reservations" element={<PrivateRoute element={<AdminReservations />} rolesAllowed={["ADMIN"]} />} />
            <Route path="/admin/discounts" element={<PrivateRoute element={<AdminDiscounts />} rolesAllowed={["ADMIN"]} />} />
            <Route path="/admin/promotions" element={<PrivateRoute element={<AdminPromotions />} rolesAllowed={["ADMIN"]} />} />
            <Route path="/admin/reports" element={<PrivateRoute element={<AdminReports />} rolesAllowed={["ADMIN"]} />} />
            <Route path="/register-profile" element={<RegisterProfile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App