import { useState, useEffect } from "react"
import { useKeycloak } from "@react-keycloak/web"
import clientService from "../services/client.service"
import { useNavigate } from "react-router-dom"
import ConfirmModal from "../components/ConfirmModal"

const COUNTRIES = [
  "Afganistán","Albania","Alemania","Andorra","Angola","Antigua y Barbuda","Arabia Saudita",
  "Argelia","Argentina","Armenia","Australia","Austria","Azerbaiyán","Bahamas","Bangladés",
  "Barbados","Baréin","Bélgica","Belice","Benín","Bielorrusia","Bolivia","Bosnia y Herzegovina",
  "Botsuana","Brasil","Brunéi","Bulgaria","Burkina Faso","Burundi","Bután","Cabo Verde",
  "Camboya","Camerún","Canadá","Catar","Chad","Chile","China","Chipre","Colombia","Comoras",
  "Congo","Corea del Norte","Corea del Sur","Costa de Marfil","Costa Rica","Croacia","Cuba",
  "Dinamarca","Dominica","Ecuador","Egipto","El Salvador","Emiratos Árabes Unidos","Eritrea",
  "Eslovaquia","Eslovenia","España","Estados Unidos","Estonia","Etiopía","Fiyi","Filipinas",
  "Finlandia","Francia","Gabón","Gambia","Georgia","Ghana","Granada","Grecia","Guatemala",
  "Guinea","Guinea-Bisáu","Guinea Ecuatorial","Guyana","Haití","Honduras","Hungría","India",
  "Indonesia","Irak","Irán","Irlanda","Islandia","Islas Marshall","Islas Salomón","Israel",
  "Italia","Jamaica","Japón","Jordania","Kazajistán","Kenia","Kirguistán","Kiribati","Kuwait",
  "Laos","Lesoto","Letonia","Líbano","Liberia","Libia","Liechtenstein","Lituania","Luxemburgo",
  "Madagascar","Malasia","Malaui","Maldivas","Malí","Malta","Marruecos","Mauricio","Mauritania",
  "México","Micronesia","Moldavia","Mónaco","Mongolia","Montenegro","Mozambique","Namibia",
  "Nauru","Nepal","Nicaragua","Níger","Nigeria","Noruega","Nueva Zelanda","Omán","Países Bajos",
  "Pakistán","Palaos","Palestina","Panamá","Papúa Nueva Guinea","Paraguay","Perú","Polonia",
  "Portugal","Reino Unido","República Centroafricana","República Checa","República Dominicana",
  "República del Congo","Ruanda","Rumania","Rusia","Samoa","San Cristóbal y Nieves",
  "San Marino","San Vicente y las Granadinas","Santa Lucía","Santo Tomé y Príncipe","Senegal",
  "Serbia","Seychelles","Sierra Leona","Singapur","Siria","Somalia","Sri Lanka","Suazilandia",
  "Sudáfrica","Sudán","Sudán del Sur","Suecia","Suiza","Surinam","Tailandia","Tanzania",
  "Tayikistán","Timor Oriental","Togo","Tonga","Trinidad y Tobago","Túnez","Turkmenistán",
  "Turquía","Tuvalu","Ucrania","Uganda","Uruguay","Uzbekistán","Vanuatu","Venezuela",
  "Vietnam","Yemen","Yibuti","Zambia","Zimbabue"
]

const formatRut = (value) => {
  let clean = value.replace(/[^0-9kK]/g, "").toUpperCase()
  if (clean.length === 0) return ""
  if (clean.length > 9) clean = clean.slice(0, 9)
  const dv = clean.slice(-1)
  let body = clean.slice(0, -1)
  body = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  return body ? `${body}-${dv}` : dv
}

