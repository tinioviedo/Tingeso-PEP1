import { useState } from "react"
import { useKeycloak } from "@react-keycloak/web"
import { useNavigate } from "react-router-dom"
import clientService from "../services/client.service"

const RegisterProfile = () => {
    const { keycloak } = useKeycloak()
    const navigate = useNavigate()
    const [form, setForm] = useState({
        fullName: keycloak.tokenParsed?.name || "",
        email: keycloak.tokenParsed?.email || "",
        phone: "",
        idDocument: "",
        nationality: ""
    })
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = () => {
        setError("")
        if (!form.fullName || !form.email) {
            setError("Full name and email are required.")
            return
        }
        setLoading(true)
        clientService.create(form)
            .then(() => navigate("/home"))
            .catch(err => setError(err.response?.data?.message || "Error creating profile."))
            .finally(() => setLoading(false))
    }

    return (
        <div style={{ maxWidth: 500, margin: "60px auto" }}>
            <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: 32 }}>
                <h2 style={{ fontWeight: 500, margin: "0 0 8px" }}>Complete your profile</h2>
                <p style={{ color: "#888", fontSize: 14, margin: "0 0 24px" }}>
                    Welcome! Please complete your information to continue.
                </p>

                {error && <div style={{ background: "#FCEBEB", color: "#A32D2D", padding: "10px 14px", borderRadius: 8, marginBottom: 16 }}>{error}</div>}

                {[
                    { label: "Full name", key: "fullName" },
                    { label: "Email", key: "email", disabled: true },
                    { label: "Phone", key: "phone" },
                    { label: "ID Document", key: "idDocument" },
                    { label: "Nationality", key: "nationality" },
                ].map(f => (
                    <div key={f.key} style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>{f.label.toUpperCase()}</div>
                        <input
                            value={form[f.key] || ""}
                            onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                            disabled={f.disabled}
                            style={{
                                width: "100%", padding: "10px 12px", borderRadius: 8,
                                border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box",
                                background: f.disabled ? "#f5f5f5" : "#fff",
                                color: f.disabled ? "#999" : "#222"
                            }}
                        />
                    </div>
                ))}

                <button onClick={handleSubmit} disabled={loading} style={{
                    width: "100%", background: "#F58426", color: "#fff", border: "none",
                    padding: 14, borderRadius: 8, fontSize: 15, fontWeight: 500, cursor: "pointer", marginTop: 8
                }}>
                    {loading ? "Saving..." : "Save and continue"}
                </button>
            </div>
        </div>
    )
}

export default RegisterProfile