import { useState, useEffect } from "react"
import { useKeycloak } from "@react-keycloak/web"
import reservationService from "../services/reservation.service"
import paymentService from "../services/payment.service"
import clientService from "../services/client.service"
import ConfirmModal from "../components/ConfirmModal"
import HelpTooltip from "../components/HelpTooltip"

/* ── Payment Success Overlay ───────────────────────────── */
const PaymentSuccessOverlay = ({ reservation, onViewVoucher, onClose }) => {
    const [visible, setVisible] = useState(false)
    useEffect(() => { setTimeout(() => setVisible(true), 30) }, [])

    const pkg = reservation?.travelPackage

    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(10,37,64,0.78)",
            backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24,
        }}>
            <div style={{
                background: "#fff", borderRadius: 24, padding: "44px 40px",
                maxWidth: 460, width: "100%", textAlign: "center",
                boxShadow: "0 40px 100px rgba(0,0,0,0.35)",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0) scale(1)" : "translateY(40px) scale(0.96)",
                transition: "opacity 0.4s ease, transform 0.4s ease",
            }}>
                {/* Animated checkmark */}
                <div style={{
                    width: 80, height: 80, borderRadius: "50%",
                    background: "linear-gradient(135deg, #22c55e, #16a34a)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 22px",
                    boxShadow: "0 12px 32px rgba(34,197,94,0.40)",
                    animation: "popIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275) both",
                }}>
                    <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
                        <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.8"
                            strokeLinecap="round" strokeLinejoin="round"
                            style={{ strokeDasharray: 30, strokeDashoffset: visible ? 0 : 30, transition: "stroke-dashoffset 0.5s ease 0.2s" }}
                        />
                    </svg>
                </div>

                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#22c55e", textTransform: "uppercase", marginBottom: 8 }}>
                    Pago aprobado
                </div>
                <h2 style={{ margin: "0 0 6px", fontSize: 26, fontWeight: 800, color: "#0A2540", letterSpacing: -0.5 }}>
                    ¡Confirmado!
                </h2>
                <p style={{ margin: "0 0 28px", fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>
                    Tu reserva para <strong style={{ color: "#0A2540" }}>{pkg?.packageName}</strong> ha sido pagada exitosamente.
                </p>

                {/* Summary card */}
                <div style={{
                    background: "#f8fafc", borderRadius: 14, padding: "18px 20px",
                    marginBottom: 24, textAlign: "left",
                    border: "1px solid #e2e8f0",
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <span style={{ fontSize: 13, color: "#64748b" }}>Destino</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#0A2540" }}>{pkg?.destination}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <span style={{ fontSize: 13, color: "#64748b" }}>Fechas</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#0A2540" }}>{pkg?.startDate} → {pkg?.endDate}</span>
                    </div>
                    <div style={{ borderTop: "1px dashed #e2e8f0", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: "#0A2540" }}>Total pagado</span>
                        <span style={{ fontSize: 22, fontWeight: 800, color: "#16a34a", letterSpacing: -0.5 }}>
                            US$ {reservation?.totalAmount?.toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Buttons */}
                <button
                    onClick={onViewVoucher}
                    style={{
                        width: "100%", background: "#0A2540", color: "#fff",
                        border: "none", padding: "14px 0", borderRadius: 12,
                        fontSize: 15, fontWeight: 700, cursor: "pointer",
                        marginBottom: 10, letterSpacing: 0.2,
                        transition: "background 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#0d3060"}
                    onMouseLeave={e => e.currentTarget.style.background = "#0A2540"}
                >
                    Ver comprobante completo
                </button>
                <button
                    onClick={onClose}
                    style={{
                        width: "100%", background: "transparent", color: "#64748b",
                        border: "1.5px solid #e2e8f0", padding: "12px 0", borderRadius: 12,
                        fontSize: 14, fontWeight: 500, cursor: "pointer",
                        transition: "border-color 0.15s, color 0.15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#94a3b8"; e.currentTarget.style.color = "#0A2540" }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#64748b" }}
                >
                    Ir a mis reservas
                </button>
            </div>
            <style>{`
                @keyframes popIn {
                    from { transform: scale(0.5); opacity: 0; }
                    to   { transform: scale(1);   opacity: 1; }
                }
            `}</style>
        </div>
    )
}

const STATUS_LABEL = {
    PENDING: "Pendiente",
    CONFIRMED: "Confirmado",
    CANCELLED: "Cancelado",
    EXPIRED: "Expirado",
}

const statusColors = {
    PENDING:   { bg: "#FAEEDA", color: "#854F0B" },
    CONFIRMED: { bg: "#EAF3DE", color: "#3B6D11" },
    CANCELLED: { bg: "#FCEBEB", color: "#A32D2D" },
    EXPIRED:   { bg: "#F1EFE8", color: "#5F5E5A" },
}

/* ── Comprobante modal ─────────────────────────────────── */
const VoucherModal = ({ reservation, onClose }) => {
    const [payment, setPayment] = useState(null)
    const [loadingPay, setLoadingPay] = useState(true)

    useEffect(() => {
        paymentService.getByReservation(reservation.id)
            .then(res => setPayment(res.data))
            .catch(() => setPayment(null))
            .finally(() => setLoadingPay(false))
    }, [reservation.id])

    const pkg = reservation.travelPackage

    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(10,37,64,0.70)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        }}>
            <div style={{
                background: "#fff", borderRadius: 16, padding: "36px 40px",
                maxWidth: 520, width: "100%",
                boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
            }}>
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: 28 }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: "50%",
                        background: "linear-gradient(135deg, #3B6D11, #5a9e1a)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto 14px",
                    }}>
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                            <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "#0A2540" }}>Comprobante de reserva</h2>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>N° {reservation.id}</div>
                </div>

                {/* Details */}
                <div style={{ borderTop: "1px dashed #e2e8f0", borderBottom: "1px dashed #e2e8f0", padding: "18px 0", marginBottom: 20 }}>
                    <Row label="Paquete" value={pkg.packageName} bold />
                    <Row label="Destino" value={pkg.destination} />
                    <Row label="Fechas" value={`${pkg.startDate} → ${pkg.endDate}`} />
                    <Row label="Pasajeros" value={`${reservation.quantity}`} />
                    {reservation.companions && (
                        <Row label="Acompañantes" value={reservation.companions} />
                    )}
                    <div style={{ height: 10 }} />
                    <Row label="Monto base" value={`US$ ${reservation.baseAmount?.toLocaleString()}`} strike />
                    {reservation.appliedDiscounts && (
                        <Row label="Descuentos" value={reservation.appliedDiscounts} discount />
                    )}
                    <Row label="Total pagado" value={`US$ ${reservation.totalAmount?.toLocaleString()}`} bold blue />
                </div>

                {/* Payment info */}
                {loadingPay && (
                    <p style={{ fontSize: 12, color: "#aaa", textAlign: "center" }}>Cargando datos del pago...</p>
                )}
                {!loadingPay && payment && (
                    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 20 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span>Medio de pago</span>
                            <span style={{ fontWeight: 500, color: "#0A2540" }}>Tarjeta de crédito •••• {payment.cardNumber}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>Fecha de pago</span>
                            <span style={{ fontWeight: 500, color: "#0A2540" }}>
                                {payment.paymentDate ? new Date(payment.paymentDate).toLocaleString("es-CL") : "—"}
                            </span>
                        </div>
                    </div>
                )}

                <button
                    onClick={onClose}
                    style={{
                        width: "100%", background: "#0A2540", color: "#fff",
                        border: "none", padding: "12px 0", borderRadius: 10,
                        fontSize: 14, fontWeight: 600, cursor: "pointer",
                    }}
                >
                    Cerrar
                </button>
            </div>
        </div>
    )
}

