import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import packageService from "../services/package.service"

const AvailablePackages = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [destination, setDestination] = useState(searchParams.get("destination") || "")
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "")
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "")
  const [tripType, setTripType] = useState("")

  const load = () => {
    setLoading(true)
    const hasFilters = destination || minPrice || maxPrice || tripType
    const call = hasFilters
      ? packageService.search({ destination, minPrice, maxPrice, tripType })
      : packageService.getAvailable()
    call
      .then(res => setPackages(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  return (
    <div>
      {/* Filtros */}
      <div style={{ background: "#f5f5f5", borderRadius: 12, padding: "16px 20px", marginBottom: 24, display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>Destination</div>
          <input value={destination} onChange={e => setDestination(e.target.value)}
            placeholder="e.g. Paris"
            style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #ddd", fontSize: 14, width: 160 }} />
        </div>
        <div>
          <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>Trip type</div>
          <input value={tripType} onChange={e => setTripType(e.target.value)}
            placeholder="e.g. Cultural"
            style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #ddd", fontSize: 14, width: 140 }} />
        </div>
        <div>
          <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>Min price</div>
          <input value={minPrice} onChange={e => setMinPrice(e.target.value)}
            type="number" placeholder="$ Min"
            style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #ddd", fontSize: 14, width: 100 }} />
        </div>
        <div>
          <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>Max price</div>
          <input value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
            type="number" placeholder="$ Max"
            style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #ddd", fontSize: 14, width: 100 }} />
        </div>
        <button onClick={load} style={{ background: "#F58426", color: "#fff", border: "none", padding: "9px 20px", borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
          Search
        </button>
        <button onClick={() => { setDestination(""); setMinPrice(""); setMaxPrice(""); setTripType("") }}
          style={{ background: "#fff", color: "#666", border: "1px solid #ddd", padding: "9px 16px", borderRadius: 6, fontSize: 14, cursor: "pointer" }}>
          Clear
        </button>
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 20 }}>
        Available packages {packages.length > 0 && <span style={{ fontSize: 14, color: "#888", fontWeight: 400 }}>({packages.length} results)</span>}
      </h2>

      {loading && <p style={{ color: "#888" }}>Loading...</p>}

      {!loading && packages.length === 0 && (
        <p style={{ color: "#888" }}>No packages found. Try different filters.</p>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        {packages.map(pkg => (
          <div key={pkg.id} style={{
            background: "#fff", border: "1px solid #eee", borderRadius: 12,
            overflow: "hidden", cursor: "pointer", transition: "box-shadow 0.2s"
          }} onClick={() => navigate(`/packages/${pkg.id}`)}>
            <div style={{ height: 160, background: "#BEC0C2", display: "flex", alignItems: "center", justifyContent: "center", color: "#7a7c7e", fontSize: 13 }}>
              {pkg.destination}
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 4 }}>{pkg.packageName}</div>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>{pkg.tripType}</div>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>
                {pkg.startDate} → {pkg.endDate} · {pkg.availableSlots} slots left
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 16, fontWeight: 500, color: "#006BB6" }}>${pkg.price.toLocaleString()}</span>
                <button
                  onClick={e => { e.stopPropagation(); navigate(`/packages/${pkg.id}`) }}
                  style={{ background: "#F58426", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
                  View details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AvailablePackages