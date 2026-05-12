import { useNavigate } from "react-router-dom"

const cards = [
  {
    icon: "🧳",
    title: "Gestionar paquetes",
    desc: "Crea, edita y administra el catálogo de paquetes turísticos.",
    path: "/admin/packages",
    color: "#0A2540",
  },
  {
    icon: "👥",
    title: "Gestionar clientes",
    desc: "Visualiza y administra las cuentas de clientes registrados.",
    path: "/admin/clients",
    color: "#0A2540",
  },
  {
    icon: "📋",
    title: "Todas las reservas",
    desc: "Revisa y gestiona todas las reservas del sistema.",
    path: "/admin/reservations",
    color: "#0A2540",
  },
  {
    icon: "🏷️",
    title: "Descuentos",
    desc: "Configura descuentos por grupo, cliente frecuente y múltiples paquetes.",
    path: "/admin/discounts",
    color: "#0A2540",
  },
  {
    icon: "🎉",
    title: "Promociones",
    desc: "Crea y gestiona promociones por tiempo limitado.",
    path: "/admin/promotions",
    color: "#0A2540",
  },
  {
    icon: "📊",
    title: "Reportes",
    desc: "Genera reportes de ventas por período y ranking de paquetes.",
    path: "/admin/reports",
    color: "#0A2540",
  },
]

const AdminDashboard = () => {
  const navigate = useNavigate()

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: 26, fontWeight: 700,
          color: "#0A2540", margin: "0 0 6px",
        }}>
          Panel de Administración
        </h2>
        <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>
          Selecciona una sección para gestionar
        </p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 20,
      }}>
        {cards.map(card => (
          <AdminCard key={card.path} card={card} onClick={() => navigate(card.path)} />
        ))}
      </div>
    </div>
  )
}

const AdminCard = ({ card, onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        background: "#fff",
        border: "1.5px solid #e2e8f0",
        borderRadius: 14,
        padding: "28px 24px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "#0A2540"
        e.currentTarget.style.boxShadow = "0 8px 30px rgba(10,37,64,0.12)"
        e.currentTarget.style.transform = "translateY(-3px)"
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "#e2e8f0"
        e.currentTarget.style.boxShadow = "none"
        e.currentTarget.style.transform = "translateY(0)"
      }}
    >
      <div style={{ fontSize: 36, marginBottom: 14 }}>{card.icon}</div>
      <div style={{
        fontSize: 16, fontWeight: 700,
        color: "#0A2540", marginBottom: 8,
        fontFamily: "'Poppins', sans-serif",
      }}>
        {card.title}
      </div>
      <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>
        {card.desc}
      </div>
      <div style={{
        position: "absolute", bottom: 20, right: 20,
        fontSize: 18, color: "#cbd5e1",
      }}>
        →
      </div>
    </div>
  )
}

export default AdminDashboard
