import { useState, useEffect } from "react"
import discountService from "../services/discount.service"

const AdminDiscounts = () => {
    const [discounts, setDiscounts] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState({ discountType: "GROUP", minThreshold: "", discountRate: "" })
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const load = () => {
        discountService.getAll()
            .then(res => setDiscounts(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }

    useEffect(() => { load() }, [])

    const handleSubmit = () => {
        setError("")
        const call = editing
            ? discountService.update(editing, form)
            : discountService.create(form)
        call
            .then(() => {
                setSuccess(editing ? "Discount updated." : "Discount created.")
                setShowForm(false)
                setEditing(null)
                setForm({ discountType: "GROUP", minThreshold: "", discountRate: "" })
                load()
            })
            .catch(err => setError(err.response?.data?.message || "Error saving discount."))
    }

    const handleToggle = (id, active) => {
        discountService.changeStatus(id, !active)
            .then(() => { setSuccess("Status updated."); load() })
            .catch(err => setError(err.response?.data?.message || "Error."))
    }

    if (loading) return <p style={{ color: "#888" }}>Loading...</p>

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h2 style={{ fontWeight: 500, margin: 0 }}>Discounts</h2>
                <button onClick={() => { setShowForm(true); setEditing(null); setForm({ discountType: "GROUP", minThreshold: "", discountRate: "" }); setError(""); setSuccess("") }}
                    style={{ background: "#F58426", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
                    + New discount
                </button>
            </div>

            {error && <div style={{ background: "#FCEBEB", color: "#A32D2D", padding: "10px 14px", borderRadius: 8, marginBottom: 16 }}>{error}</div>}
            {success && <div style={{ background: "#EAF3DE", color: "#3B6D11", padding: "10px 14px", borderRadius: 8, marginBottom: 16 }}>{success}</div>}

            {showForm && (
                <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: 24, marginBottom: 24 }}>
                    <h3 style={{ fontWeight: 500, margin: "0 0 20px" }}>{editing ? "Edit discount" : "New discount"}</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
                        <div>
                            <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>DISCOUNT TYPE</div>
                            <select value={form.discountType} onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))}
                                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14 }}>
                                <option value="GROUP">Group</option>
                                <option value="FREQUENT_CLIENT">Frequent client</option>
                                <option value="MULTIPLE_PACKAGES">Multiple packages</option>
                            </select>
                        </div>
                        <div>
                            <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>MIN THRESHOLD</div>
                            <input type="number" value={form.minThreshold}
                                onChange={e => setForm(f => ({ ...f, minThreshold: e.target.value }))}
                                placeholder="e.g. 6"
                                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box" }} />
                        </div>
                        <div>
                            <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>DISCOUNT RATE (0-1)</div>
                            <input type="number" step="0.01" value={form.discountRate}
                                onChange={e => setForm(f => ({ ...f, discountRate: e.target.value }))}
                                placeholder="e.g. 0.10"
                                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box" }} />
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                        <button onClick={handleSubmit}
                            style={{ background: "#F58426", color: "#fff", border: "none", padding: "10px 24px", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
                            {editing ? "Save changes" : "Create"}
                        </button>
                        <button onClick={() => { setShowForm(false); setEditing(null) }}
                            style={{ background: "#fff", border: "1px solid #ddd", padding: "10px 20px", borderRadius: 8, fontSize: 14, cursor: "pointer" }}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 120px", padding: "10px 16px", background: "#fafafa", borderBottom: "1px solid #eee", fontSize: 11, color: "#888", fontWeight: 500 }}>
                    <span>TYPE</span><span>MIN THRESHOLD</span><span>RATE</span><span>STATUS</span><span>ACTIONS</span>
                </div>
                {discounts.map(d => (
                    <div key={d.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 120px", padding: "12px 16px", borderBottom: "1px solid #f5f5f5", alignItems: "center", fontSize: 13 }}>
                        <span style={{ fontWeight: 500 }}>{d.discountType}</span>
                        <span>{d.minThreshold}</span>
                        <span>{(d.discountRate * 100).toFixed(0)}%</span>
                        <span style={{ fontSize: 11, fontWeight: 500, color: d.active ? "#3B6D11" : "#A32D2D" }}>
                            {d.active ? "Active" : "Inactive"}
                        </span>
                        <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => { setForm(d); setEditing(d.id); setShowForm(true); setError(""); setSuccess("") }}
                                style={{ background: "#006BB6", color: "#fff", border: "none", padding: "5px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer" }}>
                                Edit
                            </button>
                            <button onClick={() => handleToggle(d.id, d.active)}
                                style={{ background: "#fff", border: "1px solid #ddd", color: "#444", padding: "5px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer" }}>
                                {d.active ? "Disable" : "Enable"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default AdminDiscounts