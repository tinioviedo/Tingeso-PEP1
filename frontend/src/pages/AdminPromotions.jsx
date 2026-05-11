import { useState, useEffect } from "react"
import promotionService from "../services/promotion.service"

const AdminPromotions = () => {
    const [promotions, setPromotions] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState({ name: "", discountRate: "", startDate: "", endDate: "" })
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const load = () => {
        promotionService.getAll()
            .then(res => setPromotions(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }

    useEffect(() => { load() }, [])

    const handleSubmit = () => {
        setError("")
        const call = editing
            ? promotionService.update(editing, form)
            : promotionService.create(form)
        call
            .then(() => {
                setSuccess(editing ? "Promoción actualizada." : "Promoción creada.")
                setShowForm(false)
                setEditing(null)
                setForm({ name: "", discountRate: "", startDate: "", endDate: "" })
                load()
            })
            .catch(err => setError(err.response?.data?.message || "Error al guardar la promoción."))
    }

    const handleToggle = (id, active) => {
        promotionService.changeStatus(id, !active)
            .then(() => { setSuccess("Estado actualizado."); load() })
            .catch(err => setError(err.response?.data?.message || "Error."))
    }

    const isActive = (promo) => {
        const today = new Date().toISOString().split("T")[0]
        return promo.active && promo.startDate <= today && promo.endDate >= today
    }

    if (loading) return <p style={{ color: "#888" }}>Cargando...</p>

    return (
        <div style={{ padding: "0 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h2 style={{ fontWeight: 500, margin: 0 }}>Promociones</h2>
                <button onClick={() => { setShowForm(true); setEditing(null); setForm({ name: "", discountRate: "", startDate: "", endDate: "" }); setError(""); setSuccess("") }}
                    style={{ background: "#F58426", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
                    + Nueva promoción
                </button>
            </div>

            {error && <div style={{ background: "#FCEBEB", color: "#A32D2D", padding: "10px 14px", borderRadius: 8, marginBottom: 16 }}>{error}</div>}
            {success && <div style={{ background: "#EAF3DE", color: "#3B6D11", padding: "10px 14px", borderRadius: 8, marginBottom: 16 }}>{success}</div>}

            {showForm && (
                <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: 24, marginBottom: 24 }}>
                    <h3 style={{ fontWeight: 500, margin: "0 0 20px" }}>{editing ? "Editar promoción" : "Nueva promoción"}</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
                        <div>
                            <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>NOMBRE DE LA PROMOCIÓN</div>
                            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                placeholder="Ej. Verano"
                                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box" }} />
                        </div>
                        <div>
                            <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>TASA (0-1)</div>
                            <input type="number" step="0.01" value={form.discountRate}
                                onChange={e => setForm(f => ({ ...f, discountRate: e.target.value }))}
                                placeholder="Ej. 0.15"
                                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box" }} />
                        </div>
                        <div>
                            <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>FECHA DE INICIO</div>
                            <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box" }} />
                        </div>
                        <div>
                            <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>FECHA DE FIN</div>
                            <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box" }} />
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                        <button onClick={handleSubmit}
                            style={{ background: "#F58426", color: "#fff", border: "none", padding: "10px 24px", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
                            {editing ? "Guardar cambios" : "Crear"}
                        </button>
                        <button onClick={() => { setShowForm(false); setEditing(null) }}
                            style={{ background: "#fff", border: "1px solid #ddd", padding: "10px 20px", borderRadius: 8, fontSize: 14, cursor: "pointer" }}>
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 120px", padding: "10px 16px", background: "#fafafa", borderBottom: "1px solid #eee", fontSize: 11, color: "#888", fontWeight: 500 }}>
                    <span>NOMBRE</span><span>TASA</span><span>INICIO</span><span>FIN</span><span>ESTADO</span><span>ACCIONES</span>
                </div>
                {promotions.map(p => (
                    <div key={p.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 120px", padding: "12px 16px", borderBottom: "1px solid #f5f5f5", alignItems: "center", fontSize: 13 }}>
                        <span style={{ fontWeight: 500 }}>{p.name}</span>
                        <span>{(p.discountRate * 100).toFixed(0)}%</span>
                        <span style={{ color: "#666" }}>{p.startDate}</span>
                        <span style={{ color: "#666" }}>{p.endDate}</span>
                        <span style={{ fontSize: 11, fontWeight: 500, color: isActive(p) ? "#3B6D11" : "#5F5E5A" }}>
                            {isActive(p) ? "Activa" : p.active ? "Programada" : "Inactiva"}
                        </span>
                        <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => { setForm(p); setEditing(p.id); setShowForm(true); setError(""); setSuccess("") }}
                                style={{ background: "#006BB6", color: "#fff", border: "none", padding: "5px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer" }}>
                                Editar
                            </button>
                            <button onClick={() => handleToggle(p.id, p.active)}
                                style={{ background: "#fff", border: "1px solid #ddd", color: "#444", padding: "5px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer" }}>
                                {p.active ? "Desactivar" : "Activar"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default AdminPromotions
