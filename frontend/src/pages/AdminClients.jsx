import { useState, useEffect } from "react"
import clientService from "../services/client.service"

const AdminClients = () => {
    const [clients, setClients] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const load = () => {
        clientService.getAll()
            .then(res => setClients(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }

    useEffect(() => { load() }, [])

    const handleDeactivate = (id) => {
        if (!window.confirm("¿Desactivar este cliente?")) return
        clientService.deactivateAdmin(id)
            .then(() => { setSuccess("Cliente desactivado."); load() })
            .catch(err => setError(err.response?.data?.message || "Error."))
    }

    if (loading) return <p style={{ color: "#888" }}>Cargando...</p>

    return (
        <div style={{ padding: "0 24px" }}>
            <h2 style={{ fontWeight: 500, marginBottom: 24 }}>Gestionar clientes</h2>

            {error && <div style={{ background: "#FCEBEB", color: "#A32D2D", padding: "10px 14px", borderRadius: 8, marginBottom: 16 }}>{error}</div>}
            {success && <div style={{ background: "#EAF3DE", color: "#3B6D11", padding: "10px 14px", borderRadius: 8, marginBottom: 16 }}>{success}</div>}

            <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr 100px", padding: "10px 16px", background: "#fafafa", borderBottom: "1px solid #eee", fontSize: 11, color: "#888", fontWeight: 500 }}>
                    <span>NOMBRE</span><span>EMAIL</span><span>NACIONALIDAD</span><span>ESTADO</span><span>ACCIONES</span>
                </div>
                {clients.map(client => (
                    <div key={client.id} style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr 100px", padding: "12px 16px", borderBottom: "1px solid #f5f5f5", alignItems: "center", fontSize: 13 }}>
                        <div>
                            <div style={{ fontWeight: 500 }}>{client.fullName}</div>
                            <div style={{ fontSize: 11, color: "#888" }}>{client.phone}</div>
                        </div>
                        <span style={{ color: "#666" }}>{client.email}</span>
                        <span style={{ color: "#666" }}>{client.nationality || "—"}</span>
                        <span style={{
                            fontSize: 11, fontWeight: 500,
                            color: client.active ? "#3B6D11" : "#A32D2D"
                        }}>
                            {client.active ? "Activo" : "Inactivo"}
                        </span>
                        <div>
                            {client.active && (
                                <button onClick={() => handleDeactivate(client.id)}
                                    style={{ background: "#fff", color: "#A32D2D", border: "1px solid #A32D2D", padding: "5px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer" }}>
                                    Desactivar
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default AdminClients
