import { useState, useEffect } from "react"
import reservationService from "../services/reservation.service"

const statusColors = {
    PENDING: { bg: "#FAEEDA", color: "#854F0B" },
    CONFIRMED: { bg: "#EAF3DE", color: "#3B6D11" },
    CANCELLED: { bg: "#FCEBEB", color: "#A32D2D" },
    EXPIRED: { bg: "#F1EFE8", color: "#5F5E5A" },
}

const AdminReservations = () => {
    const [reservations, setReservations] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const load = () => {
        reservationService.getAll()
            .then(res => setReservations(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }

    useEffect(() => { load() }, [])

    const handleCancel = (id) => {
        if (!window.confirm("¿Cancelar esta reserva?")) return
        reservationService.cancel(id)
            .then(() => { setSuccess("Reserva cancelada."); load() })
            .catch(err => setError(err.response?.data?.message || "Error."))
    }

    if (loading) return <p style={{ color: "#888" }}>Cargando...</p>

    return (
        <div style={{ padding: "0 24px" }}>
            <h2 style={{ fontWeight: 500, marginBottom: 24 }}>Todas las reservas</h2>

            {error && <div style={{ background: "#FCEBEB", color: "#A32D2D", padding: "10px 14px", borderRadius: 8, marginBottom: 16 }}>{error}</div>}
            {success && <div style={{ background: "#EAF3DE", color: "#3B6D11", padding: "10px 14px", borderRadius: 8, marginBottom: 16 }}>{success}</div>}

            <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 100px", padding: "10px 16px", background: "#fafafa", borderBottom: "1px solid #eee", fontSize: 11, color: "#888", fontWeight: 500 }}>
                    <span>CLIENTE</span><span>PAQUETE</span><span>PASAJEROS</span><span>TOTAL</span><span>ESTADO</span><span>ACCIONES</span>
                </div>
                {reservations.map(res => (
                    <div key={res.id} style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 100px", padding: "12px 16px", borderBottom: "1px solid #f5f5f5", alignItems: "center", fontSize: 13 }}>
                        <div>
                            <div style={{ fontWeight: 500 }}>{res.client?.fullName}</div>
                            <div style={{ fontSize: 11, color: "#888" }}>{res.client?.email}</div>
                        </div>
                        <div>
                            <div style={{ fontWeight: 500 }}>{res.travelPackage?.packageName}</div>
                            <div style={{ fontSize: 11, color: "#888" }}>{res.travelPackage?.destination}</div>
                        </div>
                        <span>{res.quantity}</span>
                        <span style={{ fontWeight: 500, color: "#006BB6" }}>${res.totalAmount?.toLocaleString()}</span>
                        <span style={{
                            fontSize: 11, padding: "3px 8px", borderRadius: 10, fontWeight: 500,
                            background: statusColors[res.reservationStatus]?.bg,
                            color: statusColors[res.reservationStatus]?.color
                        }}>
                            {res.reservationStatus}
                        </span>
                        <div>
                            {res.reservationStatus === "PENDING" && (
                                <button onClick={() => handleCancel(res.id)}
                                    style={{ background: "#fff", color: "#A32D2D", border: "1px solid #A32D2D", padding: "5px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer" }}>
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default AdminReservations
