import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useKeycloak } from "@react-keycloak/web"
import packageService from "../services/package.service"
import reservationService from "../services/reservation.service"

const PackageDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { keycloak } = useKeycloak()
  const [pkg, setPkg] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [reserving, setReserving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    packageService.getById(id)
      .then(res => setPkg(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [id])

  const handleReserve = () => {
    setError("")
    setSuccess("")
    const clientId = keycloak.tokenParsed?.sub
    if (!clientId) { setError("No se pudo identificar al usuario. Por favor inicia sesión nuevamente."); return }
    setReserving(true)
    reservationService.create({ clientId, packageId: parseInt(id), quantity })
      .then(res => {
        setSuccess(`¡Reserva creada! Total: $${res.data.totalAmount.toLocaleString()}. ${res.data.appliedDiscounts ? "Descuentos: " + res.data.appliedDiscounts : ""}`)
        setTimeout(() => navigate("/my-reservations"), 2500)
      })
      .catch(err => setError(err.response?.data?.message || "Error al crear la reserva."))
      .finally(() => setReserving(false))
  }

  if (loading) return <p style={{ color: "#888", padding: 24 }}>Cargando...</p>
  if (!pkg) return <p style={{ color: "#888", padding: 24 }}>Paquete no encontrado.</p>

  const baseAmount = pkg.price * quantity
  const estimatedTotal = quantity >= 6 ? baseAmount * 0.90 : baseAmount

  return (
    <div style={{ margin: "-24px 0" }}>

      {/* Hero banner */}
      <div style={{
        background: "linear-gradient(135deg, #006BB6 0%, #004a80 60%, #F58426 100%)",
        height: 320, position: "relative", display: "flex", flexDirection: "column",
        justifyContent: "flex-end", padding: "32px 40px"
      }}>
        <button onClick={() => navigate(-1)} style={{
          position: "absolute", top: 24, left: 24, background: "rgba(255,255,255,0.2)",
          border: "1px solid rgba(255,255,255,0.4)", color: "#fff", borderRadius: 20,
          padding: "6px 16px", cursor: "pointer", fontSize: 13, backdropFilter: "blur(4px)"
        }}>← Volver</button>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
              {pkg.tripType}
            </div>
            <h1 style={{ color: "#fff", fontSize: 34, fontWeight: 500, margin: "0 0 6px" }}>
              {pkg.packageName}
            </h1>
            <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 15 }}>
              {pkg.destination}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 12 }}>desde</div>
            <div style={{ color: "#fff", fontSize: 36, fontWeight: 500 }}>${pkg.price.toLocaleString()}</div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 12 }}>por persona</div>
          </div>
        </div>
      </div>

      {/* Chips de info */}
      <div style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "14px 40px", display: "flex", gap: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div>
            <div style={{ fontSize: 10, color: "#888", textTransform: "uppercase" }}>Fechas</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{pkg.startDate} → {pkg.endDate}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div>
            <div style={{ fontSize: 10, color: "#888", textTransform: "uppercase" }}>Cupos disponibles</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{pkg.availableSlots} restantes</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div>
            <div style={{ fontSize: 10, color: "#888", textTransform: "uppercase" }}>Estado</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: pkg.packageStatus === "AVAILABLE" ? "#3B6D11" : "#A32D2D" }}>
              {pkg.packageStatus}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32, padding: "32px 40px" }}>

        {/* Info izquierda */}
        <div>
          <h3 style={{ fontWeight: 500, fontSize: 18, marginBottom: 12, marginTop: 0 }}>Sobre este paquete</h3>
          <p style={{ color: "#444", lineHeight: 1.8, marginBottom: 28, fontSize: 15 }}>{pkg.description}</p>

          {pkg.includedServices && (
            <div style={{ background: "#f0f7ff", borderRadius: 10, padding: "16px 20px", marginBottom: 20 }}>
              <h4 style={{ fontWeight: 500, color: "#006BB6", margin: "0 0 8px", fontSize: 14 }}>Servicios incluidos</h4>
              <p style={{ color: "#444", lineHeight: 1.7, margin: 0, fontSize: 14 }}>{pkg.includedServices}</p>
            </div>
          )}

          {pkg.conditions && (
            <div style={{ background: "#fffbf0", borderRadius: 10, padding: "16px 20px", border: "1px solid #f0e0b0" }}>
              <h4 style={{ fontWeight: 500, color: "#854F0B", margin: "0 0 8px", fontSize: 14 }}>Condiciones</h4>
              <p style={{ color: "#444", lineHeight: 1.7, margin: 0, fontSize: 14 }}>{pkg.conditions}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{
          background: "#fff", border: "1px solid #e5e5e5", borderRadius: 16,
          padding: 24, height: "fit-content", position: "sticky", top: 24,
          boxShadow: "0 2px 16px rgba(0,0,0,0.08)"
        }}>
          <div style={{ fontSize: 13, color: "#888", marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #f0f0f0" }}>
            Selecciona pasajeros y reserva
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 10, fontWeight: 500 }}>PASAJEROS</div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, background: "#f5f5f5", borderRadius: 10, padding: "10px 16px", width: "fit-content" }}>
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{
                width: 32, height: 32, borderRadius: "50%", border: "1px solid #ddd",
                background: "#fff", cursor: "pointer", fontSize: 18, fontWeight: 300
              }}>−</button>
              <span style={{ fontSize: 18, fontWeight: 500, minWidth: 28, textAlign: "center" }}>{quantity}</span>
              <button onClick={() => setQuantity(q => Math.min(pkg.availableSlots, q + 1))} style={{
                width: 32, height: 32, borderRadius: "50%", border: "none",
                background: "#006BB6", color: "#fff", cursor: "pointer", fontSize: 18, fontWeight: 300
              }}>+</button>
            </div>
            {quantity >= 6 && (
              <div style={{ marginTop: 10, fontSize: 12, color: "#3B6D11", background: "#EAF3DE", padding: "6px 10px", borderRadius: 6 }}>
                ¡Descuento grupal aplicado!
              </div>
            )}
          </div>

          <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 16, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "5px 0", color: "#666" }}>
              <span>${pkg.price.toLocaleString()} × {quantity}</span>
              <span>${baseAmount.toLocaleString()}</span>
            </div>
            {quantity >= 6 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "5px 0", color: "#3B6D11" }}>
                <span>Descuento grupal (10%)</span>
                <span>−${(baseAmount * 0.10).toLocaleString()}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 500, padding: "12px 0", borderTop: "1px solid #eee", marginTop: 8 }}>
              <span>Total estimado</span>
              <span style={{ color: "#006BB6" }}>${estimatedTotal.toLocaleString()}</span>
            </div>
          </div>

          <p style={{ fontSize: 11, color: "#aaa", marginBottom: 16, lineHeight: 1.5 }}>
            El monto final con todos los descuentos y promociones aplicables se mostrará al confirmar.
          </p>

          {error && <div style={{ background: "#FCEBEB", color: "#A32D2D", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 12 }}>{error}</div>}
          {success && <div style={{ background: "#EAF3DE", color: "#3B6D11", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 12 }}>{success}</div>}

          <button onClick={handleReserve} disabled={reserving || pkg.packageStatus !== "AVAILABLE"} style={{
            width: "100%", background: pkg.packageStatus === "AVAILABLE" ? "#F58426" : "#ccc",
            color: "#fff", border: "none", padding: "14px 0", borderRadius: 10,
            fontSize: 15, fontWeight: 500, cursor: pkg.packageStatus === "AVAILABLE" ? "pointer" : "not-allowed"
          }}>
            {reserving ? "Procesando..." : pkg.packageStatus === "AVAILABLE" ? "Reservar ahora" : "No disponible"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PackageDetail
