import { useState } from "react"
import reportService from "../services/report.service"

const AdminReports = () => {
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [sales, setSales] = useState([])
    const [ranking, setRanking] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [generated, setGenerated] = useState(false)

    const handleGenerate = () => {
        if (!startDate || !endDate) { setError("Please select both dates."); return }
        if (startDate > endDate) { setError("Start date cannot be after end date."); return }
        setError("")
        setLoading(true)
        Promise.all([
            reportService.getSales(startDate, endDate),
            reportService.getRanking(startDate, endDate)
        ])
            .then(([salesRes, rankingRes]) => {
                setSales(salesRes.data)
                setRanking(rankingRes.data)
                setGenerated(true)
            })
            .catch(err => setError(err.response?.data?.message || "Error generating reports."))
            .finally(() => setLoading(false))
    }

    const statusColors = {
        PENDING: { bg: "#FAEEDA", color: "#854F0B" },
        CONFIRMED: { bg: "#EAF3DE", color: "#3B6D11" },
        CANCELLED: { bg: "#FCEBEB", color: "#A32D2D" },
        EXPIRED: { bg: "#F1EFE8", color: "#5F5E5A" },
    }

    return (
        <div>
            <h2 style={{ fontWeight: 500, marginBottom: 24 }}>Reports</h2>

            {/* Filtros */}
            <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: 20, marginBottom: 24, display: "flex", gap: 16, alignItems: "flex-end" }}>
                <div>
                    <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>START DATE</div>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                        style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14 }} />
                </div>
                <div>
                    <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>END DATE</div>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                        style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14 }} />
                </div>
                <button onClick={handleGenerate} disabled={loading}
                    style={{ background: "#006BB6", color: "#fff", border: "none", padding: "10px 24px", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
                    {loading ? "Generating..." : "Generate reports"}
                </button>
            </div>

            {error && <div style={{ background: "#FCEBEB", color: "#A32D2D", padding: "10px 14px", borderRadius: 8, marginBottom: 16 }}>{error}</div>}

            {generated && (
                <>
                    {/* Sales report */}
                    <h3 style={{ fontWeight: 500, marginBottom: 16 }}>
                        Sales by period
                        <span style={{ fontSize: 13, color: "#888", fontWeight: 400, marginLeft: 10 }}>({sales.length} reservations)</span>
                    </h3>
                    <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, overflow: "hidden", marginBottom: 32 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 1fr", padding: "10px 16px", background: "#fafafa", borderBottom: "1px solid #eee", fontSize: 11, color: "#888", fontWeight: 500 }}>
                            <span>CLIENT</span><span>PACKAGE</span><span>PASSENGERS</span><span>BASE</span><span>TOTAL</span><span>STATUS</span>
                        </div>
                        {sales.length === 0 && (
                            <div style={{ padding: "20px 16px", color: "#888", fontSize: 13 }}>No sales found for this period.</div>
                        )}
                        {sales.map(res => (
                            <div key={res.id} style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 1fr", padding: "12px 16px", borderBottom: "1px solid #f5f5f5", alignItems: "center", fontSize: 13 }}>
                                <div>
                                    <div style={{ fontWeight: 500 }}>{res.client?.fullName}</div>
                                    <div style={{ fontSize: 11, color: "#888" }}>{res.client?.email}</div>
                                </div>
                                <div>
                                    <div style={{ fontWeight: 500 }}>{res.travelPackage?.packageName}</div>
                                    <div style={{ fontSize: 11, color: "#888" }}>{res.travelPackage?.destination}</div>
                                </div>
                                <span>{res.quantity}</span>
                                <span style={{ color: "#999", textDecoration: "line-through" }}>${res.baseAmount?.toLocaleString()}</span>
                                <span style={{ fontWeight: 500, color: "#006BB6" }}>${res.totalAmount?.toLocaleString()}</span>
                                <span style={{
                                    fontSize: 11, padding: "3px 8px", borderRadius: 10, fontWeight: 500,
                                    background: statusColors[res.reservationStatus]?.bg,
                                    color: statusColors[res.reservationStatus]?.color
                                }}>
                                    {res.reservationStatus}
                                </span>
                            </div>
                        ))}
                        {sales.length > 0 && (
                            <div style={{ padding: "12px 16px", background: "#fafafa", display: "flex", justifyContent: "flex-end", gap: 24, fontSize: 13 }}>
                                <span style={{ color: "#666" }}>Total reservations: <strong>{sales.length}</strong></span>
                                <span style={{ color: "#666" }}>Total revenue: <strong style={{ color: "#006BB6" }}>${sales.reduce((s, r) => s + (r.totalAmount || 0), 0).toLocaleString()}</strong></span>
                            </div>
                        )}
                    </div>

                    {/* Ranking */}
                    <h3 style={{ fontWeight: 500, marginBottom: 16 }}>
                        Package ranking
                        <span style={{ fontSize: 13, color: "#888", fontWeight: 400, marginLeft: 10 }}>by number of reservations</span>
                    </h3>
                    <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, overflow: "hidden" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "40px 2fr 1fr 1fr 1fr", padding: "10px 16px", background: "#fafafa", borderBottom: "1px solid #eee", fontSize: 11, color: "#888", fontWeight: 500 }}>
                            <span>#</span><span>PACKAGE</span><span>RESERVATIONS</span><span>PASSENGERS</span><span>REVENUE</span>
                        </div>
                        {ranking.length === 0 && (
                            <div style={{ padding: "20px 16px", color: "#888", fontSize: 13 }}>No data for this period.</div>
                        )}
                        {ranking.map((item, index) => (
                            <div key={item.packageId} style={{ display: "grid", gridTemplateColumns: "40px 2fr 1fr 1fr 1fr", padding: "12px 16px", borderBottom: "1px solid #f5f5f5", alignItems: "center", fontSize: 13 }}>
                                <span style={{
                                    width: 24, height: 24, borderRadius: "50%", background: index === 0 ? "#F58426" : index === 1 ? "#006BB6" : "#BEC0C2",
                                    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 500
                                }}>{index + 1}</span>
                                <span style={{ fontWeight: 500 }}>{item.packageName}</span>
                                <span style={{ fontWeight: 500, color: "#006BB6" }}>{item.totalReservations}</span>
                                <span>{item.totalPassengers}</span>
                                <span style={{ fontWeight: 500 }}>${Number(item.totalAmount).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

export default AdminReports