const Profile = () => {
    const { keycloak } = useKeycloak()
    const navigate = useNavigate()
    const [client, setClient] = useState(null)
    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [confirmDeactivate, setConfirmDeactivate] = useState(false)

    useEffect(() => {
        const email = keycloak.tokenParsed?.email
        if (!email) { setLoading(false); return }
        clientService.getByEmail(email)
            .then(res => { setClient(res.data); setForm(res.data) })
            .catch(() => navigate("/register-profile"))
            .finally(() => setLoading(false))
    }, [])

    const handleUpdate = () => {
        setError("")
        setSuccess("")
        clientService.update(client.id, form)
            .then(res => {
                setClient(res.data)
                setEditing(false)
                setSuccess("Perfil actualizado correctamente.")
            })
            .catch(err => setError(err.response?.data?.message || "Error al actualizar el perfil."))
    }

    const handleDeactivate = () => {
        setConfirmDeactivate(false)
        clientService.deactivate(client.id)
            .then(() => keycloak.logout())
            .catch(err => setError(err.response?.data?.message || "Error al desactivar la cuenta."))
    }

    if (loading) return <p style={{ color: "#888" }}>Cargando...</p>
    if (!client) return <p style={{ color: "#888" }}>Perfil no encontrado.</p>

    // Cada campo se muestra como texto, como selector de país o como input,
    // según si el perfil está en modo edición y de qué campo se trate.
    const renderFieldValue = (field) => {
        if (!editing) {
            return <div style={{ fontSize: 15, color: "#222" }}>{client[field.key] || "—"}</div>
        }
        if (field.key === "nationality") {
            return (
                <select
                    value={form.nationality || ""}
                    onChange={e => setForm(f => ({ ...f, nationality: e.target.value, idDocument: "" }))}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box", fontFamily: "inherit" }}
                >
                    <option value="">Selecciona tu país...</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            )
        }
        const isChileanRut = field.key === "idDocument" && form.nationality === "Chile"
        return (
            <input
                value={form[field.key] || ""}
                onChange={e => {
                    const val = isChileanRut ? formatRut(e.target.value) : e.target.value
                    setForm(f => ({ ...f, [field.key]: val }))
                }}
                placeholder={isChileanRut ? "Ej: 12.345.678-9" : ""}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box" }}
            />
        )
    }

    return (
        <div style={{ maxWidth: 600, padding: "0 24px" }}>
            <h2 style={{ fontWeight: 500, marginBottom: 24 }}>Mi perfil</h2>

            <ConfirmModal
                open={confirmDeactivate}
                title="Desactivar cuenta"
                message="¿Estás seguro de que quieres desactivar tu cuenta? Esta acción no se puede deshacer."
                confirmLabel="Desactivar cuenta"
                danger
                onConfirm={handleDeactivate}
                onCancel={() => setConfirmDeactivate(false)}
            />

            {error && <div style={{ background: "#FCEBEB", color: "#A32D2D", padding: "10px 14px", borderRadius: 8, marginBottom: 16 }}>{error}</div>}
            {success && <div style={{ background: "#EAF3DE", color: "#3B6D11", padding: "10px 14px", borderRadius: 8, marginBottom: 16 }}>{success}</div>}

            <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: 24 }}>

                {/* Avatar */}
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid #f0f0f0" }}>
                    <div style={{
                        width: 60, height: 60, borderRadius: "50%", background: "#006BB6",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontSize: 22, fontWeight: 500
                    }}>
                        {client.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style={{ fontWeight: 500, fontSize: 18 }}>{client.fullName}</div>
                        <div style={{ fontSize: 13, color: "#888" }}>{client.email}</div>
                    </div>
                </div>

                {/* Fields */}
                {[
                    { label: "Nombre completo", key: "fullName" },
                    { label: "Teléfono", key: "phone" },
                    { label: "Nacionalidad", key: "nationality" },
                    { label: form.nationality === "Chile" ? "RUT" : "Documento de identidad (RUT / Pasaporte)", key: "idDocument" },
                ].map(field => (
                    <div key={field.key} style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 11, color: "#888", marginBottom: 6, fontWeight: 500 }}>
                            {field.label.toUpperCase()}
                        </div>
                        {renderFieldValue(field)}
                    </div>
                ))}

                {/* Email — no editable */}
                <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 11, color: "#888", marginBottom: 6, fontWeight: 500 }}>EMAIL</div>
                    <div style={{ fontSize: 15, color: "#999" }}>{client.email}</div>
                    <div style={{ fontSize: 11, color: "#aaa" }}>El email no se puede modificar</div>
                </div>

                {/* Buttons */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    {editing ? (
                        <div style={{ display: "flex", gap: 10 }}>
                            <button onClick={handleUpdate}
                                style={{ background: "#F58426", color: "#fff", border: "none", padding: "10px 24px", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
                                Guardar cambios
                            </button>
                            <button onClick={() => { setEditing(false); setForm(client) }}
                                style={{ background: "#fff", border: "1px solid #ddd", padding: "10px 20px", borderRadius: 8, fontSize: 14, cursor: "pointer" }}>
                                Cancelar
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => setEditing(true)}
                            style={{ background: "#006BB6", color: "#fff", border: "none", padding: "10px 24px", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
                            Editar perfil
                        </button>
                    )}

                    <button onClick={() => setConfirmDeactivate(true)}
                        style={{ background: "#fff", color: "#A32D2D", border: "1px solid #A32D2D", padding: "10px 20px", borderRadius: 8, fontSize: 14, cursor: "pointer" }}>
                        Desactivar cuenta
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Profile
