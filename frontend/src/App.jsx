import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import { useKeycloak } from "@react-keycloak/web"
import Navbar from "./components/Navbar"
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import AvailablePackages from './pages/AvailablePackages'
import PackageDetail from './pages/PackageDetail'

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
      return <h2>You don't have permission to view this page.</h2>
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
        <div style={{ padding: '24px' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/packages" element={<PrivateRoute element={<AvailablePackages />} rolesAllowed={["USER", "ADMIN"]} />} />
            <Route path="/packages/:id" element={<PrivateRoute element={<PackageDetail />} rolesAllowed={["USER", "ADMIN"]} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App