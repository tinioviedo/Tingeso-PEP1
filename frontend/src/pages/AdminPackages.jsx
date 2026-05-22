import { useState, useEffect } from "react"
import packageService from "../services/package.service"

const TRIP_TYPES = ["Deportivo", "Cultural", "Musical", "Playa", "Naturaleza"]

const COUNTRIES = [
  "Afganistán","Albania","Alemania","Andorra","Angola","Arabia Saudita","Argelia","Argentina",
  "Armenia","Australia","Austria","Azerbaiyán","Bahamas","Bangladés","Barbados","Baréin",
  "Bélgica","Belice","Benín","Bielorrusia","Bolivia","Bosnia y Herzegovina","Botsuana","Brasil",
  "Brunéi","Bulgaria","Burkina Faso","Burundi","Bután","Cabo Verde","Camboya","Camerún",
  "Canadá","Catar","Chad","Chile","China","Chipre","Colombia","Comoras","Congo",
  "Corea del Norte","Corea del Sur","Costa de Marfil","Costa Rica","Croacia","Cuba",
  "Dinamarca","Dominica","Ecuador","Egipto","El Salvador","Emiratos Árabes Unidos","Eritrea",
  "Eslovaquia","Eslovenia","España","Estados Unidos","Estonia","Etiopía","Fiyi","Filipinas",
  "Finlandia","Francia","Gabón","Gambia","Georgia","Ghana","Granada","Grecia","Guatemala",
  "Guinea","Guinea-Bisáu","Guinea Ecuatorial","Guyana","Haití","Honduras","Hungría","India",
  "Indonesia","Irak","Irán","Irlanda","Islandia","Israel","Italia","Jamaica","Japón",
  "Jordania","Kazajistán","Kenia","Kirguistán","Kuwait","Laos","Letonia","Líbano","Liberia",
  "Libia","Liechtenstein","Lituania","Luxemburgo","Madagascar","Malasia","Malaui","Maldivas",
  "Malí","Malta","Marruecos","Mauricio","Mauritania","México","Moldavia","Mónaco","Mongolia",
  "Montenegro","Mozambique","Namibia","Nauru","Nepal","Nicaragua","Níger","Nigeria","Noruega",
  "Nueva Zelanda","Omán","Países Bajos","Pakistán","Panamá","Paraguay","Perú","Polonia",
  "Portugal","Reino Unido","República Checa","República Dominicana","Ruanda","Rumania",
  "Rusia","Samoa","San Marino","Senegal","Serbia","Singapur","Siria","Somalia","Sri Lanka",
  "Sudáfrica","Sudán","Suecia","Suiza","Surinam","Tailandia","Tanzania","Timor Oriental",
  "Togo","Trinidad y Tobago","Túnez","Turquía","Ucrania","Uganda","Uruguay","Uzbekistán",
  "Venezuela","Vietnam","Yemen","Zambia","Zimbabue"
]

const emptyForm = {
    packageName: "", destination: "", description: "",
    startDate: "", endDate: "", price: "", slots: "", tripType: "",
    includedServices: "", conditions: ""
}

