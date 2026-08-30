import { useState } from "react"

/*
 * Heurística 10 (Ayuda y documentación): sección de Preguntas Frecuentes,
 * accesible desde el ícono "?" del navbar. Prioriza dudas del flujo de
 * Reservas y Pagos (Épica 4 y 5), que es lo que se evalúa con el SUS.
 */
const FAQS = [
  {
    q: "¿Por qué debo completar mi perfil antes de reservar?",
    a: "Necesitamos tus datos de contacto e identificación para gestionar la reserva y poder contactarte ante cualquier imprevisto con tu viaje.",
  },
  {
    q: "¿Qué pasa si no pago mi reserva?",
    a: "Las reservas pendientes de pago se liberan automáticamente después de 24 horas, devolviendo los cupos disponibles al paquete.",
  },
  {
    q: "¿Puedo pagar una reserva más de una vez?",
    a: "No. Cada reserva admite un solo pago. Una vez confirmado, la opción de pago deja de estar disponible y puedes ver tu comprobante.",
  },
  {
    q: "¿Qué es el CVV de mi tarjeta?",
    a: "Es el código de 3 dígitos ubicado en el reverso de tu tarjeta, usado como verificación de seguridad al pagar.",
  },
  {
    q: "¿Cómo se calculan los descuentos de mi reserva?",
    a: "Se aplican automáticamente según la cantidad de pasajeros, tu historial de reservas y las promociones vigentes. El detalle se muestra antes de confirmar el pago.",
  },
  {
    q: "¿Puedo cancelar una reserva que ya hice?",
    a: "Sí, mientras esté en estado Pendiente. Ve a \"Mis reservas\" y usa la opción Cancelar.",
  },
]

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: "1px solid #eee" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", background: "none", border: "none", textAlign: "left",
          padding: "14px 4px", cursor: "pointer",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          fontSize: 14, fontWeight: 500, color: "#0A2540",
        }}
      >
        {q}
        <span style={{ color: "#F58426", fontSize: 18, transform: open ? "rotate(45deg)" : "none", transition: "transform 0.15s" }}>+</span>
      </button>
      {open && (
        <p style={{ margin: "0 4px 14px", color: "#64748b", fontSize: 13, lineHeight: 1.6 }}>{a}</p>
      )}
    </div>
  )
}

export default function FaqModal({ open, onClose }) {
  if (!open) return null
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(10,37,64,0.75)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 20, padding: "28px 28px 12px",
          maxWidth: 480, width: "100%", maxHeight: "80vh", overflowY: "auto",
          boxShadow: "0 32px 80px rgba(0,0,0,0.30)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0A2540" }}>Preguntas frecuentes</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#888" }}>×</button>
        </div>
        {FAQS.map(item => <FaqItem key={item.q} {...item} />)}
      </div>
    </div>
  )
}
