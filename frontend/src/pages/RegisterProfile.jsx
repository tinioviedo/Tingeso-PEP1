import { useState } from "react"
import { useKeycloak } from "@react-keycloak/web"
import { useNavigate } from "react-router-dom"
import clientService from "../services/client.service"

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
  // Remove all non-alphanumeric except k/K
  let clean = value.replace(/[^0-9kK]/g, "").toUpperCase()
  if (clean.length === 0) return ""
  // Limit: max 8 digits body + 1 DV = 9 chars total
  if (clean.length > 9) clean = clean.slice(0, 9)
  const dv = clean.slice(-1)
  let body = clean.slice(0, -1)
  // Add dots every 3 digits from right
  body = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  return body ? `${body}-${dv}` : dv
}

const RegisterProfile = () => {
  const { keycloak } = useKeycloak()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fullName: keycloak.tokenParsed?.name || "",
    email: keycloak.tokenParsed?.email || "",
    phone: "",
    nationality: "",
    idDocument: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const isChilean = form.nationality === "Chile" || form.nationality === "Chilena" || form.nationality === "Chile"

  const handleDocumentChange = (e) => {
    const raw = e.target.value
    if (isChilean) {
      setForm(p => ({ ...p, idDocument: formatRut(raw) }))
    } else {
      setForm(p => ({ ...p, idDocument: raw }))
    }
  }

  const handleSubmit = () => {
    setError("")
    if (!form.fullName || !form.email) {
      setError("El nombre completo y el email son obligatorios.")
      return
    }
    setLoading(true)
    clientService.create(form)
      .then(() => navigate("/home"))
      .catch(err => setError(err.response?.data?.message || "Error al crear el perfil."))
      .finally(() => setLoading(false))
  }

  const inputStyle = {
    width: "100%", padding: "10px 12px", borderRadius: 8,
    border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box",
    background: "#fff", color: "#222", fontFamily: "inherit",
    outline: "none",
  }

  const labelStyle = { fontSize: 11, color: "#888", marginBottom: 4, letterSpacing: 0.5 }

  return (
    <div style={{ maxWidth: 500, margin: "60px auto", padding: "0 24px" }}>
      <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: 32 }}>
        <h2 style={{ fontWeight: 600, margin: "0 0 8px", color: "#0A2540" }}>Completa tu perfil</h2>
        <p style={{ color: "#888", fontSize: 14, margin: "0 0 24px" }}>
          ¡Bienvenido! Por favor completa tu información para continuar.
        </p>

        {error && (
          <div style={{ background: "#FCEBEB", color: "#A32D2D", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
            {error}
          </div>
        )}

        {/* Nombre */}
        <div style={{ marginBottom: 16 }}>
          <div style={labelStyle}>NOMBRE COMPLETO</div>
          <input value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} style={inputStyle} />
        </div>

        {/* Email */}
        <div style={{ marginBottom: 16 }}>
          <div style={labelStyle}>EMAIL</div>
          <input value={form.email} disabled style={{ ...inputStyle, background: "#f5f5f5", color: "#999" }} />
        </div>

        {/* Teléfono */}
        <div style={{ marginBottom: 16 }}>
          <div style={labelStyle}>TELÉFONO</div>
          <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+56 9 1234 5678" style={inputStyle} />
        </div>

        {/* Nacionalidad (dropdown) */}
        <div style={{ marginBottom: 16 }}>
          <div style={labelStyle}>NACIONALIDAD</div>
          <select
            value={form.nationality}
            onChange={e => setForm(p => ({ ...p, nationality: e.target.value, idDocument: "" }))}
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            <option value="">Selecciona tu país...</option>
            {COUNTRIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Documento */}
        <div style={{ marginBottom: 16 }}>
          <div style={labelStyle}>
            {isChilean ? "RUT" : "DOCUMENTO DE IDENTIDAD (PASAPORTE / ID)"}
          </div>
          <input
            value={form.idDocument}
            onChange={handleDocumentChange}
            placeholder={isChilean ? "Ej: 12.345.678-9" : "Número de pasaporte o documento"}
            style={inputStyle}
          />
          {isChilean && (
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
              Formato: 12.345.678-9
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%", background: "#F58426", color: "#fff", border: "none",
            padding: 14, borderRadius: 8, fontSize: 15, fontWeight: 500,
            cursor: "pointer", marginTop: 8,
          }}
        >
          {loading ? "Guardando..." : "Guardar y continuar"}
        </button>
      </div>
    </div>
  )
}

export default RegisterProfile