const AdminPackages = () => {
    const [packages, setPackages] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState(emptyForm)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const load = () => {
        packageService.getAll()
            .then(res => setPackages(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }

    useEffect(() => { load() }, [])

    const handleSubmit = () => {
        setError("")
        const call = editing
            ? packageService.update(editing, form)
            : packageService.create(form)
        call
            .then(() => {
                setSuccess(editing ? "Paquete actualizado." : "Paquete creado.")
                setShowForm(false)
                setEditing(null)
                setForm(emptyForm)
                load()
            })
            .catch(err => setError(err.response?.data?.message || "Error al guardar el paquete."))
    }

    const handleEdit = (pkg) => {
        setForm(pkg)
        setEditing(pkg.id)
        setShowForm(true)
        setError("")
        setSuccess("")
    }

    const handleChangeStatus = (id, status) => {
        setError("")
        setSuccess("")
        packageService.changeStatus(id, status)
            .then(() => { setSuccess("Estado actualizado."); load() })
            .catch(err => setError(err.response?.data?.message || "No se pudo cambiar el estado. Verifica que el paquete tenga cupos disponibles."))
    }

    const statusColor = { AVAILABLE: "#3B6D11", SOLD_OUT: "#854F0B", NOT_VALID: "#5F5E5A", CANCELLED: "#A32D2D" }
    const statusLabel = { AVAILABLE: "Disponible", SOLD_OUT: "Agotado", NOT_VALID: "No válido", CANCELLED: "Cancelado" }

    if (loading) return <p style={{ color: "#888" }}>Cargando...</p>

    return (
        <div style={{ padding: "0 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h2 style={{ fontWeight: 500, margin: 0 }}>Gestionar paquetes</h2>
                <button onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm); setError(""); setSuccess("") }}
                    style={{ background: "#F58426", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
                    + Nuevo paquete
                </button>
            </div>

            {error && <div style={{ background: "#FCEBEB", color: "#A32D2D", padding: "10px 14px", borderRadius: 8, marginBottom: 16 }}>{error}</div>}
            {success && <div style={{ background: "#EAF3DE", color: "#3B6D11", padding: "10px 14px", borderRadius: 8, marginBottom: 16 }}>{success}</div>}

            {/* Form */}
            {showForm && (
                <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: 24, marginBottom: 24 }}>
                    <h3 style={{ fontWeight: 500, margin: "0 0 20px" }}>{editing ? "Editar paquete" : "Nuevo paquete"}</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                        {/* Nombre */}
                        {[
                            { label: "Nombre del paquete", key: "packageName" },
                            { label: "Precio", key: "price", type: "number" },
                            { label: "Cupos totales", key: "slots", type: "number" },
                            { label: "Fecha de inicio", key: "startDate", type: "date" },
                            { label: "Fecha de fin", key: "endDate", type: "date" },
                        ].map(f => (
                            <div key={f.key}>
                                <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>{f.label.toUpperCase()}</div>
                                <input
                                    type={f.type || "text"}
                                    value={form[f.key] || ""}
                                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box" }}
                                />
                            </div>
                        ))}
                        {/* Destino */}
                        <div>
                            <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>DESTINO</div>
                            <select
                                value={form.destination || ""}
                                onChange={e => setForm(p => ({ ...p, destination: e.target.value }))}
                                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box", fontFamily: "inherit", background: "#fff" }}
                            >
                                <option value="">Selecciona un país...</option>
                                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        {/* Tipo de viaje */}
                        <div>
                            <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>TIPO DE VIAJE</div>
                            <select
                                value={form.tripType || ""}
                                onChange={e => setForm(p => ({ ...p, tripType: e.target.value }))}
                                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box", fontFamily: "inherit", background: "#fff" }}
                            >
                                <option value="">Selecciona un tipo...</option>
                                {TRIP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>
                    {[
                        { label: "Descripción", key: "description" },
                        { label: "Servicios incluidos", key: "includedServices" },
                        { label: "Condiciones", key: "conditions" },
                    ].map(f => (
                        <div key={f.key} style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>{f.label.toUpperCase()}</div>
                            <textarea
                                value={form[f.key] || ""}
                                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                                rows={3}
                                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box", resize: "vertical" }}
                            />
                        </div>
                    ))}
                    <div style={{ display: "flex", gap: 10 }}>
                        <button onClick={handleSubmit}
                            style={{ background: "#F58426", color: "#fff", border: "none", padding: "10px 24px", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
                            {editing ? "Guardar cambios" : "Crear paquete"}
                        </button>
                        <button onClick={() => { setShowForm(false); setEditing(null); setForm(emptyForm) }}
                            style={{ background: "#fff", border: "1px solid #ddd", padding: "10px 20px", borderRadius: 8, fontSize: 14, cursor: "pointer" }}>
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 160px", padding: "10px 16px", background: "#fafafa", borderBottom: "1px solid #eee", fontSize: 11, color: "#888", fontWeight: 500 }}>
                    <span>PAQUETE</span><span>DESTINO</span><span>PRECIO</span><span>CUPOS</span><span>ESTADO</span><span>ACCIONES</span>
                </div>
                {packages.map(pkg => (
                    <div key={pkg.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 160px", padding: "12px 16px", borderBottom: "1px solid #f5f5f5", alignItems: "center", fontSize: 13 }}>
                        <span style={{ fontWeight: 500 }}>{pkg.packageName}</span>
                        <span style={{ color: "#666" }}>{pkg.destination}</span>
                        <span>US$ {pkg.price?.toLocaleString()}</span>
                        <span>{pkg.availableSlots}/{pkg.slots}</span>
                        <span style={{ color: statusColor[pkg.packageStatus], fontWeight: 500, fontSize: 12 }}>{statusLabel[pkg.packageStatus] || pkg.packageStatus}</span>
                        <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => handleEdit(pkg)}
                                style={{ background: "#006BB6", color: "#fff", border: "none", padding: "5px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer" }}>
                                Editar
                            </button>
                            <select
                                key={pkg.id + pkg.packageStatus}
                                onChange={e => handleChangeStatus(pkg.id, e.target.value)}
                                defaultValue={pkg.packageStatus}
                                style={{ fontSize: 11, padding: "5px 6px", borderRadius: 6, border: "1px solid #ddd", cursor: "pointer" }}>
                                <option value="AVAILABLE">Disponible</option>
                                <option value="NOT_VALID">No válido</option>
                                <option value="CANCELLED">Cancelado</option>
                            </select>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default AdminPackages
