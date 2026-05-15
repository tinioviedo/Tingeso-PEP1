import { useState, useEffect } from "react"
import { useKeycloak } from "@react-keycloak/web"
import reservationService from "../services/reservation.service"
import paymentService from "../services/payment.service"
import clientService from "../services/client.service"

const statusColors = {
    PENDING: { bg: "#FAEEDA", color: "#854F0B" },
    CONFIRMED: { bg: "#EAF3DE", color: "#3B6D11" },
    CANCELLED: { bg: "#FCEBEB", color: "#A32D2D" },
    EXPIRED: { bg: "#F1EFE8", color: "#5F5E5A" },
}

const MyReservations = () => {
    const { keycloak } = useKeycloak()
    const [reservations, setReservations] = useState([])
    const [loading, setLoading] = useState(true)
    const [payingId, setPayingId] = useState(null)
    const [paymentForm, setPaymentForm] = useState({ cardNumber: "", cardExpiration: "", cvv: "" })
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const email = keycloak.tokenParsed?.email

    const load = () => {
        clientService.getByEmail(email)
            .then(res => reservationService.getMyReservations(res.data.id))
            .then(res => setReservations(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }

    useEffect(() => { load() }, [])

    const handleCancel = (id) => {
        if (!window.confirm("¿Estás seguro de que quieres cancelar esta reserva?")) return
        reservationService.cancel(id)
            .then(() => { setSuccess("Reserva cancelada."); load() })
            .catch(err => setError(err.response?.data?.message || "Error al cancelar."))
    }

    const handlePay = (id) => {
        setError("")
        setSuccess("")
        const { cardNumber, cardExpiration, cvv } = paymentForm
        if (!cardNumber || !cardExpiration || !cvv) {
            setError("Por favor completa todos los campos de la tarjeta.")
            return
        }
        paymentService.processPayment({ reservationId: id, cardNumber, cardExpiration, cvv })
            .then(() => {
                setSuccess("¡Pago exitoso! Tu reserva está confirmada.")
                setPayingId(null)
                setPaymentForm({ cardNumber: "", cardExpiration: "", cvv: "" })
                load()
            })
            .catch(err => setError(err.response?.data?.message || "Error en el pago."))
    }

    if (loading) return <p style={{ color: "#888" }}>Cargando...</p>

    return (
        <div style={{ padding: "0 24px" }}>
            <h2 style={{ fontWeight: 500, marginBottom: 24 }}>Mis reservas</h2>

            {error && <div style={{ background: "#FCEBEB", color: "#A32D2D", padding: "10px 14px", borderRadius: 8, marginBottom: 16 }}>{error}</div>}
            {success && <div style={{ background: "#EAF3DE", color: "#3B6D11", padding: "10px 14px", borderRadius: 8, marginBottom: 16 }}>{success}</div>}

            {reservations.length === 0 && <p style={{ color: "#888" }}>Aún no tienes reservas.</p>}

            {reservations.map(res => (
                <div key={res.id} style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: 20, marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                                <h3 style={{ margin: 0, fontWeight: 500, fontSize: 17 }}>{res.travelPackage.packageName}</h3>
                                <span style={{
                                    fontSize: 11, padding: "3px 10px", borderRadius: 12, fontWeight: 500,
                                    background: statusColors[res.reservationStatus]?.bg,
                                    color: statusColors[res.reservationStatus]?.color
                                }}>{res.reservationStatus}</span>
                            </div>
                            <div style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>
                                {res.travelPackage.destination} · {res.travelPackage.startDate} → {res.travelPackage.endDate}
                            </div>
                            <div style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>
                                {res.quantity} pasajero{res.quantity > 1 ? "s" : ""}
                            </div>
                            {res.appliedDiscounts && (
                                <div style={{ fontSize: 12, color: "#3B6D11", marginBottom: 4 }}>
                                    {res.appliedDiscounts}
                                </div>
                            )}
                            <div style={{ fontSize: 13, color: "#444" }}>
                                Base: <span style={{ textDecoration: "line-through", color: "#999" }}>${res.baseAmount?.toLocaleString()}</span>
                                {" "}&nbsp; Total: <strong style={{ color: "#006BB6" }}>${res.totalAmount?.toLocaleString()}</strong>
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: 8, flexDirection: "column", alignItems: "flex-end" }}>
                            {res.reservationStatus === "PENDING" && (
                                <>
                                    <button onClick={() => { setPayingId(res.id); setError(""); setSuccess("") }}
                                        style={{ background: "#F58426", color: "#fff", border: "none", padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                                        Pagar ahora
                                    </button>
                                    <button onClick={() => handleCancel(res.id)}
                                        style={{ background: "#fff", color: "#A32D2D", border: "1px solid #A32D2D", padding: "8px 18px", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>
                                        Cancelar
                                    </button>
                                </>
                            )}
                            {res.reservationStatus === "CONFIRMED" && (
                                <span style={{ fontSize: 12, color: "#3B6D11" }}>Pagado</span>
                            )}
                        </div>
                    </div>

                    {/* Formulario de pago */}
                    {payingId === res.id && (
                        <div style={{ marginTop: 16, padding: 16, background: "#f9f9f9", borderRadius: 10, border: "1px solid #eee" }}>
                            <div style={{ fontWeight: 500, marginBottom: 12, fontSize: 14 }}>Datos de pago</div>
                            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
                                <div>
                                    <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>NÚMERO DE TARJETA</div>
                                    <input
                                        value={paymentForm.cardNumber}
                                        onChange={e => setPaymentForm(f => ({ ...f, cardNumber: e.target.value }))}
                                        placeholder="1234 5678 9012 3456"
                                        maxLength={16}
                                        style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box" }}
                                    />
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>VENCIMIENTO</div>
                                    <input
                                        value={paymentForm.cardExpiration}
                                        onChange={e => setPaymentForm(f => ({ ...f, cardExpiration: e.target.value }))}
                                        placeholder="MM/AA"
                                        maxLength={5}
                                        style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box" }}
                                    />
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>CVV</div>
                                    <input
                                        value={paymentForm.cvv}
                                        onChange={e => setPaymentForm(f => ({ ...f, cvv: e.target.value }))}
                                        placeholder="123"
                                        maxLength={3}
                                        style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box" }}
                                    />
                                </div>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div style={{ fontSize: 14, fontWeight: 500 }}>
                                    Total a pagar: <span style={{ color: "#006BB6" }}>${res.totalAmount?.toLocaleString()}</span>
                                </div>
                                <div style={{ display: "flex", gap: 8 }}>
                                    <button onClick={() => setPayingId(null)}
                                        style={{ background: "#fff", border: "1px solid #ddd", padding: "8px 16px", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>
                                        Cancelar
                                    </button>
                                    <button onClick={() => handlePay(res.id)}
                                        style={{ background: "#F58426", color: "#fff", border: "none", padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                                        Confirmar pago
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}

export default MyReservations