// Color del valor según la variante que indiquen las props de la fila.
const rowValueColor = ({ blue, green, discount }) => {
    if (blue) return "#006BB6"
    if (green) return "#3B6D11"
    if (discount) return "#7c3aed"
    return "#0A2540"
}

const Row = ({ label, value, bold, blue, green, discount, strike }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, gap: 12 }}>
        <span style={{ fontSize: 13, color: "#64748b", flexShrink: 0 }}>{label}</span>
        <span style={{
            fontSize: 13, textAlign: "right",
            fontWeight: bold ? 600 : 400,
            color: rowValueColor({ blue, green, discount }),
            textDecoration: strike ? "line-through" : "none",
        }}>
            {value}
        </span>
    </div>
)

/* ── Main component ────────────────────────────────────── */
const MyReservations = () => {
    const { keycloak } = useKeycloak()
    const [reservations, setReservations] = useState([])
    const [loading, setLoading] = useState(true)
    const [payingId, setPayingId] = useState(null)
    const [paymentForm, setPaymentForm] = useState({ cardNumber: "", cardExpiration: "", cvv: "" })
    const [paymentErrors, setPaymentErrors] = useState({})
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [justPaidReservation, setJustPaidReservation] = useState(null)
    const [voucherReservation, setVoucherReservation] = useState(null)
    const [confirmCancelId, setConfirmCancelId] = useState(null)

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
        setConfirmCancelId(null)
        reservationService.cancel(id)
            .then(() => { setSuccess("Reserva cancelada."); load() })
            .catch(err => setError(err.response?.data?.message || "Error al cancelar."))
    }

    /* ── Card number: only digits, max 16 ── */
    const handleCardNumber = (val) => {
        const digits = val.replace(/\D/g, "").slice(0, 16)
        const formatted = digits.replace(/(.{4})/g, "$1 ").trim()
        setPaymentForm(f => ({ ...f, cardNumber: formatted }))
        setPaymentErrors(e => ({ ...e, cardNumber: "" }))
    }

    /* ── Expiration: auto MM/AA ── */
    const handleExpiration = (val) => {
        let digits = val.replace(/\D/g, "").slice(0, 4)
        if (digits.length >= 3) digits = digits.slice(0, 2) + "/" + digits.slice(2)
        setPaymentForm(f => ({ ...f, cardExpiration: digits }))
        setPaymentErrors(e => ({ ...e, cardExpiration: "" }))
    }

    /* ── CVV: only digits, max 4 ── */
    const handleCvv = (val) => {
        const digits = val.replace(/\D/g, "").slice(0, 4)
        setPaymentForm(f => ({ ...f, cvv: digits }))
        setPaymentErrors(e => ({ ...e, cvv: "" }))
    }

    const validatePayment = () => {
        const errs = {}
        const rawCard = paymentForm.cardNumber.replace(/\s/g, "")
        if (rawCard.length !== 16) errs.cardNumber = "Debe tener 16 dígitos"

        if (!/^\d{2}\/\d{2}$/.test(paymentForm.cardExpiration)) {
            errs.cardExpiration = "Formato MM/AA"
        } else {
            const [mm, yy] = paymentForm.cardExpiration.split("/").map(Number)
            const now = new Date()
            const curYear = now.getFullYear() % 100
            const curMonth = now.getMonth() + 1
            if (mm < 1 || mm > 12) errs.cardExpiration = "Mes inválido (01-12)"
            else if (yy < curYear || (yy === curYear && mm < curMonth)) errs.cardExpiration = "Tarjeta vencida"
        }

        if (paymentForm.cvv.length < 3) errs.cvv = "Mínimo 3 dígitos"
        return errs
    }

    const handlePay = (id) => {
        setError("")
        setSuccess("")
        const errs = validatePayment()
        if (Object.keys(errs).length > 0) {
            setPaymentErrors(errs)
            return
        }
        const rawCard = paymentForm.cardNumber.replace(/\s/g, "")
        paymentService.processPayment({
            reservationId: id,
            cardNumber: rawCard,
            cardExpiration: paymentForm.cardExpiration,
            cvv: paymentForm.cvv,
        })
            .then(() => {
                setPayingId(null)
                setPaymentForm({ cardNumber: "", cardExpiration: "", cvv: "" })
                setPaymentErrors({})
                        const paidRes = reservations.find(r => r.id === id)
                setJustPaidReservation(paidRes || { id, travelPackage: {}, totalAmount: 0 })
                load()
            })
            .catch(err => setError(err.response?.data?.message || "Error en el pago."))
    }

    if (loading) return <p style={{ color: "#888" }}>Cargando...</p>

    return (
        <div style={{ padding: "0 24px" }}>
            <ConfirmModal
                open={confirmCancelId !== null}
                title="Cancelar reserva"
                message="¿Estás seguro de que quieres cancelar esta reserva?"
                confirmLabel="Cancelar reserva"
                danger
                onConfirm={() => handleCancel(confirmCancelId)}
                onCancel={() => setConfirmCancelId(null)}
            />
            {justPaidReservation && (
                <PaymentSuccessOverlay
                    reservation={justPaidReservation}
                    onViewVoucher={() => { setVoucherReservation(justPaidReservation); setJustPaidReservation(null) }}
                    onClose={() => setJustPaidReservation(null)}
                />
            )}
            {voucherReservation && (
                <VoucherModal
                    reservation={voucherReservation}
                    onClose={() => setVoucherReservation(null)}
                />
            )}

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
                                    color: statusColors[res.reservationStatus]?.color,
                                }}>
                                    {STATUS_LABEL[res.reservationStatus] || res.reservationStatus}
                                </span>
                            </div>
                            <div style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>
                                {res.travelPackage.destination} · {res.travelPackage.startDate} → {res.travelPackage.endDate}
                            </div>
                            <div style={{ fontSize: 13, color: "#666", marginBottom: res.companions ? 4 : 8 }}>
                                {res.quantity} pasajero{res.quantity > 1 ? "s" : ""}
                            </div>
                            {res.companions && (
                                <div style={{ fontSize: 12, color: "#555", marginBottom: 8, background: "#f5f5f5", borderRadius: 6, padding: "6px 10px" }}>
                                    <span style={{ fontWeight: 500, color: "#444" }}>Acompañantes: </span>
                                    {res.companions}
                                </div>
                            )}
                            {res.appliedDiscounts && (
                                <div style={{ fontSize: 12, color: "#3B6D11", marginBottom: 4 }}>
                                    {res.appliedDiscounts}
                                </div>
                            )}
                            <div style={{ fontSize: 13, color: "#444" }}>
                                Base: <span style={{ textDecoration: "line-through", color: "#999" }}>US$ {res.baseAmount?.toLocaleString()}</span>
                                {" "}&nbsp; Total: <strong style={{ color: "#006BB6" }}>US$ {res.totalAmount?.toLocaleString()}</strong>
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: 8, flexDirection: "column", alignItems: "flex-end" }}>
                            {res.reservationStatus === "PENDING" && payingId !== res.id && (
                                <>
                                    <button onClick={() => { setPayingId(res.id); setError(""); setSuccess(""); setPaymentErrors({}) }}
                                        style={{ background: "#F58426", color: "#fff", border: "none", padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                                        Pagar ahora
                                    </button>
                                    <button onClick={() => setConfirmCancelId(res.id)}
                                        style={{ background: "#fff", color: "#A32D2D", border: "1px solid #A32D2D", padding: "8px 18px", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>
                                        Cancelar
                                    </button>
                                </>
                            )}
                            {res.reservationStatus === "CONFIRMED" && (
                                <button
                                    onClick={() => setVoucherReservation(res)}
                                    style={{ background: "#fff", color: "#3B6D11", border: "1px solid #3B6D11", padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer" }}
                                >
                                    Ver comprobante
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Formulario de pago */}
                    {payingId === res.id && (
                        <div style={{ marginTop: 16, padding: 16, background: "#f9f9f9", borderRadius: 10, border: "1px solid #eee" }}>
                            <div style={{ fontWeight: 500, marginBottom: 12, fontSize: 14 }}>Datos de pago</div>
                            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
                                {/* Card number */}
                                <div>
                                    <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>NÚMERO DE TARJETA</div>
                                    <input
                                        value={paymentForm.cardNumber}
                                        onChange={e => handleCardNumber(e.target.value)}
                                        onKeyDown={e => { if (e.key === "Enter") handlePay(res.id) }}
                                        placeholder="1234 5678 9012 3456"
                                        inputMode="numeric"
                                        style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: `1px solid ${paymentErrors.cardNumber ? "#e53e3e" : "#ddd"}`, fontSize: 14, boxSizing: "border-box" }}
                                    />
                                    {paymentErrors.cardNumber && <div style={{ color: "#e53e3e", fontSize: 11, marginTop: 3 }}>{paymentErrors.cardNumber}</div>}
                                </div>
                                {/* Expiration */}
                                <div>
                                    <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>VENCIMIENTO<HelpTooltip text="Mes y año de vencimiento, tal como aparece en la tarjeta. Ej: 12/28" /></div>
                                    <input
                                        value={paymentForm.cardExpiration}
                                        onChange={e => handleExpiration(e.target.value)}
                                        onKeyDown={e => { if (e.key === "Enter") handlePay(res.id) }}
                                        placeholder="MM/AA"
                                        inputMode="numeric"
                                        style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: `1px solid ${paymentErrors.cardExpiration ? "#e53e3e" : "#ddd"}`, fontSize: 14, boxSizing: "border-box" }}
                                    />
                                    {paymentErrors.cardExpiration && <div style={{ color: "#e53e3e", fontSize: 11, marginTop: 3 }}>{paymentErrors.cardExpiration}</div>}
                                </div>
                                {/* CVV */}
                                <div>
                                    <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>CVV<HelpTooltip text="Los 3 dígitos que están en el reverso de tu tarjeta" /></div>
                                    <input
                                        value={paymentForm.cvv}
                                        onChange={e => handleCvv(e.target.value)}
                                        onKeyDown={e => { if (e.key === "Enter") handlePay(res.id) }}
                                        placeholder="123"
                                        inputMode="numeric"
                                        type="password"
                                        style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: `1px solid ${paymentErrors.cvv ? "#e53e3e" : "#ddd"}`, fontSize: 14, boxSizing: "border-box" }}
                                    />
                                    {paymentErrors.cvv && <div style={{ color: "#e53e3e", fontSize: 11, marginTop: 3 }}>{paymentErrors.cvv}</div>}
                                </div>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div style={{ fontSize: 14, fontWeight: 500 }}>
                                    Total a pagar: <span style={{ color: "#006BB6" }}>US$ {res.totalAmount?.toLocaleString()}</span>
                                </div>
                                <div style={{ display: "flex", gap: 8 }}>
                                    <button onClick={() => { setPayingId(null); setPaymentErrors({}) }}
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
