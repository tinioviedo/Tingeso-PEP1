import { useState, useEffect } from "react"
import { useKeycloak } from "@react-keycloak/web"
import clientService from "../services/client.service"
import { useNavigate } from "react-router-dom"

const Profile = () => {
    const { keycloak } = useKeycloak()
    const navigate = useNavigate()
    const [client, setClient] = useState(null)
    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")


    const clientId = keycloak.tokenParsed?.sub

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
                setSuccess("Profile updated successfully.")
            })
            .catch(err => setError(err.response?.data?.message || "Error updating profile."))
    }

    const handleDeactivate = () => {
        if (!window.confirm("Are you sure you want to deactivate your account? This action cannot be undone.")) return
        clientService.deactivate(client.id)
            .then(() => keycloak.logout())
            .catch(err => setError(err.response?.data?.message || "Error deactivating account."))
    }

    if (loading) return <p style={{ color: "#888" }}>Loading...</p>
    if (!client) return <p style={{ color: "#888" }}>Profile not found.</p>

    return (
        <div style={{ maxWidth: 600 }}>
            <h2 style={{ fontWeight: 500, marginBottom: 24 }}>My profile</h2>

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
                    { label: "Full name", key: "fullName" },
                    { label: "Phone", key: "phone" },
                    { label: "ID Document", key: "idDocument" },
                    { label: "Nationality", key: "nationality" },
                ].map(field => (
                    <div key={field.key} style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 11, color: "#888", marginBottom: 6, fontWeight: 500 }}>
                            {field.label.toUpperCase()}
                        </div>
                        {editing ? (
                            <input
                                value={form[field.key] || ""}
                                onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box" }}
                            />
                        ) : (
                            <div style={{ fontSize: 15, color: "#222" }}>{client[field.key] || "—"}</div>
                        )}
                    </div>
                ))}

                {/* Email — no editable */}
                <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 11, color: "#888", marginBottom: 6, fontWeight: 500 }}>EMAIL</div>
                    <div style={{ fontSize: 15, color: "#999" }}>{client.email}</div>
                    <div style={{ fontSize: 11, color: "#aaa" }}>Email cannot be changed</div>
                </div>

                {/* Buttons */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    {editing ? (
                        <div style={{ display: "flex", gap: 10 }}>
                            <button onClick={handleUpdate}
                                style={{ background: "#F58426", color: "#fff", border: "none", padding: "10px 24px", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
                                Save changes
                            </button>
                            <button onClick={() => { setEditing(false); setForm(client) }}
                                style={{ background: "#fff", border: "1px solid #ddd", padding: "10px 20px", borderRadius: 8, fontSize: 14, cursor: "pointer" }}>
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => setEditing(true)}
                            style={{ background: "#006BB6", color: "#fff", border: "none", padding: "10px 24px", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
                            Edit profile
                        </button>
                    )}

                    <button onClick={handleDeactivate}
                        style={{ background: "#fff", color: "#A32D2D", border: "1px solid #A32D2D", padding: "10px 20px", borderRadius: 8, fontSize: 14, cursor: "pointer" }}>
                        Deactivate account
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Profile