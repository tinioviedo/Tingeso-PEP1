import { useNavigate, useLocation, Outlet } from "react-router-dom"

const adminTabs = [
  { label: "Paquetes",   path: "/admin/packages" },
  { label: "Clientes",   path: "/admin/clients" },
  { label: "Reservas",   path: "/admin/reservations" },
  { label: "Descuentos", path: "/admin/discounts" },
  { label: "Promociones",path: "/admin/promotions" },
  { label: "Reportes",   path: "/admin/reports" },
]

const AdminLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div>
      {/* Sub-header */}
      <div style={{
        background: "#EDF2F7",
        borderBottom: "1px solid #cbd5e1",
        marginTop: -24,
        marginBottom: 32,
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          padding: "0 32px",
          display: "flex", alignItems: "center", gap: 4,
        }}>
          <span style={{
            color: "#94a3b8",
            fontSize: 11, fontWeight: 700,
            letterSpacing: 1.2, textTransform: "uppercase",
            paddingRight: 20,
            borderRight: "1px solid #e2e8f0",
            marginRight: 8,
            paddingTop: 16, paddingBottom: 16,
          }}>
            Admin
          </span>
          {adminTabs.map(tab => {
            const active = location.pathname === tab.path
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                style={{
                  background: "none", border: "none",
                  color: active ? "#0A2540" : "#64748b",
                  fontSize: 14, fontWeight: active ? 600 : 400,
                  cursor: "pointer", padding: "16px 14px",
                  fontFamily: "'Poppins', sans-serif",
                  borderBottom: active ? "2px solid #F97316" : "2px solid transparent",
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.color = "#0A2540" }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.color = "#64748b" }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Page content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>
        <Outlet />
      </div>
    </div>
  )
}

export default AdminLayout
