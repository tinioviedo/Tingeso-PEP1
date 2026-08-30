import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useKeycloak } from "@react-keycloak/web"
import packageService from "../services/package.service"
import reservationService from "../services/reservation.service"
import clientService from "../services/client.service"
import HelpTooltip from "../components/HelpTooltip"

const SuccessOverlay = ({ data, onGo }) => {
  const [count, setCount] = useState(5)

  useEffect(() => {
    if (count === 0) { onGo(); return }
    const t = setTimeout(() => setCount(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [count])

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(10,37,64,0.75)",
      backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <div style={{
        background: "#fff", borderRadius: 20, padding: "48px 40px",
        maxWidth: 480, width: "100%", textAlign: "center",
        boxShadow: "0 32px 80px rgba(0,0,0,0.30)",
        animation: "fadeUp 0.35s ease",
      }}>
        {/* Checkmark */}
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "linear-gradient(135deg, #3B6D11, #5a9e1a)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
          boxShadow: "0 8px 24px rgba(59,109,17,0.35)",
        }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 700, color: "#0A2540" }}>
          ¡Reserva confirmada!
        </h2>
        <p style={{ margin: "0 0 20px", color: "#64748b", fontSize: 14, lineHeight: 1.6 }}>
          Tu reserva fue creada exitosamente.
        </p>

        {/* Totals */}
        <div style={{
          background: "#f8fafc", borderRadius: 12, padding: "20px 22px",
          marginBottom: 20, textAlign: "left",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: data.discounts ? 14 : 0 }}>
            <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>Total a pagar</span>
            <span style={{ fontWeight: 700, color: "#006BB6", fontSize: 22, letterSpacing: -0.5 }}>
              US$ {data.total?.toLocaleString()}
            </span>
          </div>
          {data.discounts && (
            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 12 }}>
              <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 6 }}>
                Descuentos aplicados
              </div>
              <div style={{ fontSize: 13, color: "#3B6D11", lineHeight: 1.6 }}>
                {data.discounts}
              </div>
            </div>
          )}
        </div>

        {/* Countdown */}
        <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>
          Redirigiendo a Mis reservas en{" "}
          <span style={{ fontWeight: 700, color: "#F58426", fontSize: 16 }}>{count}s</span>
        </p>

        <button
          onClick={onGo}
          style={{
            width: "100%", background: "#F58426", color: "#fff",
            border: "none", padding: "14px 0", borderRadius: 10,
            fontSize: 15, fontWeight: 600, cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#ea6500"}
          onMouseLeave={e => e.currentTarget.style.background = "#F58426"}
        >
          Ver mis reservas →
        </button>
      </div>
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(30px) } to { opacity:1; transform:translateY(0) } }`}</style>
    </div>
  )
}

const PackageDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { keycloak } = useKeycloak()
  const [pkg, setPkg] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [companions, setCompanions] = useState([])
  // Identificador estable por acompañante: se usa como key de React para que
  // los campos no se mezclen al agregar o quitar pasajeros.
  const nextCompanionId = useRef(0)
  const [loading, setLoading] = useState(true)
  const [reserving, setReserving] = useState(false)
  const [reservationData, setReservationData] = useState(null)
  const [error, setError] = useState("")
  const [clientId, setClientId] = useState(null)
  const [quote, setQuote] = useState(null) // { discountAmount, totalAmount, appliedDiscounts } — cotización REAL del backend

  useEffect(() => {
    packageService.getById(id)
      .then(res => setPkg(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [id])

  // Averigua el clientId una sola vez, si el usuario está logueado y tiene perfil.
  useEffect(() => {
    const email = keycloak.tokenParsed?.email
    if (!keycloak.authenticated || !email) return
    clientService.getByEmail(email)
      .then(res => setClientId(res.data.id))
      .catch(() => setClientId(null)) // perfil incompleto — se resuelve al confirmar, como antes
  }, [keycloak.authenticated])

  // Cotización real (con descuentos) cada vez que cambia la cantidad de pasajeros.
  // Reemplaza el cálculo hardcodeado que no coincidía con los descuentos reales.
  useEffect(() => {
    if (!clientId || !pkg) { setQuote(null); return }
    reservationService.quote(clientId, pkg.id, quantity)
      .then(res => setQuote(res.data))
      .catch(() => setQuote(null))
  }, [clientId, pkg, quantity])

  const rutRegex = /^\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]$/

  // Devuelve el mensaje del primer acompañante inválido, o null si todos están correctos.
  const validateCompanions = () => {
    if (quantity <= 1) return null
    for (let i = 0; i < companions.length; i++) {
      const c = companions[i]
      if (!c.name.trim()) return `Ingresa el nombre del acompañante ${i + 1}.`
      if (!c.rut.trim()) return `Ingresa el RUT del acompañante ${i + 1}.`
      if (!rutRegex.test(c.rut.trim())) {
        return `RUT del acompañante ${i + 1} no es válido. Usa el formato 12.345.678-9`
      }
    }
    return null
  }

  // Un 400/404 al crear la reserva significa que el cliente aún no tiene perfil completo.
  const reservationErrorMessage = (err) => {
    const status = err.response?.status
    if (status === 404 || status === 400) {
      return <span>Debes completar todos tus datos en <span onClick={() => navigate("/profile")} style={{ textDecoration: "underline", cursor: "pointer", fontWeight: 700 }}>Mi perfil</span> antes de realizar una reserva.</span>
    }
    return err.response?.data?.message || "Error al crear la reserva."
  }

  const handleReserve = () => {
    setError("")
    const email = keycloak.tokenParsed?.email
    if (!email) { setError("No se pudo identificar al usuario. Por favor inicia sesión nuevamente."); return }

    const companionError = validateCompanions()
    if (companionError) { setError(companionError); return }

    setReserving(true)
    const companionsStr = companions
      .filter(c => c.name.trim() || c.rut.trim())
      .map(c => `${c.name.trim()} (${c.rut.trim()})`)
      .join("; ") || null

    clientService.getByEmail(email)
      .then(res => {
        const clientId = res.data.id
        return reservationService.create({ clientId, packageId: parseInt(id), quantity, companions: companionsStr })
      })
      .then(res => {
        setReservationData({
          total: res.data.totalAmount,
          discounts: res.data.appliedDiscounts || null,
        })
      })
      .catch(err => setError(reservationErrorMessage(err)))
      .finally(() => setReserving(false))
  }

  if (loading) return <p style={{ color: "#888", padding: 24 }}>Cargando...</p>
  if (!pkg) return <p style={{ color: "#888", padding: 24 }}>Paquete no encontrado.</p>

  const baseAmount = pkg.price * quantity
  // Mientras no haya cotización del backend (cargando, o usuario sin perfil/no logueado
  // todavía), se muestra el monto base sin descuento — nunca se inventa un porcentaje.
  const estimatedTotal = quote ? quote.totalAmount : baseAmount
  const isAvailable = pkg.packageStatus === "AVAILABLE"

  // Texto del botón de reserva según el estado actual de la operación.
  let reserveLabel = "No disponible"
  if (reserving) reserveLabel = "Procesando..."
  else if (isAvailable) reserveLabel = "Reservar ahora"

  const loginLabel = isAvailable ? "Inicia sesión para reservar" : "No disponible"

  // Ambos botones (invitado y autenticado) comparten exactamente el mismo estilo.
  const reserveButtonStyle = {
    width: "100%", background: isAvailable ? "#F58426" : "#ccc",
    color: "#fff", border: "none", padding: "14px 0", borderRadius: 10,
    fontSize: 15, fontWeight: 500, cursor: isAvailable ? "pointer" : "not-allowed",
  }

  return (
    <div style={{ margin: "-24px 0" }}>

      {/* Overlay de éxito */}
      {reservationData && (
        <SuccessOverlay
          data={reservationData}
          onGo={() => navigate("/my-reservations")}
        />
      )}

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
            <div style={{ color: "#fff", fontSize: 36, fontWeight: 500 }}>US$ {pkg.price.toLocaleString()}</div>
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
              {{ AVAILABLE: "Disponible", SOLD_OUT: "Agotado", NOT_VALID: "No vigente", CANCELLED: "Cancelado" }[pkg.packageStatus] || pkg.packageStatus}
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
              <button onClick={() => {
                const next = Math.max(1, quantity - 1)
                setQuantity(next)
                setCompanions(c => c.slice(0, next - 1))
              }} style={{
                width: 32, height: 32, borderRadius: "50%", border: "1px solid #ddd",
                background: "#fff", cursor: "pointer", fontSize: 18, fontWeight: 300
              }}>−</button>
              <span style={{ fontSize: 18, fontWeight: 500, minWidth: 28, textAlign: "center" }}>{quantity}</span>
              <button onClick={() => {
                const next = Math.min(pkg.availableSlots, quantity + 1)
                setQuantity(next)
                setCompanions(c => {
                  const arr = [...c]
                  while (arr.length < next - 1) {
                    nextCompanionId.current += 1
                    arr.push({ id: nextCompanionId.current, name: "", rut: "" })
                  }
                  return arr
                })
              }} style={{
                width: 32, height: 32, borderRadius: "50%", border: "none",
                background: "#006BB6", color: "#fff", cursor: "pointer", fontSize: 18, fontWeight: 300
              }}>+</button>
            </div>
            {quote?.discountAmount > 0 && (
              <div style={{ marginTop: 10, fontSize: 12, color: "#3B6D11", background: "#EAF3DE", padding: "6px 10px", borderRadius: 6 }}>
                ¡Descuento aplicado!
              </div>
            )}
          </div>

          {/* Acompañantes — solo si hay más de 1 pasajero */}
          {quantity > 1 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 10, fontWeight: 500 }}>DATOS DE ACOMPAÑANTES<HelpTooltip text="Necesitamos el nombre y RUT de cada pasajero adicional para completar su registro en el paquete" /></div>
              {companions.map((c, i) => (
                <div key={c.id} style={{ marginBottom: 10, background: "#f5f5f5", borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ fontSize: 11, color: "#888", marginBottom: 8 }}>Acompañante {i + 1}</div>
                  <input
                    value={c.name}
                    onChange={e => {
                      const letters = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, "")
                      setCompanions(arr => arr.map((x, j) => j === i ? { ...x, name: letters } : x))
                    }}
                    placeholder="Nombre completo"
                    style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid #ddd", fontSize: 13, marginBottom: 6, boxSizing: "border-box" }}
                  />
                  <input
                    value={c.rut}
                    onChange={e => setCompanions(arr => arr.map((x, j) => j === i ? { ...x, rut: e.target.value } : x))}
                    placeholder="RUT (ej: 12.345.678-9)"
                    style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: `1px solid ${c.rut && !/^\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]$/.test(c.rut.trim()) ? "#e53e3e" : "#ddd"}`, fontSize: 13, boxSizing: "border-box" }}
                  />
                </div>
              ))}
            </div>
          )}

          <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 16, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "5px 0", color: "#666" }}>
              <span>US$ {pkg.price.toLocaleString()} × {quantity}</span>
              <span>US$ {baseAmount.toLocaleString()}</span>
            </div>
            {quote?.discountAmount > 0 && (
              <div style={{ padding: "5px 0", color: "#3B6D11" }}>
                {quote.appliedDiscounts.split(", ").map(label => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 2 }}>
                    <span>{label}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 500 }}>
                  <span>Total descuento</span>
                  <span>−US$ {quote.discountAmount.toLocaleString()}</span>
                </div>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 500, padding: "12px 0", borderTop: "1px solid #eee", marginTop: 8 }}>
              <span>Total estimado</span>
              <span style={{ color: "#006BB6" }}>US$ {estimatedTotal.toLocaleString()}</span>
            </div>
          </div>

          <p style={{ fontSize: 11, color: "#aaa", marginBottom: 16, lineHeight: 1.5 }}>
            El monto final con todos los descuentos y promociones aplicables se mostrará al confirmar.
          </p>

          {error && <div style={{ background: "#FCEBEB", color: "#A32D2D", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 12 }}>{error}</div>}

          {!keycloak.authenticated ? (
            <button onClick={() => keycloak.login()} disabled={!isAvailable} style={reserveButtonStyle}>
              {loginLabel}
            </button>
          ) : (
            <button onClick={handleReserve} disabled={reserving || !isAvailable} style={reserveButtonStyle}>
              {reserveLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default PackageDetail
